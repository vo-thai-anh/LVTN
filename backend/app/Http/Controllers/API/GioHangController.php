<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\GioHang;
use Illuminate\Http\Request;

class GioHangController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $giohang = GioHang::with('chitietgiohangs.sach')
                        ->firstOrCreate(
                            ['nguoi_dung_id' => $userId]
                        );
        $tongTienThanhToan = 0;
        if ($giohang->chitietgiohang) {
            foreach ($giohang->chitietgiohang as $item) {
                $tongTienThanhToan += $item->thanh_tien;
            }
        }
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
        $validated = $request->validate([
            'nguoi_dung_id' => 'required|exists:nguoidung,id|unique:giohang,nguoi_dung_id'
        ]);

        $giohang = GioHang::create($validated);
        return response()->json([
            'success' => true,
            'message' => 'Đã tạo giỏ hàng',
            'data' => $giohang
        ], 201);
    }
    function update(Request $request, $id)
    {
        $giohang = GioHang::find($id);
        if (!$giohang) {
            return response()->json([
                'success' => false,
                'message' => 'Giỏ hàng không tồn tại'
            ], 404);
        }
        $validated = $request->validate([
            'nguoi_dung_id' => 'required|exists:nguoidung,id|unique:giohang,nguoi_dung_id,' . $id
        ]);
        $giohang->update($validated);
        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật giỏ hàng',
            'data' => $giohang
        ]);
    }

    public function destroy($id)
    {
        $giohang = GioHang::find($id);
        if (!$giohang) {
            return response()->json([
                'success' => false,
                'message' => 'Giỏ hàng không tồn tại'
            ], 404);
        }

        $giohang->delete();
        return response()->json([
            'success' => true,
            'message' => 'Đã xóa giỏ hàng'
        ]);
    }
}
