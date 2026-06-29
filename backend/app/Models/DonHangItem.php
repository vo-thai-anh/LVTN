<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonHangItem extends Model
{
    protected $table = 'donhangitem';
    protected $primaryKey = 'don_hang_item_id';
    protected $keyType = 'int';
    protected $fillable = [
        'so_luong',
        'don_gia',
        'thanh_tien',
        'don_hang',
        'sach',
    ];
    public $incrementing = true;
    public $timestamps = false;

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'don_hang', 'don_hang_id');
    }

    public function Sach()
    {
        return $this->belongsTo(Sach::class, 'sach', 'sach_id');
    }
}
