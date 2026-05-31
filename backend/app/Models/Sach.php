<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sach extends Model
{
    protected $table = 'sach';
    protected $primaryKey = 'sach_id';
    protected $keyType = 'string';
    protected $fillable = [
        'ten_sach',
        'tac_gia',
        'nha_xuat_ban',
        'nam_xuat_ban',
        'gia',
        'so_luong_ton',
        'anh_bia',
        'nha_cung_cap',
        'trong_luong',
        'mo_ta',
        'so_trang',
        'kich_thuoc',
        'trang_thai',
        'loai_sach'
    ];
    public $incrementing = false;
    public $timestamps = false;

    public function loaiSach()
    {
        return $this->belongsTo(LoaiSach::class, 'loai_sach', 'loai_sach_id');
    }
}
