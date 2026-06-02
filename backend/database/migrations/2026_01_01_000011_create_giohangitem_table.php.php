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
        Schema::create('giohangitem', function (Blueprint $table) {
            $table->id('gio_hang_item_id');
            $table->foreignId('gio_hang')->references('gio_hang_id')->on('giohang');
            $table->foreignId('sach')->references('sach_id')->on('sach');
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
        Schema::dropIfExists('giohangitem');
    }
};
