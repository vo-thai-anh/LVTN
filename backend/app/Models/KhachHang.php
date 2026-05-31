<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KhachHang extends Model
{
    protected $table = 'khachhang';
    protected $primaryKey = 'khach_hang_id';
    protected $keyType = 'string';
    protected $fillable = [
        'ten_khach_hang',
        'so_dien_thoai',
        'dia_chi',
        'email',
        'dia_chi',
        'gioi_tinh',
        'nam_sinh',
        'ngay_tao',
    ];
    public $incrementing = false;
    public $timestamps = false;

    public function taiKhoan()
    {
        return $this->belongsTo(TaiKhoan::class, 'tai_khoan_id', 'tai_khoan_id');
    }
}
