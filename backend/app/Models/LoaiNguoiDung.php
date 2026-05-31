<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoaiNguoiDung extends Model
{
    protected $table = 'loainguoidung';
    protected $primaryKey = 'loai_nguoi_dung_id';
    protected $keyType = 'string';
    protected $fillable = [
        'ten',
    ];
    public $incrementing = false;
    public $timestamps = false;
}
