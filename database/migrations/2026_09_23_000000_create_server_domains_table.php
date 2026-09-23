<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('server_domains', function (Blueprint $table) {
            $table->id();
            $table->integer('server_id')->unsigned();
            $table->string('domain')->unique();
            $table->string('cf_hostname_id')->nullable();
            $table->string('status')->default('pending');
            $table->string('verification_cname_name')->nullable();
            $table->string('verification_cname_target')->nullable();
            $table->timestamps();

            $table->foreign('server_id')->references('id')->on('servers')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('server_domains');
    }
};
