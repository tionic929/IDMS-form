<?php

namespace App\Http\Controllers;

use App\Models\Applicant as Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ApplicationStatusController extends Controller
{
    /**
     * Get the current status of an application
     */
    public function status($idNumber)
    {
        $student = Student::where('id_number', $idNumber)->first();

        if (!$student) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        return response()->json([
            'status' => $student->application_status,
            'rejection_reason' => $student->rejection_reason
        ]);
    }

    /**
     * Approve an application (called from idTech bridge or admin UI)
     */
    public function approve(Request $request, $idNumber)
    {
        // TODO: In a production environment, this should be protected by an API key or auth token.
        // For now, it accepts requests from the idTech backend.
        $student = Student::where('id_number', $idNumber)->first();

        if (!$student) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        $student->update([
            'application_status' => 'approved',
            'has_card' => true // kept for backward compatibility if needed, though application_status is better
        ]);
        
        Log::info('Application approved via API', ['id_number' => $idNumber]);

        return response()->json(['message' => 'Application approved successfully', 'status' => 'approved']);
    }

    /**
     * Reject an application (called from idTech bridge or admin UI)
     */
    public function reject(Request $request, $idNumber)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $student = Student::where('id_number', $idNumber)->first();

        if (!$student) {
            return response()->json(['message' => 'Application not found'], 404);
        }

        $student->update([
            'application_status' => 'rejected',
            'rejection_reason' => $request->reason
        ]);
        
        Log::info('Application rejected via API', ['id_number' => $idNumber, 'reason' => $request->reason]);

        return response()->json(['message' => 'Application rejected successfully', 'status' => 'rejected']);
    }
}
