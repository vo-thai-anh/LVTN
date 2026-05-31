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
        Schema::create('giohang', function (Blueprint $table) {
            $table->char('gio_hang_id',10)->primary();
            $table->timestamp('ngay_tao')->useCurrent();
            $table->char('khach_hang_id', 10);
            $table->foreign('khach_hang_id')->references('khach_hang_id')->on('khachhang');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('giohang');
    }
};
