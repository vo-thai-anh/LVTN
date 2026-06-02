<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoaiSach extends Model
{
    protected $table = 'loaisach';
    protected $primaryKey = 'loai_sach_id';
    protected $keyType = 'int';
    protected $fillable = [
        'ten_loai',
        'ngay_tao',
        'ngay_cap_nhat',
    ];
    public $incrementing = true;
    public $timestamps = true;
    public function sachs()
    {
        return $this->hasMany(Sach::class, 'loai_sach', 'loai_sach_id');
    }
}
