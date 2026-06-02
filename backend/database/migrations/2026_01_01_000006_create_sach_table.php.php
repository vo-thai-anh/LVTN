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
        Schema::create('sach', function (Blueprint $table) {
            $table->id('sach_id');
            $table->string('ten_sach',255)->nullable();
            $table->integer('so_luong_ton')->nullable();
            $table->char('anh_bia',255)->nullable();
            $table->decimal('gia',10,2)->nullable();
            $table->string('nha_cung_cap',255)->nullable();
            $table->integer('trong_luong')->nullable();
            $table->text('mo_ta')->nullable();
            $table->char('tac_gia',30)->nullable();
            $table->string('nha_xuat_ban',255)->nullable();
            $table->date('nam_xuat_ban')->nullable();
            $table->integer('so_trang')->nullable();
            $table->integer('kich_thuoc')->nullable();
            $table->tinyInteger('trang_thai')->nullable();
            $table->foreignId('loai_sach')->references('loai_sach_id')->on('loaisach');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sach');
    }
};
