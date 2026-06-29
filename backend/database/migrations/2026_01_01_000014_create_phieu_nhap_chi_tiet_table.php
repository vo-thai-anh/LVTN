<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('phieu_nhap_chi_tiet', function (Blueprint $table) {
            $table->id('chi_tiet_phieu_nhap_id');
            $table->unsignedBigInteger('phieu_nhap_id'); 
            
            // SỬA Ở ĐÂY: Dùng unsignedBigInteger để khớp với $table->id('sach_id')
            $table->unsignedBigInteger('sach_id'); 
            
            $table->integer('so_luong');
            $table->decimal('don_gia_nhap', 10, 2);

            $table->foreign('phieu_nhap_id')->references('phieu_nhap_id')->on('phieunhap')->onDelete('cascade');
            $table->foreign('sach_id')->references('sach_id')->on('sach')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phieu_nhap_chi_tiet');
    }
};
