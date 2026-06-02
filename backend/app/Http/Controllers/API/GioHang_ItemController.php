<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller ;
use App\Models\GioHang;
use App\Models\GioHangItem;
use App\Models\Sach;
use Illuminate\Http\Request;

class GioHang_ItemController extends Controller
{
    public function themVaoGio(Request $request)
    {
        $request->validate([
            'sach_id'  => 'required|exists:sach,sach_id',
            'so_luong' => 'required|integer|min:1'
        ]);
        // Đồng bộ định danh theo thực thể Khách Hàng
        $khachHangId = $request->user()->khach_hang_id ?? $request->user()->id;
        $sachId = $request->sach_id;
        $soLuongThem = $request->so_luong;
        $sach = Sach::findOrFail($sachId);
        // Tìm giỏ hàng hiện tại hoặc tự tạo mới nếu chưa từng có giỏ hàng
        $giohang = GioHang::firstOrCreate(['khach_hang_id' => $khachHangId]);
        // Kiểm tra xem cuốn sách này đã nằm trong giỏ hàng trước đó chưa
        $chiTiet = GioHangItem::where('gio_hang', $giohang->gio_hang_id)
                                ->where('sach', $sachId)
                                ->first();
        if ($chiTiet) {
            $soLuongMoi = $chiTiet->so_luong + $soLuongThem;
            // Kiểm tra hàng tồn kho
            if ($soLuongMoi > $sach->so_luong_ton) {
                return response()->json([
                    'success' => false,
                    'message' => 'Số lượng vượt quá hàng tồn kho! (Kho còn lại ' . $sach->so_luong_ton . ' cuốn)'
                ], 400);
            }
            $chiTiet->update([
                'so_luong'   => $soLuongMoi,
                'thanh_tien' => $soLuongMoi * $chiTiet->don_gia
            ]);
            return response()->json([
                'success' => true,
                'message' => 'Đã cập nhật số lượng sách trong giỏ!',
                'data'    => $chiTiet
            ]);
        } else {
            // Kiểm tra hàng tồn kho khi thêm mới vào giỏ
            if ($soLuongThem > $sach->so_luong_ton) {
                return response()->json([
                    'success' => false,
                    'message' => 'Số lượng yêu cầu vượt quá hàng tồn kho! (Kho còn lại ' . $sach->so_luong_ton . ' cuốn)'
                ], 400);
            }
            $chiTiet = new GioHangItem();
            $chiTiet->gio_hang   = $giohang->gio_hang_id;
            $chiTiet->sach       = $sachId;
            $chiTiet->so_luong   = $soLuongThem;
            $chiTiet->don_gia    = $sach->gia;
            $chiTiet->thanh_tien = $soLuongThem * $sach->gia;
            $chiTiet->save();

            return response()->json([
                'success' => true,
                'message' => 'Đã thêm sản phẩm sách vào giỏ hàng thành công!',
                'data'    => $chiTiet
            ]);
        }
    }

    public function capNhatSoLuong(Request $request, $sach_id)
    {
        $request->validate([
            'so_luong' => 'required|integer|min:1'
        ]);
        $khachHangId = $request->user()->khach_hang_id ?? $request->user()->id;
        $soLuongMoi = $request->so_luong;
        $giohang = GioHang::where('khach_hang_id', $khachHangId)->first();
        if (!$giohang) {
            return response()->json(['success' => false, 'message' => 'Hệ thống không tìm thấy giỏ hàng của bạn.'], 404);
        }
        $chiTiet = GioHangItem::where('gio_hang', $giohang->gio_hang_id)
                                ->where('sach', $sach_id)
                                ->first();
        if (!$chiTiet) {
            return response()->json(['success' => false, 'message' => 'Sản phẩm sách này không tồn tại bên trong giỏ.'], 404);
        }
        $sach = Sach::findOrFail($sach_id);
        if ($soLuongMoi > $sach->so_luong_ton) {
            return response()->json([
                'success' => false,
                'message' => 'Số lượng vượt quá giới hạn hàng tồn kho! (Còn lại: ' . $sach->so_luong_ton . ')'
            ], 400);
        }
        $chiTiet->update([
            'so_luong'   => $soLuongMoi,
            'thanh_tien' => $soLuongMoi * $chiTiet->don_gia
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Thay đổi số lượng mặt hàng thành công.',
            'data'    => $chiTiet
        ]);
    }

    public function xoaChiTiet(Request $request, $sach_id)
    {
        $khachHangId = $request->user()->khach_hang_id ?? $request->user()->id;
        $giohang = GioHang::where('khach_hang_id', $khachHangId)->first();
        if (!$giohang) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin giỏ hàng.'], 404);
        }
        $chiTiet = GioHangItem::where('gio_hang', $giohang->gio_hang_id)
                                ->where('sach', $sach_id)
                                ->first();
        if ($chiTiet) {
            $chiTiet->delete();
            return response()->json([
                'success' => true,
                'message' => 'Đã loại bỏ sản phẩm sách ra khỏi giỏ hàng.'
            ]);
        }
        return response()->json(['success' => false, 'message' => 'Mặt hàng này không tồn tại trong giỏ.'], 404);
    }
}