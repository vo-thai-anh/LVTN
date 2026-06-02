<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NhanVien extends Model
{
    protected $table = 'nhanvien';
    protected $primaryKey = 'nhan_vien_id';
    protected $keyType = 'int';
    protected $fillable = [
        'ten_nhan_vien',
        'nam_sinh',
        'gioi_tinh',
        'so_dien_thoai',
        'dia_chi',
        'email',
        'ngay_tao',
    ];
    public $incrementing = true;
    public $timestamps = false;

    public function taiKhoan()
    {
        return $this->belongsTo(TaiKhoan::class, 'tai_khoan_id', 'tai_khoan_id');
    }

}
