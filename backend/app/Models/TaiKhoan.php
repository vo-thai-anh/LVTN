<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
class TaiKhoan extends Model
{
    use HasApiTokens;
    protected $table = 'taikhoan';
    protected $primaryKey = 'tai_khoan_id';
    protected $keyType = 'string';
    protected $fillable = [
        'ten_dang_nhap',
        'mat_khau',
        'ngay_cap_nhat_lan_cuoi',
        'ngay_tao'
    ];
    public $incrementing = false;
    public $timestamps = false;
}
