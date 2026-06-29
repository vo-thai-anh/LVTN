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
        Schema::create('donhang', function (Blueprint $table) {
            $table->id('don_hang_id');
            $table->timestamp('ngay_tao')->useCurrent();
            $table->decimal('thanh_tien',10,2)->nullable();
            $table->string('trang_thai',255)->nullable();
            $table->decimal('tong_tien',10,2)->nullable();
            $table->decimal('so_tien_giam',10,2)->nullable();
            $table->text('ghi_chu')->nullable();
            $table->char('sdt_nguoi_nhan',10)->nullable();
            $table->char('ten_nguoi_nhan',30)->nullable();
            $table->string('dia_chi_giao_hang',255)->nullable();
            $table->integer('so_luong_sach')->nullable();
            $table->foreignId('khach_hang')->references('khach_hang_id')->on('khachhang');
            $table->foreignId('gio_hang')->references('gio_hang_id')->on('giohang');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donhang');
    }
};
