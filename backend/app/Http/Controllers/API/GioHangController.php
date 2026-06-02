<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\GioHang;
use App\Models\GioHangItem;
use Illuminate\Http\Request;

class GioHangController extends Controller
{

    public function index(Request $request)
    {
        // Nhận diện khach_hang_id từ Token đang đăng nhập
        $khachHangId = $request->user()->khach_hang_id ?? $request->user()->id;
        // Tìm giỏ hàng theo khach_hang_id hoặc tự động tạo mới nếu chưa có
        $giohang = GioHang::firstOrCreate(
            ['khach_hang_id' => $khachHangId],
            ['ngay_tao' => now()] // Điền ngày tạo hiện tại nếu phải tạo mới
        );
        // Lấy danh sách các mặt hàng trong giỏ thông qua GioHangItem
        // Khớp với cột liên kết 'gio_hang' trỏ đến khóa chính tự tăng 'gio_hang_id'
        $items = GioHangItem::with('Sach')
            ->where('gio_hang', $giohang->gio_hang_id)
            ->get();
        // Tính toán tổng tiền thanh toán từ các item
        $tongTienThanhToan = 0;
        foreach ($items as $item) {
            $tongTienThanhToan += $item->thanh_tien;
        }
        // Đính kèm danh sách chi tiết động vào đối tượng trả về cho Frontend
        $giohang->chitietgiohangs = $items;
        return response()->json([
            'success' => true,
            'data' => [
                'thong_tin_gio_hang'   => $giohang,
                'tong_tien_thanh_toan' => $tongTienThanhToan
            ]
        ]);
    }
    public function store(Request $request)
    {
        // Sửa 'nguoi_dung_id' thành 'khach_hang_id' kết nối chuẩn bảng khachhang
        $validated = $request->validate([
            'khach_hang_id' => 'required|exists:khachhang,khach_hang_id|unique:giohang,khach_hang_id'
        ]);
        try {
            // Tự động bổ sung ngày tạo hiện tại
            $validated['ngay_tao'] = now();
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