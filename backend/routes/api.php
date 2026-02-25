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
Route::post('/register', [AuthController::class , 'register'])->name('register');

// Public ID Application Submission
Route::post('/students', [ApplicantsController::class , 'store'])->name('applicants.store');

// Public ID Number Verification
Route::post('/reports/verify', [ReportsController::class , 'verifyIdNumber']);

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
        Route::resource('users', UsersController::class);    });
