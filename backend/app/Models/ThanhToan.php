<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThanhToan extends Model
{
    protected $table = 'thanhtoan';
    protected $primaryKey = 'thanh_toan_id';
    protected $keyType = 'string';
    protected $fillable = [
        'thoi_han_thanh_toan',
        'trang_thai',
        'ngay_tao'
    ];
    public $incrementing = false;
    public $timestamps = false;

    public function phuongThuc()
    {
        return $this->belongsTo(PhuongThucThanhToan::class, 'phuong_thuc_id', 'phuong_thuc_id');
    }
}
