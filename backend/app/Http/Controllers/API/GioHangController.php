<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\GioHang;
use App\Models\GioHangItem;
use App\Models\KhachHang;
use Illuminate\Http\Request;

class GioHangController extends Controller
{

public function index(Request $request)
{
    $user = $request->user();
    $khachHangId = $user->khach_hang_id;
    if (!$khachHangId) {
        $taiKhoanId = $user->tai_khoan_id ?? $user->id;
        $khachHang = KhachHang::where('tai_khoan_id', $taiKhoanId)->first();
        if ($khachHang) {
            $khachHangId = $khachHang->khach_hang_id;
        }
    }
    if (!$khachHangId) {
        return response()->json([
            'success' => false,
            'message' => 'Không tìm thấy thông tin khách hàng tương ứng với tài khoản này.'
        ], 403);
    }
    try {
        $giohang = GioHang::firstOrCreate(
            ['khach_hang_id' => $khachHangId]
        );
        $items = GioHangItem::with('Sach')
            ->where('gio_hang', $giohang->gio_hang_id)
            ->get();
        $tongTienThanhToan = 0;
        foreach ($items as $item) {
            $tongTienThanhToan += $item->thanh_tien ?? ($item->so_luong * ($item->Sach->gia_ban ?? $item->Sach->gia ?? 0));
        }
        $giohang->chitietgiohangs = $items;
        return response()->json([
            'success' => true,
            'data' => [
                'thong_tin_gio_hang'   => $giohang,
                'tong_tien_thanh_toan' => $tongTienThanhToan
            ]
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Hệ thống gặp sự cố khi tải dữ liệu giỏ hàng.',
            'error'   => $e->getMessage()
        ], 500);
    }
}
    public function store(Request $request)
    {
        $validated = $request->validate([
            'khach_hang_id' => 'required|exists:khachhang,khach_hang_id|unique:giohang,khach_hang_id'
        ]);
        try {
            $giohang = GioHang::create($validated);
            return response()->json([
                'success' => true,
                'message' => 'Đã tạo giỏ hàng thành công.',
                'data'    => $giohang
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tạo giỏ hàng: ' . $e->getMessage()
            ], 500);
        }
    }
    public function update(Request $request, $id)
    {
        // Khắc phục lỗi: Tìm kiếm chính xác theo cột khóa chính 'gio_hang_id' thay vì find() mặc định
        $giohang = GioHang::where('gio_hang_id', $id)->first();
        if (!$giohang) {
            return response()->json([
                'success' => false,
                'message' => 'Giỏ hàng không tồn tại.'
            ], 404);
        }
        $validated = $request->validate([
            'khach_hang_id' => 'required|exists:khachhang,khach_hang_id|unique:giohang,khach_hang_id,' . $id . ',gio_hang_id'
        ]);
        $giohang->update($validated);
        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật thông tin giỏ hàng.',
            'data'    => $giohang
        ]);
    }
    public function destroy($id)
    {
        $giohang = GioHang::where('gio_hang_id', $id)->first();
        if (!$giohang) {
            return response()->json([
                'success' => false,
                'message' => 'Giỏ hàng không tồn tại.'
            ], 404);
        }
        $giohang->delete();
        return response()->json([
            'success' => true,
            'message' => 'Đã xóa giỏ hàng thành công.'
        ]);
    }
}