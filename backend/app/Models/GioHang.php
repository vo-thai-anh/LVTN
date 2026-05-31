<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GioHang extends Model
{
    protected $table = 'giohang';
    protected $primaryKey = 'gio_hang_id';
    protected $keyType = 'string';
    protected $fillable = [
        'ngay_tao'
    ];
    public $incrementing = false;
    public $timestamps = false;
    public function khachhang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id', 'khach_hang_id');
    }

}
