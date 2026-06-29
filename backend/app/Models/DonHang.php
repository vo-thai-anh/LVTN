<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonHang extends Model
{
    protected $table = 'donhang';
    protected $primaryKey = 'don_hang_id';
    protected $keyType = 'int';
    protected $fillable = [
        'ngay_tao',
        'khach_hang',
        'gio_hang',
        'thanh_tien',
        'trang_thai',
        'tong_tien',
        'so_tien_giam',
        'ghi_chu',
        'sdt_nguoi_nhan',
        'ten_nguoi_nhan',
        'dia_chi_giao_hang',
        'so_luong_sach',
    ];
    public $incrementing = true;
    public $timestamps = false;

    public function giohang()
    {
        return $this->hasMany(GioHang::class, 'gio_hang', 'gio_hang_id');
    }

    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang', 'khach_hang_id');
    }
    public function chitiet()
    {
        return $this->hasMany(DonHangItem::class, 'don_hang', 'don_hang_id');
    }
    public function thanhtoan()
    {
        return $this->hasOne(ThanhToan::class, 'don_hang', 'don_hang_id');
    }
}
