<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhuongThucThanhToan extends Model
{
    protected $table = 'phuongthucthanhtoan';
    protected $primaryKey = 'phuong_thuc_id';
    protected $keyType = 'int';
    protected $fillable = [
        'ten',
        'mo_ta',
        'trang_thai'
    ];
    public $incrementing = true;
    public $timestamps = false;
}
