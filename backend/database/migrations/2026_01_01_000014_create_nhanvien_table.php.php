<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nhanvien', function (Blueprint $table) {
            $table->id('nhan_vien_id');
            $table->string('ten_nhan_vien', 100)->nullable();
            $table->char('so_dien_thoai', 10)->nullable()->unique();
            $table->string('dia_chi', 255)->nullable();
            $table->string('gioi_tinh', 10)->nullable();
            $table->date('nam_sinh')->nullable();
            
            $table->string('chuc_vu', 50)->nullable();
            $table->decimal('luong', 12, 2)->nullable();
            $table->date('ngay_vao_lam')->nullable();

            $table->timestamp('ngay_tao')->useCurrent();
            $table->timestamp('ngay_cap_nhat')->nullable()->useCurrentOnUpdate();

            $table->foreignId('tai_khoan_id')->references('tai_khoan_id')->on('taikhoan')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nhanvien');
    }
};