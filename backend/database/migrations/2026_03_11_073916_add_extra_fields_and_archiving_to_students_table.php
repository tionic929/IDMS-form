<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('reissuance_reason')->nullable();
            $table->string('manual_full_name')->nullable()->after('last_name');
            $table->boolean('is_archived')->default(false)->after('updated_at');
            $table->timestamp('archived_at')->nullable()->after('is_archived');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'reissuance_reason',
                'manual_full_name',
                'is_archived',
                'archived_at'
            ]);
        });
    }
};
