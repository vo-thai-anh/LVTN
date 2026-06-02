<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GioHangItem extends Model
{
    protected $table = 'giohangitem';
    protected $primaryKey = 'gio_hang_item_id';
    protected $keyType = 'int';
    protected $fillable = [
        'gio_hang',
        'sach',
        'so_luong',
        'don_gia',
        'thanh_tien',
    ];
    public $incrementing = true;
    public $timestamps = false;

    public function Sach()
    {
        return $this->belongsTo(Sach::class, 'sach', 'sach_id');
    }
    public function gioHang()
    {
        return $this->belongsTo(GioHang::class, 'gio_hang', 'gio_hang_id');
    }
}
