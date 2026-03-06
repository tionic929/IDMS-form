<?php

namespace App\Http\Controllers;

use App\Events\ApplicationSubmitted;
use App\Models\Applicant as Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApplicantsController extends Controller
{
    /**
     * Store a new applicant record.
     * Used by the public "Submit Details" flow.
     *
     * 1. Validates input & looks up official names server-side
     * 2. Saves the student locally
     * 3. Proxies the full payload (with names) to the bridge URL
     * 4. Returns a sanitized response (no PII)
     */
    public function store(Request $request)
    {
        try {
            Log::info('New ID Application Request received', [
                'idNumber' => $request->idNumber,
                'has_id_picture' => $request->hasFile('id_picture'),
                'has_signature' => $request->hasFile('signature_picture')
            ]);

            $validated = $request->validate([
                'idNumber' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'address' => 'required|string|min:5',
                'guardianName' => 'required|string|max:255|min:3',
                'guardianContact' => 'required|string|max:20|min:8',
                'id_picture' => 'required|file|mimes:jpeg,png,jpg,webp',
                'signature_picture' => 'required|image|mimes:jpeg,png,jpg,webp',
                'payment_type' => 'required|string|in:COR,OR',
                'payment_proof' => 'required|file|mimes:jpeg,png,jpg,webp',
            ]);

            // Security Lookup: Retrieve official names from the central registry
            $student_record = \App\Models\Items::where('id_number', $validated['idNumber'])->first();

            if (!$student_record) {
                return response()->json([
                    'message' => 'Profile authentication failed. Your ID number was not found in our registry. Please contact the Registrar Office.',
                ], 422);
            }

            $idPath = null;
            if ($request->hasFile('id_picture')) {
                $idPath = $request->file('id_picture')->store('students/id_pictures', 'public');
            }

            $sigPath = null;
            if ($request->hasFile('signature_picture')) {
                $sigPath = $request->file('signature_picture')->store('students/signatures', 'public');
            }

            $paymentPath = null;
            if ($request->hasFile('payment_proof')) {
                $paymentPath = $request->file('payment_proof')->store('students/payment_proofs', 'public');
            }

            // Build the full student data with server-resolved names
            $studentData = [
                'id_number' => strtoupper($validated['idNumber']),
                'first_name' => strtoupper($student_record->first_name),
                'middle_initial' => strtoupper(substr($student_record->middle_name ?? '', 0, 1)),
                'last_name' => strtoupper($student_record->last_name),
                'email' => strtolower($validated['email']),
                'course' => strtoupper($student_record->course),
                'address' => strtoupper($validated['address']),
                'guardian_name' => strtoupper($validated['guardianName']),
                'guardian_contact' => $validated['guardianContact'],
                'id_picture' => $idPath,
                'signature_picture' => $sigPath,
                'payment_type' => strtoupper($validated['payment_type']),
                'payment_proof' => $paymentPath,
            ];

            $student = Student::create($studentData);

            broadcast(new ApplicationSubmitted($student))->toOthers();

            // --- Proxy to bridge URL (names included, hidden from frontend) ---
            $bridgeUrl = config('services.bridge.url');

            if ($bridgeUrl) {
                try {
                    $bridgeRequest = Http::timeout(30)
                        ->withHeaders(['ngrok-skip-browser-warning' => 'true']);

                    // Attach uploaded files
                    if ($request->hasFile('id_picture')) {
                        $idFile = $request->file('id_picture');
                        $bridgeRequest = $bridgeRequest->attach(
                            'id_picture',
                            file_get_contents($idFile->getRealPath()),
                            $idFile->getClientOriginalName()
                        );
                    }

                    if ($request->hasFile('signature_picture')) {
                        $sigFile = $request->file('signature_picture');
                        $bridgeRequest = $bridgeRequest->attach(
                            'signature_picture',
                            file_get_contents($sigFile->getRealPath()),
                            $sigFile->getClientOriginalName()
                        );
                    }

                    if ($request->hasFile('payment_proof')) {
                        $payFile = $request->file('payment_proof');
                        $bridgeRequest = $bridgeRequest->attach(
                            'payment_proof',
                            file_get_contents($payFile->getRealPath()),
                            $payFile->getClientOriginalName()
                        );
                    }

                    $bridgeRequest->post("{$bridgeUrl}/application-submit", [
                        'idNumber' => $studentData['id_number'],
                        'firstName' => $studentData['first_name'],
                        'middleInitial' => $studentData['middle_initial'],
                        'lastName' => $studentData['last_name'],
                        'email' => $studentData['email'],
                        'course' => $studentData['course'],
                        'address' => $studentData['address'],
                        'guardianName' => $studentData['guardian_name'],
                        'guardianContact' => $studentData['guardian_contact'],
                        'paymentType' => $studentData['payment_type'],
                    ]);

                    Log::info('Application proxied to bridge successfully', [
                        'idNumber' => $studentData['id_number'],
                    ]);
                }
                catch (\Exception $bridgeError) {
                    // Log but don't fail — the local save succeeded
                    Log::warning('Bridge proxy failed (local save OK)', [
                        'error' => $bridgeError->getMessage(),
                    ]);
                }
            }

            // Sanitized response — no PII returned to the frontend
            return response()->json([
                'message' => 'Application submitted successfully!',
                'id_number' => $student->id_number,
            ], 201);

        }
        catch (\Exception $e) {
            Log::error('Student upload failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error saving student',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}