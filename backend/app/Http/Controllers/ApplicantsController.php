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
     * Store a new applicant record or update an existing one for reissuance.
     * Used by the public "Submit Details" flow.
     */
    public function store(Request $request)
    {
        try {
            Log::info('New ID Application Request received', [
                'idNumber' => $request->idNumber,
                'has_id_picture' => $request->hasFile('id_picture'),
                'has_signature' => $request->hasFile('signature_picture')
            ]);

            $idNumber = trim($request->idNumber);
            $isReissuance = Student::where('id_number', $idNumber)->exists();

            $validated = $request->validate([
                'idNumber' => 'required|string|max:255',
                'manual_full_name' => 'required|string|max:255|min:3',
                'email' => 'required|email|max:255',
                'address' => 'required|string|min:5',
                'guardianName' => 'required|string|max:255|min:3',
                'guardianContact' => 'required|digits:11',
                'id_picture' => [
                    $isReissuance ? 'nullable' : 'required',
                    'file', 'mimes:jpeg,png,jpg,webp'
                ],
                'signature_picture' => [
                    $isReissuance ? 'nullable' : 'required',
                    'image', 'mimes:jpeg,png,jpg,webp'
                ],
                'payment_type' => 'required|string|in:COR,OR',
                'payment_proof' => 'required|file|mimes:jpeg,png,jpg,webp',
                'reissuance_reason' => 'nullable|string|max:255',
                'course' => 'nullable|string|max:255',
            ]);

            $idNumber = trim($validated['idNumber']);
            // Security Lookup: Retrieve official names from the central registry
            $student_record = \App\Models\Items::where('id_number', $idNumber)->first();

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
                'id_number' => strtoupper($idNumber),
                'first_name' => strtoupper($student_record->first_name),
                'middle_initial' => strtoupper(substr($student_record->middle_name ?? '', 0, 1)),
                'last_name' => strtoupper($student_record->last_name),
                'manual_full_name' => strtoupper($validated['manual_full_name']),
                'email' => strtolower($validated['email']),
                'course' => strtoupper($validated['course'] ?? $student_record->course),
                'address' => strtoupper($validated['address']),
                'guardian_name' => strtoupper($validated['guardianName']),
                'guardian_contact' => $validated['guardianContact'],
                'payment_type' => strtoupper($validated['payment_type']),
                'payment_proof' => $paymentPath,
                'reissuance_reason' => $validated['reissuance_reason'] ?? null,
                'is_archived' => false,
                'archived_at' => null,
            ];

            if ($idPath) $studentData['id_picture'] = $idPath;
            if ($sigPath) $studentData['signature_picture'] = $sigPath;

            // Update if exists, else create
            $student = Student::updateOrCreate(
                ['id_number' => $studentData['id_number']],
                $studentData
            );

            broadcast(new ApplicationSubmitted($student))->toOthers();

            // Bridge proxy (optional, but maintained)
            $this->proxyToBridge($request, $studentData);

            return response()->json([
                'message' => 'Application submitted successfully!',
                'id_number' => $student->id_number,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Student upload failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error saving student', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Check if a student ID already exists in the system.
     */
    public function checkExistingRecord(Request $request)
    {
        $validated = $request->validate(['idNumber' => 'required|string']);
        $idNumber = trim($validated['idNumber']);
        $student = Student::where('id_number', $idNumber)->first();

        if ($student) {
            return response()->json([
                'exists' => true,
                'data' => [
                    'idNumber' => $student->id_number,
                    'email' => $student->email,
                    'address' => $student->address,
                    'guardianName' => $student->guardian_name,
                    'guardianContact' => $student->guardian_contact,
                    // Note: Sensitive files are not pre-filled for security, 
                    // but paths are kept to avoid re-upload if not changed (handled in frontend).
                ]
            ]);
        }

        return response()->json(['exists' => false]);
    }

    /**
     * Archive an applicant record.
     */
    public function archive($id)
    {
        $student = Student::findOrFail($id);
        $student->update([
            'is_archived' => true,
            'archived_at' => now()
        ]);

        Log::info('Applicant archived', [
            'admin_id' => auth()->id(),
            'student_id' => $student->id,
            'id_number' => $student->id_number,
            'timestamp' => now()
        ]);

        return response()->json(['message' => 'Record moved to archive.']);
    }

    /**
     * Permanently delete an applicant record.
     */
    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        if (!$student->is_archived) {
            return response()->json(['message' => 'Only archived records can be permanently deleted.'], 400);
        }

        $student->delete();

        Log::warning('Applicant permanently deleted', [
            'admin_id' => auth()->id(),
            'student_id' => $student->id,
            'id_number' => $student->id_number,
            'timestamp' => now()
        ]);

        return response()->json(['message' => 'Record permanently deleted.']);
    }

    /**
     * Get archived records.
     */
    public function getArchived()
    {
        $archived = Student::archived()->orderBy('archived_at', 'desc')->get();
        return response()->json($archived);
    }

    /**
     * Helper to proxy data to bridge URL.
     */
    private function proxyToBridge(Request $request, array $studentData)
    {
        $bridgeUrl = config('services.bridge.url');
        if (!$bridgeUrl) return;

        try {
            $bridgeRequest = Http::timeout(30)->withHeaders(['ngrok-skip-browser-warning' => 'true']);

            if ($request->hasFile('id_picture')) {
                $file = $request->file('id_picture');
                $bridgeRequest = $bridgeRequest->attach('id_picture', file_get_contents($file->getRealPath()), $file->getClientOriginalName());
            }

            if ($request->hasFile('signature_picture')) {
                $file = $request->file('signature_picture');
                $bridgeRequest = $bridgeRequest->attach('signature_picture', file_get_contents($file->getRealPath()), $file->getClientOriginalName());
            }

            if ($request->hasFile('payment_proof')) {
                $file = $request->file('payment_proof');
                $bridgeRequest = $bridgeRequest->attach('payment_proof', file_get_contents($file->getRealPath()), $file->getClientOriginalName());
            }

            $bridgeRequest->post("{$bridgeUrl}/application-submit", array_merge($studentData, [
                'idNumber' => $studentData['id_number'],
                'firstName' => $studentData['first_name'],
                'middleInitial' => $studentData['middle_initial'],
                'lastName' => $studentData['last_name'],
                'paymentType' => $studentData['payment_type'],
            ]));
        } catch (\Exception $e) {
            Log::warning('Bridge proxy failed (local save OK)', ['error' => $e->getMessage()]);
        }
    }
}