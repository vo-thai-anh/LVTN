<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhieuXuatChiTiet extends Model
{
    protected $table = 'phieu_xuat_chi_tiet';
    protected $primaryKey = 'chi_tiet_phieu_xuat_id';

    protected $fillable = [
        'phieu_xuat_id',
        'sach_id',
        'so_luong',
        'don_gia_xuat'
    ];

    public $timestamps = false;
    public function phieuXuat() {
    return $this->belongsTo(PhieuXuat::class, 'phieu_xuat_id', 'phieu_xuat_id');
    }
    public function sach() {
        return $this->belongsTo(Sach::class, 'sach_id', 'sach_id');
    }
}
