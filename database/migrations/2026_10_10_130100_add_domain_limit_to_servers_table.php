<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDomainLimitToServersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('servers', function (Blueprint $table) {
            if (!Schema::hasColumn('servers', 'domain_limit')) {
                $table->integer('domain_limit')->default(0)->after('backup_limit');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('servers', function (Blueprint $table) {
            if (Schema::hasColumn('servers', 'domain_limit')) {
                $table->dropColumn('domain_limit');
            }
        });
    }
}
