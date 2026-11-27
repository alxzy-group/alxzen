<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'server_create_limit')) {
                $table->unsignedInteger('server_create_limit')->nullable()->after('root_admin');
            }
            if (!Schema::hasColumn('users', 'memory_create_limit')) {
                $table->unsignedInteger('memory_create_limit')->nullable()->after('server_create_limit');
            }
            if (!Schema::hasColumn('users', 'disk_create_limit')) {
                $table->unsignedInteger('disk_create_limit')->nullable()->after('memory_create_limit');
            }
            if (!Schema::hasColumn('users', 'cpu_create_limit')) {
                $table->unsignedInteger('cpu_create_limit')->nullable()->after('disk_create_limit');
            }
        });

        Schema::table('servers', function (Blueprint $table) {
            if (!Schema::hasColumn('servers', 'created_by')) {
                $table->unsignedInteger('created_by')->nullable()->after('owner_id');
                $table->index('created_by');
                $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('servers', function (Blueprint $table) {
            if (Schema::hasColumn('servers', 'created_by')) {
                $table->dropForeign(['created_by']);
                $table->dropIndex(['created_by']);
                $table->dropColumn('created_by');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            foreach (['cpu_create_limit', 'disk_create_limit', 'memory_create_limit', 'server_create_limit'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
