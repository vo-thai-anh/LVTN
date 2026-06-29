<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhieuXuat extends Model
{
    protected $table = 'phieuxuat';
    protected $primaryKey = 'phieu_xuat_id';
    protected $keyType = 'int';
    protected $fillable = [
        'ngay_xuat',
        'tong_tien',
        'so_luong'
    ];
    public $incrementing = true;
    public $timestamps = false;

    public function Sach()
    {
        return $this->belongsTo(Sach::class, 'sach', 'sach_id');
    }
    public function chiTiet()
    {
        return $this->hasMany(PhieuXuatChiTiet::class, 'phieu_xuat_id', 'phieu_xuat_id');
    }
}
