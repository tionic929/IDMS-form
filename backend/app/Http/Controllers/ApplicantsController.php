<?php

namespace App\Http\Controllers;

use App\Events\ApplicationSubmitted;
use App\Models\Applicant as Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ApplicantsController extends Controller
{
    /**
     * Store a new applicant record.
     * Used by the public "Submit Details" flow.
     */
    public function store(Request $request)
    {
        try {
            \Log::info('New ID Application Request received', [
                'idNumber' => $request->idNumber,
                'has_id_picture' => $request->hasFile('id_picture'),
                'has_signature' => $request->hasFile('signature_picture')
            ]);

            $validated = $request->validate([
                'idNumber' => 'required|string|max:255',
                'course' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'address' => 'required|string',
                'guardianName' => 'required|string|max:255',
                'guardianContact' => 'required|string|max:20',
                'id_picture' => 'nullable|file|mimes:jpeg,png,jpg,webp',
                'signature_picture' => 'nullable|image|mimes:jpeg,png,jpg,webp',
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

            $student = Student::create([
                'id_number' => strtoupper($validated['idNumber']),
                'first_name' => strtoupper($student_record->first_name),
                'middle_initial' => strtoupper(substr($student_record->middle_name ?? '', 0, 1)),
                'last_name' => strtoupper($student_record->last_name),
                'email' => strtolower($validated['email']),
                'course' => strtoupper($validated['course']),
                'address' => strtoupper($validated['address']),
                'guardian_name' => strtoupper($validated['guardianName']),
                'guardian_contact' => $validated['guardianContact'],
                'id_picture' => $idPath,
                'signature_picture' => $sigPath,
            ]);

            broadcast(new ApplicationSubmitted($student))->toOthers();

            return response()->json([
                'message' => 'Student saved successfully',
                'data' => $student
            ], 201);

        }
        catch (\Exception $e) {
            \Log::error('Student upload failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error saving student',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}