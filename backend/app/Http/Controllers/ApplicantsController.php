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
     * Store a new applicant record (Student mode).
     * Requires full details including guardian info.
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
                'id_picture' => [$isReissuance ? 'nullable' : 'required', 'file', 'mimes:jpeg,png,jpg,webp'],
                'signature_picture' => [$isReissuance ? 'nullable' : 'required', 'image', 'mimes:jpeg,png,jpg,webp'],
                'payment_type' => 'required|string|in:COR,OR',
                'payment_proof' => 'required|file|mimes:jpeg,png,jpg,webp',
                'reissuance_reason' => 'nullable|string|max:255',
                'course' => 'nullable|string|max:255',
            ]);

            $idNumber = strtoupper(trim($validated['idNumber']));
            $idPath = $request->hasFile('id_picture') ? $request->file('id_picture')->store('students/id_pictures', 'public') : null;
            $sigPath = $request->hasFile('signature_picture') ? $request->file('signature_picture')->store('students/signatures', 'public') : null;
            $paymentPath = $request->hasFile('payment_proof') ? $request->file('payment_proof')->store('students/payment_proofs', 'public') : null;

            $nameParts = explode(' ', trim($validated['manual_full_name']));
            $lastName = array_pop($nameParts);
            $firstName = implode(' ', $nameParts);
            if (empty($firstName)) {
                $firstName = $lastName;
                $lastName = '';
            }

            $studentData = [
                'id_number' => $idNumber,
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

            $student = Student::updateOrCreate(
                ['id_number' => $studentData['id_number']],
                $studentData
            );

            broadcast(new ApplicationSubmitted($student))->toOthers();

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
     * Guardian info is not required — employees don't have guardians.
     */
    public function storeEmployee(Request $request)
    {
        try {
            Log::info('New Employee ID Application Request received', [
                'idNumber' => $request->idNumber,
                'has_id_picture' => $request->hasFile('id_picture'),
            ]);

            $idNumber = trim($request->idNumber);
            $isReissuance = Student::where('id_number', $idNumber)->exists();

            $validated = $request->validate([
                'idNumber' => 'required|string|max:255',
                'manual_full_name' => 'required|string|max:255|min:3',
                'email' => 'required|email|max:255',
                'address' => 'required|string|min:5',
                'department' => 'nullable|string|max:255',
                'id_picture' => [$isReissuance ? 'nullable' : 'required', 'file', 'mimes:jpeg,png,jpg,webp'],
                'payment_type' => 'nullable|string',
                'payment_proof' => 'nullable|file|mimes:jpeg,png,jpg,webp',
                'reissuance_reason' => 'nullable|string|max:255',
            ]);

            $idNumber = strtoupper(trim($validated['idNumber']));
            $idPath = $request->hasFile('id_picture') ? $request->file('id_picture')->store('students/id_pictures', 'public') : null;

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
                'department' => strtoupper($validated['department'] ?? ''),
                'address' => strtoupper($validated['address']),
                'course' => 'EMPLOYEE',
                'guardian_name' => '',
                'guardian_contact' => '',
                'reissuance_reason' => $validated['reissuance_reason'] ?? null,
                'is_archived' => false,
                'archived_at' => null,
                'application_status' => 'pending',
            ];

            if ($idPath)
                $employeeData['id_picture'] = $idPath;

            $student = Student::updateOrCreate(
                ['id_number' => $employeeData['id_number']],
                $employeeData
            );

            broadcast(new ApplicationSubmitted($student))->toOthers();

            $this->proxyToBridgeEmployee($employeeData, $idPath);

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
                ]
            ]);
        }

        return response()->json(['exists' => false]);
    }

    /**
     * Send OTP email via Google SMTP.
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
     * Permanently delete an applicant record (archived only).
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

    // -------------------------------------------------------------------------
    // PRIVATE BRIDGE HELPERS
    // -------------------------------------------------------------------------

    /**
     * Proxy a STUDENT application to the bridge.
     * Sends full payload: guardian name, guardian contact, course.
     */
    private function proxyToBridge(array $studentData, ?string $idPath, ?string $sigPath, ?string $paymentPath)
    {
        $payload = [
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
        ];

        $this->dispatchBridgeRequest('application-submit', $payload, $idPath, $sigPath, $paymentPath);
    }

    /**
     * Proxy an EMPLOYEE application to the bridge.
     * Excludes guardian info — not relevant for employees.
     */
    private function proxyToBridgeEmployee(array $employeeData, ?string $idPath)
    {
        $payload = [
            'idNumber' => $employeeData['id_number'],
            'firstName' => $employeeData['first_name'],
            'middleInitial' => $employeeData['middle_initial'],
            'lastName' => $employeeData['last_name'],
            'manual_full_name' => $employeeData['manual_full_name'],
            'email' => $employeeData['email'],
            'course' => 'EMPLOYEE',
            'department' => $employeeData['department'] ?? '',
            'address' => $employeeData['address'],
            'reissuance_reason' => $employeeData['reissuance_reason'] ?? '',
        ];

        // No sigPath and No paymentPath for employees — pass null
        $this->dispatchBridgeRequest('employee-application-submit', $payload, $idPath, null, null);
    }

    /**
     * Resolve storage paths to absolute disk paths for file attachment.
     */
    private function resolveFilePaths(?string $idPath, ?string $sigPath, ?string $paymentPath): array
    {
        $resolved = [];
        if ($idPath)
            $resolved['id_picture'] = storage_path("app/public/{$idPath}");
        if ($sigPath)
            $resolved['signature_picture'] = storage_path("app/public/{$sigPath}");
        if ($paymentPath)
            $resolved['payment_proof'] = storage_path("app/public/{$paymentPath}");
        return $resolved;
    }

    /**
     * Build and fire the HTTP request to the bridge.
     * Runs synchronously in debug mode, afterResponse in production.
     */
    private function dispatchBridgeRequest(string $route, array $payload, ?string $idPath, ?string $sigPath, ?string $paymentPath)
    {
        $bridgeUrl = config('services.bridge.url');
        if (!$bridgeUrl) {
            Log::warning('Bridge proxy skipped: BRIDGE_URL not set in .env');
            return;
        }

        if (request()->header('X-Bridge-Source') === 'true') {
            Log::info('Bridge proxy skipped: Request originated from bridge');
            return;
        }

        $resolvedPaths = $this->resolveFilePaths($idPath, $sigPath, $paymentPath);
        $endpoint = "{$bridgeUrl}/{$route}";

        $logic = function () use ($endpoint, $payload, $resolvedPaths) {
            try {
                Log::info("Attempting bridge proxy to: {$endpoint}");

                $http = \Illuminate\Support\Facades\Http::timeout(60)
                    ->withHeaders([
                        'ngrok-skip-browser-warning' => 'true',
                        'Accept' => 'application/json',
                    ]);

                foreach ($resolvedPaths as $field => $absolutePath) {
                    if (file_exists($absolutePath)) {
                        $http = $http->attach($field, file_get_contents($absolutePath), basename($absolutePath));
                    }
                }

                $response = $http->post($endpoint, $payload);

                if ($response->successful()) {
                    Log::info('Bridge proxy succeeded', ['endpoint' => $endpoint]);
                } else {
                    Log::error('Bridge proxy returned error', [
                        'endpoint' => $endpoint,
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Bridge proxy exception', [
                    'endpoint' => $endpoint,
                    'error' => $e->getMessage(),
                ]);
            }
        };

        if (config('app.debug')) {
            $logic();
        } else {
            dispatch($logic)->afterResponse();
        }
    }
}