<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\ApplicantsController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\AnalyticsController;

/* |-------------------------------------------------------------------------- | API Routes |-------------------------------------------------------------------------- */

// Public / Auth Routes
Route::post('/login', [AuthController::class , 'login'])->name('login');

// Public ID Application Submission (5 requests/min per IP)
Route::post('/students', [ApplicantsController::class , 'store'])->middleware('throttle:5,1')->name('applicants.store');

// Public ID Number Verification (10 requests/min per IP)
Route::post('/reports/verify', [ReportsController::class , 'verifyIdNumber'])->middleware('throttle:10,1');

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {

    // User Context
    Route::get('/user', function (Request $request) {
            return $request->user();
        }
        );

        Route::post('/logout', [AuthController::class , 'logout']);

        // Admin Analytics & Dashboard
        Route::get('/analytics/dashboard', [AnalyticsController::class , 'getDashboardStats']);
        Route::get('/get-departments', [DepartmentsController::class , 'getApplicantsByDepartments']);

        // Report Management
        Route::post('/import', [ReportsController::class , 'import']);
        Route::get('/all-imported-reports', [ReportsController::class , 'getImportedReports']);

        // User Management
        Route::resource('users', UsersController::class);
    });
