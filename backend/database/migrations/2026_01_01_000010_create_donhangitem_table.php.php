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
        Schema::create('donhangitem', function (Blueprint $table) {
            $table->char('don_hang_item_id',10)->primary();
            $table->char('don_hang', 10);
            $table->foreign('don_hang')->references('don_hang_id')->on('donhang');
            $table->char('sach', 10);
            $table->foreign('sach')->references('sach_id')->on('sach');
            $table->integer('so_luong')->nullable();
            $table->decimal('don_gia',10,2)->nullable();
            $table->decimal('thanh_tien',10,2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donhangitem');
    }
};
