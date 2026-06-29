<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThanhToan extends Model
{
    protected $table = 'thanhtoan';
    protected $primaryKey = 'thanh_toan_id';
    protected $keyType = 'int';
    protected $fillable = [
        'thoi_han_thanh_toan',
        'phuong_thuc_id',
        'trang_thai',
        'ngay_tao',
        'don_hang'
    ];
    public $incrementing = true;
    public $timestamps = false;
    public function donhang()
    {
        return $this->hasOne(DonHang::class, 'don_hang', 'don_hang_id');
    }
    public function phuongThuc()
    {
        return $this->belongsTo(PhuongThucThanhToan::class, 'phuong_thuc_id', 'phuong_thuc_id');
    }
}
