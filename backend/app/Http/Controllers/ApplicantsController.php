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
                'firstName' => 'required|string|max:255',
                'middleInitial' => 'nullable|string|max:1',
                'lastName' => 'required|string|max:255',
                'course' => 'required|string|max:255',
                'address' => 'required|string',
                'guardianName' => 'required|string|max:255',
                'guardianContact' => 'required|string|max:20',
                'id_picture' => 'nullable|file|mimes:jpeg,png,jpg,webp',
                'signature_picture' => 'nullable|image|mimes:jpeg,png,jpg,webp',
            ]);

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
                'first_name' => strtoupper($validated['firstName']),
                'middle_initial' => strtoupper($validated['middleInitial'] ?? ''),
                'last_name' => strtoupper($validated['lastName']),
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