<?php

namespace App\Http\Controllers;

use App\Events\ApplicationSubmitted;
use App\Models\Applicant as Student;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
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
                    'file',
                    'mimes:jpeg,png,jpg,webp'
                ],
                'signature_picture' => [
                    $isReissuance ? 'nullable' : 'required',
                    'image',
                    'mimes:jpeg,png,jpg,webp'
                ],
                'payment_type' => 'required|string|in:COR,OR',
                'payment_proof' => 'required|file|mimes:jpeg,png,jpg,webp',
                'reissuance_reason' => 'nullable|string|max:255',
                'course' => 'nullable|string|max:255',
            ]);

            $idNumber = trim($validated['idNumber']);

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

            // Provide fallback structured names based on full name
            $nameParts = explode(' ', trim($validated['manual_full_name']));
            $lastName = array_pop($nameParts);
            $firstName = implode(' ', $nameParts);
            if (empty($firstName)) {
                $firstName = $lastName;
                $lastName = '';
            }

            // Build the full student data with manual applicant names
            $studentData = [
                'id_number' => strtoupper($idNumber),
                'first_name' => strtoupper($firstName),
                'middle_initial' => '',
                'last_name' => strtoupper($lastName),
                'manual_full_name' => strtoupper($validated['manual_full_name']),
                'email' => strtolower($validated['email']),
                'course' => strtoupper($validated['course'] ?? ''),
                'address' => strtoupper($validated['address']),
                'guardian_name' => strtoupper($validated['guardianName']),
                'guardian_contact' => $validated['guardianContact'],
                'payment_type' => strtoupper($validated['payment_type']),
                'payment_proof' => $paymentPath,
                'reissuance_reason' => $validated['reissuance_reason'] ?? null,
                'is_archived' => false,
                'archived_at' => null,
                'application_status' => 'pending',
            ];

            if ($idPath)
                $studentData['id_picture'] = $idPath;
            if ($sigPath)
                $studentData['signature_picture'] = $sigPath;

            // Update if exists, else create
            $student = Student::updateOrCreate(
                ['id_number' => $studentData['id_number']],
                $studentData
            );

            broadcast(new ApplicationSubmitted($student))->toOthers();

            // Bridge proxy — pass saved paths so dispatch closure can read files cleanly
            $this->proxyToBridge($studentData, $idPath, $sigPath, $paymentPath);

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
     * Store a new applicant record (Employee mode).
     * Guardian info and course are NOT required for employees.
     */
    public function storeEmployee(Request $request)
    {
        try {
            Log::info('New Employee ID Application Request received', [
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
                'position' => 'nullable|string|max:255',
                'department' => 'nullable|string|max:255',
                'id_picture' => [$isReissuance ? 'nullable' : 'required', 'file', 'mimes:jpeg,png,jpg,webp'],
                'signature_picture' => [$isReissuance ? 'nullable' : 'required', 'image', 'mimes:jpeg,png,jpg,webp'],
                'payment_type' => 'required|string',
                'payment_proof' => 'required|file|mimes:jpeg,png,jpg,webp',
                'reissuance_reason' => 'nullable|string|max:255',
            ]);

            $idNumber = strtoupper(trim($validated['idNumber']));
            $idPath = $request->hasFile('id_picture') ? $request->file('id_picture')->store('students/id_pictures', 'public') : null;
            $sigPath = $request->hasFile('signature_picture') ? $request->file('signature_picture')->store('students/signatures', 'public') : null;
            $paymentPath = $request->hasFile('payment_proof') ? $request->file('payment_proof')->store('students/payment_proofs', 'public') : null;

            $nameParts = explode(' ', trim($validated['manual_full_name']));
            $lastName = array_pop($nameParts);
            $firstName = implode(' ', $nameParts) ?: $lastName;

            $employeeData = [
                'id_number' => $idNumber,
                'first_name' => strtoupper($firstName),
                'middle_initial' => '',
                'last_name' => strtoupper($lastName),
                'manual_full_name' => strtoupper($validated['manual_full_name']),
                'email' => strtolower($validated['email']),
                'address' => strtoupper($validated['address']),
                'guardian_name' => '',
                'guardian_contact' => '',
                'payment_type' => strtoupper($validated['payment_type']),
                'payment_proof' => $paymentPath,
                'reissuance_reason' => $validated['reissuance_reason'] ?? null,
                'is_archived' => false,
                'archived_at' => null,
                'application_status' => 'pending',
            ];

            if ($idPath)
                $employeeData['id_picture'] = $idPath;
            if ($sigPath)
                $employeeData['signature_picture'] = $sigPath;

            $student = Student::updateOrCreate(
                ['id_number' => $employeeData['id_number']],
                $employeeData
            );

            broadcast(new ApplicationSubmitted($student))->toOthers();

            $this->proxyToBridgeEmployee($employeeData, $idPath, $sigPath, $paymentPath);

            return response()->json([
                'message' => 'Employee application submitted successfully!',
                'id_number' => $student->id_number,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Employee upload failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error saving employee application', 'error' => $e->getMessage()], 500);
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
                    'manual_full_name' => $student->manual_full_name,
                    'address' => $student->address,
                    'guardianName' => $student->guardian_name,
                    'guardianContact' => $student->guardian_contact,
                    'course' => $student->course,
                    // Note: Sensitive files are not pre-filled for security, 
                    // but paths are kept to avoid re-upload if not changed (handled in frontend).
                ]
            ]);
        }

        return response()->json(['exists' => false]);
    }

    /**
     * Send OTP email via Google SMTP
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        try {
            Mail::to($request->email)->send(new OtpMail($request->code));
            return response()->json(['message' => 'OTP sent successfully']);
        } catch (\Exception $e) {
            Log::error('OTP send failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to send OTP'], 500);
        }
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
    }    /**
         * Helper to proxy data to bridge URL.
         */
    private function proxyToBridge(array $studentData, ?string $idPath, ?string $sigPath, ?string $paymentPath)
    {
        $bridgeUrl = config('services.bridge.url');
        if (!$bridgeUrl) {
            Log::warning('Bridge proxy skipped: BRIDGE_URL not set in .env');
            return;
        }

        // Check if the request already came from the bridge to prevent infinite loops
        if (request()->header('X-Bridge-Source') === 'true') {
            Log::info('Bridge proxy skipped: Request originated from bridge');
            return;
        }

        // Resolve absolute disk paths once
        $resolvedPaths = [];
        if ($idPath)
            $resolvedPaths['id_picture'] = storage_path("app/public/{$idPath}");
        if ($sigPath)
            $resolvedPaths['signature_picture'] = storage_path("app/public/{$sigPath}");
        if ($paymentPath)
            $resolvedPaths['payment_proof'] = storage_path("app/public/{$paymentPath}");

        $logic = function () use ($bridgeUrl, $studentData, $resolvedPaths) {
            try {
                Log::info("Attempting bridge proxy to: {$bridgeUrl}");

                $http = \Illuminate\Support\Facades\Http::timeout(60)
                    ->withHeaders([
                        'ngrok-skip-browser-warning' => 'true',
                        'Accept' => 'application/json'
                    ]);

                // Attach files by reading from disk
                foreach ($resolvedPaths as $field => $absolutePath) {
                    if (file_exists($absolutePath)) {
                        $http = $http->attach($field, file_get_contents($absolutePath), basename($absolutePath));
                    }
                }

                $response = $http->post("{$bridgeUrl}/application-submit", [
                    'idNumber' => $studentData['id_number'],
                    'firstName' => $studentData['first_name'],
                    'middleInitial' => $studentData['middle_initial'],
                    'lastName' => $studentData['last_name'],
                    'manual_full_name' => $studentData['manual_full_name'],
                    'email' => $studentData['email'],
                    'course' => $studentData['course'] ?? '',
                    'address' => $studentData['address'],
                    'guardianName' => $studentData['guardian_name'],
                    'guardianContact' => $studentData['guardian_contact'],
                    'paymentType' => $studentData['payment_type'],
                    'reissuance_reason' => $studentData['reissuance_reason'] ?? '',
                ]);

                if ($response->successful()) {
                    Log::info('Bridge proxy succeeded');
                } else {
                    Log::error('Bridge proxy returned error', [
                        'status' => $response->status(),
                        'body' => $response->body()
                    ]);
                }

            } catch (\Exception $e) {
                Log::error('Bridge proxy exception', [
                    'error' => $e->getMessage(),
                ]);
            }
        };

        // If in debug mode or for immediate feedback, run synchronously. 
        // Otherwise use afterResponse for performance.
        if (config('app.debug')) {
            $logic();
        } else {
            dispatch($logic)->afterResponse();
        }
    }
}