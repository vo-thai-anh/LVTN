<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\KhachHang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Nette\Schema\ValidationException;

class KhachHangController extends Controller
{
    public function index()
    {
        $khachHangs = KhachHang::with('taiKhoan')->paginate(20);
        return response()->json([
            'success' => true,
            'data'    => $khachHangs
        ]);
    }

    public function show($id)
    {
        // Lấy thông tin khách hàng kèm theo tài khoản đăng nhập của họ
        $khachHang = KhachHang::with('taiKhoan')->find($id);
        
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng'], 404);
        }
        
        return response()->json($khachHang, 200);
    }

    // Cập nhật thông tin liên hệ của khách hàng
    public function update(Request $request, $id)
    {
        $khachHang = KhachHang::find($id);
        if (!$khachHang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng'], 404);
        }
        
        $validatedData = $request->validate([
            'ten_khach_hang' => 'sometimes|string|max:30',
            'email'          => 'sometimes|email|max:30|unique:khachhang,email,' . $id . ',khach_hang_id',
            'so_dien_thoai'  => 'sometimes|string|max:10|unique:khachhang,so_dien_thoai,' . $id . ',khach_hang_id',
            'dia_chi'        => 'sometimes|string|max:255',
            'gioi_tinh'      => 'nullable|string|max:10',
            'nam_sinh'       => 'nullable|date',
        ]);

        $khachHang->update($validatedData);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin cá nhân thành công',
            'data'    => $khachHang
        ], 200);
    }
}
