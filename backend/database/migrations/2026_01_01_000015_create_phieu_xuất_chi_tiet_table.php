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
        Schema::create('phieu_xuat_chi_tiet', function (Blueprint $table) {
            $table->id('chi_tiet_phieu_xuat_id');
            
            // Cột khóa ngoại trỏ tới phieuxuat
            $table->unsignedBigInteger('phieu_xuat_id'); 
            
            // Cột khóa ngoại trỏ tới sach
            $table->unsignedBigInteger('sach_id');
            
            $table->integer('so_luong');
            $table->decimal('don_gia_xuat', 10, 2);

            // Thiết lập khóa ngoại
            $table->foreign('phieu_xuat_id')->references('phieu_xuat_id')->on('phieuxuat')->onDelete('cascade');
            $table->foreign('sach_id')->references('sach_id')->on('sach')->onDelete('cascade');
        });
    }


    public function down()
    {
        Schema::dropIfExists('phieu_xuất_chi_tiet');
    }
};
