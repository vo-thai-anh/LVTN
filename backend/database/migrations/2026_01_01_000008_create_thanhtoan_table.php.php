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
        Schema::create('thanhtoan', function (Blueprint $table) {
            $table->char('thanh_toan_id',10)->primary();
            $table->date('thoi_han_thanh_toan')->nullable();
            $table->tinyInteger('trang_thai')->nullable();
            $table->timestamp('ngay_tao')->useCurrent();
            $table->char('phuong_thuc_id', 10);
            $table->foreign('phuong_thuc_id')->references('phuong_thuc_id')->on('phuongthucthanhtoan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('thanhtoan');
    }
};
