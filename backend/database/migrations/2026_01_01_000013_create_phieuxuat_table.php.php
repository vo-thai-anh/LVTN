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
        Schema::create('phieuxuat', function (Blueprint $table) {
            $table->id('phieu_xuat_id');
            $table->date('ngay_xuat')->nullable();
            $table->decimal('tong_tien', 10, 2)->nullable();
            $table->string('ghi_chu')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phieuxuat');
    }
};
