<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
class TaiKhoan extends Model
{
    use HasApiTokens;
    protected $table = 'taikhoan';
    protected $primaryKey = 'tai_khoan_id';
    protected $keyType = 'int';
    protected $fillable = [
        'ten_dang_nhap',
        'mat_khau',
        'email',
        'ngay_cap_nhat_lan_cuoi',
        'ngay_tao',
        'loai_nguoi_dung'

    ];
        public function loaiNguoiDung()
    {
        return $this->belongsTo(LoaiNguoiDung::class, 'loai_nguoi_dung', 'loai_nguoi_dung_id');
    }
    public $incrementing = true;
    public $timestamps = false;
}
