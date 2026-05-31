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
        Schema::create('nhanvien', function (Blueprint $table) {
            $table->char('nhan_vien_id',10)->primary();
            $table->char('ten_nhan_vien',30)->nullable();
            $table->char('email',30)->nullable()->unique();
            $table->char('so_dien_thoai',10)->nullable()->unique();
            $table->string('dia_chi',255)->nullable();
            $table->char('gioi_tinh',10)->nullable();
            $table->date('nam_sinh')->nullable();
            $table->timestamp('ngay_tao')->useCurrent();
            $table->char('tai_khoan_id', 10);
            $table->foreign('tai_khoan_id')->references('tai_khoan_id')->on('taikhoan');
            $table->char('loai_nguoi_dung', 10);
            $table->foreign('loai_nguoi_dung')->references('loai_nguoi_dung_id')->on('loainguoidung');
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nhanvien');
    }
};
