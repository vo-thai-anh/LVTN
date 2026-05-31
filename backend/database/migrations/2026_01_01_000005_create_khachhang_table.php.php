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
        Schema::create('khachhang', function (Blueprint $table) {
            $table->char('khach_hang_id',10)->primary();
            $table->char('ten_khach_hang',30)->nullable();
            $table->char('email',30)->nullable();
            $table->char('so_dien_thoai',10)->nullable();
            $table->string('dia_chi',255)->nullable();
            $table->char('gioi_tinh',10)->nullable();
            $table->date('nam_sinh')->nullable();
            $table->timestamp('ngay_tao')->useCurrent();
            $table->char('tai_khoan_id', 10);
            $table->foreign('tai_khoan_id')->references('tai_khoan_id')->on('taikhoan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('khachhang');
    }
};
