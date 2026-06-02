<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GioHang extends Model
{
    protected $table = 'giohang';
    protected $primaryKey = 'gio_hang_id';
    protected $keyType = 'int';
    protected $fillable = [
        'khach_hang_id',
        'ngay_tao'
    ];
    public $incrementing = true;
    public $timestamps = false;
    public function khachhang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id', 'khach_hang_id');
    }

}
