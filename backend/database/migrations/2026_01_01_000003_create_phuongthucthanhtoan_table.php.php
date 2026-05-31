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
        Schema::create('phuongthucthanhtoan', function (Blueprint $table) {
            $table->char('phuong_thuc_id',10)->primary();
            $table->string('ten',255)->nullable();
            $table->text('mo_ta')->nullable();
            $table->tinyInteger('trang_thai')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phuongthucthanhtoan');
    }
};
