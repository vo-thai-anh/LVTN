<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhuongThucThanhToan extends Model
{
    protected $table = 'phuongthucthanhtoan';
    protected $primaryKey = 'phuong_thuc_id';
    protected $keyType = 'string';
    protected $fillable = [
        'ten',
        'mo_ta',
        'trang_thai'
    ];
    public $incrementing = false;
    public $timestamps = false;
}
