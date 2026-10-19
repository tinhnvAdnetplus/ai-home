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
        Schema::create('config_versions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('config_document_id')->constrained('config_documents')->cascadeOnDelete();
            $table->unsignedInteger('version');
            $table->string('status', 32);
            $table->boolean('is_draft')->nullable();
            $table->unsignedSmallInteger('schema_version');
            $table->json('payload');
            $table->char('payload_hash', 64);
            $table->string('label', 120)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('based_on_version_id')->nullable()->constrained('config_versions')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['config_document_id', 'version']);
            $table->unique(['config_document_id', 'is_draft']);
            $table->index(['config_document_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('config_versions');
    }
};
