<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('config_audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('config_document_id')->constrained('config_documents')->cascadeOnDelete();
            $table->foreignId('config_version_id')->nullable()->constrained('config_versions')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 32);
            $table->json('summary')->nullable();
            $table->string('request_id', 64)->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['config_document_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('config_audit_logs');
    }
};
