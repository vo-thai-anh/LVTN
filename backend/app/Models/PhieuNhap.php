<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhieuNhap extends Model
{
    protected $table = 'phieunhap';
    protected $primaryKey = 'phieu_nhap_id';
    protected $keyType = 'string';
    protected $fillable = [
        'ngay_nhap',
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
