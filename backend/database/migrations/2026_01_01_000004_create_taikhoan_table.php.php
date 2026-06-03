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
        Schema::create('taikhoan', function (Blueprint $table) {
            $table->id('tai_khoan_id');
            $table->char('ten_dang_nhap',30)->nullable()->unique();
            $table->char('mat_khau',255)->nullable();
            $table->string('email', 100)->nullable();
            $table->date('ngay_cap_nhat_lan_cuoi')->nullable();
            $table->foreignId('loai_nguoi_dung')->references('loai_nguoi_dung_id')->on('loainguoidung');
            $table->timestamp('ngay_tao')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('taikhoan');
    }
};
