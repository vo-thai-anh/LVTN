<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhieuNhapChiTiet extends Model
{
    protected $table = 'phieu_nhap_chi_tiet'; // Khai báo đúng tên bảng
    protected $primaryKey = 'chi_tiet_phieu_nhap_id'; // Khai báo khóa chính

    protected $fillable = [
        'phieu_nhap_id',
        'sach_id',
        'so_luong',
        'don_gia_nhap'
    ];

    public $timestamps = false;

    public function phieuNhap() {
    return $this->belongsTo(PhieuNhap::class, 'phieu_nhap_id', 'phieu_nhap_id');
    }
    public function sach() {
        return $this->belongsTo(Sach::class, 'sach_id', 'sach_id');
    }
}

