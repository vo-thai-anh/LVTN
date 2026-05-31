<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhieuXuat extends Model
{
    protected $table = 'phieuxuat';
    protected $primaryKey = 'phieu_xuat_id';
    protected $keyType = 'string';
    protected $fillable = [
        'ngay_xuat',
        'tong_tien',
        'so_luong'
    ];
    public $incrementing = false;
    public $timestamps = false;

    public function Sach()
    {
        return $this->belongsTo(Sach::class, 'sach', 'sach_id');
    }
}
