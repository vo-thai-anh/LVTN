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
    const CREATED_AT = 'ngay_tao';
    const UPDATED_AT = null;
    public $incrementing = true;
    public $timestamps = true;
    public function khachhang()
    {
        return $this->belongsTo(KhachHang::class, 'khach_hang_id', 'khach_hang_id');
    }
    public function chitietgiohangs()
    {
        return $this->hasMany(GioHangItem::class, 'gio_hang', 'gio_hang_id');
    }

}
