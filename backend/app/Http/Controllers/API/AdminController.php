<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\KhachHang;
use App\Models\NhanVien;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Nette\Schema\ValidationException;

class AdminController extends Controller
{
    public function index()
    {
        $khachHangs = KhachHang::with('taiKhoan')->get()->map(function($item) {
            $item->loai_doi_tuong = 'khach_hang';
            return $item;
        });
        $nhanViens = NhanVien::with('taiKhoan')->get()->map(function($item) {
            $item->loai_doi_tuong = 'nhan_vien';
            return $item;
        });
        $allUsers = $khachHangs->concat($nhanViens);
        $page = request()->get('page', 1);
        $perPage = 20;
        $paginatedResults = new LengthAwarePaginator(
            $allUsers->forPage($page, $perPage),
            $allUsers->count(),
            $perPage,
            $page,
            ['path' => request()->url()]
        );
        return response()->json([
            'success' => true,
            'data'    => $paginatedResults
        ]);
    }
}
