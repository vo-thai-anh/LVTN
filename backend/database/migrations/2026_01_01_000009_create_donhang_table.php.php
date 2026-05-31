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
            $table->char('don_hang_id',10)->primary();
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
            $table->char('khach_hang', 10);
            $table->foreign('khach_hang')->references('khach_hang_id')->on('khachhang');
            $table->char('gio_hang', 10);
            $table->foreign('gio_hang')->references('gio_hang_id')->on('giohang');
            $table->char('thanh_toan', 10);
            $table->foreign('thanh_toan')->references('thanh_toan_id')->on('thanhtoan');
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
