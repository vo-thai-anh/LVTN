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
        Schema::create('phieunhap', function (Blueprint $table) {
            $table->id('phieu_nhap_id');
            $table->foreignId('sach')->references('sach_id')->on('sach');
            $table->timestamp('ngay_nhap')->nullable();
            $table->decimal('tong_tien',10,2)->nullable();
            $table->integer('so_luong')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phieunhap');
    }
};
