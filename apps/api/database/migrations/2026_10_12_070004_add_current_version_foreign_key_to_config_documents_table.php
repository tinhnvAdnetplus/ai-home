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
        Schema::table('config_documents', function (Blueprint $table): void {
            $table->foreign('current_version_id')
                ->references('id')
                ->on('config_versions')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('config_documents', function (Blueprint $table): void {
            $table->dropForeign(['current_version_id']);
        });
    }
};
