<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller ;
use App\Models\GioHang;
use App\Models\GioHangItem;
use App\Models\KhachHang;
use App\Models\Sach;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GioHang_ItemController extends Controller
{
    public function themVaoGio(Request $request)
    {
        $request->validate([
            'sach_id'  => 'required|exists:sach,sach_id',
            'so_luong' => 'required|integer|min:1'
        ], [
            'sach_id.required'  => 'Không tìm thấy mã sách hợp lệ.',
            'sach_id.exists'    => 'Cuốn sách này không tồn tại trên hệ thống.',
            'so_luong.required' => 'Vui lòng nhập số lượng cần mua.',
            'so_luong.integer'  => 'Số lượng phải là số nguyên.',
            'so_luong.min'      => 'Số lượng mua tối thiểu là 1 cuốn.',
        ]);

        DB::beginTransaction();
        try {
            $user = $request->user();
            $taiKhoanId = $user->tai_khoan_id ?? $user->id;
            $khachHang = KhachHang::where('tai_khoan_id', $taiKhoanId)->first();
            if ($khachHang) {
                $khachHangId = $khachHang->khach_hang_id;
            } else {
                $khachHangId = null;
            }
            $sachId      = $request->input('sach_id');
            $soLuongThem = (int) $request->input('so_luong');
            $sach = Sach::lockForUpdate()->findOrFail($sachId);
            $giohang = GioHang::firstOrCreate(
                ['khach_hang_id' => $khachHangId],
            );
            $chiTiet = GioHangItem::where('gio_hang', $giohang->gio_hang_id)
                                    ->where('sach', $sachId)
                                    ->first();
            if ($chiTiet) {
                $soLuongMoi = $chiTiet->so_luong + $soLuongThem;
                if ($soLuongMoi > $sach->so_luong_ton) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Số lượng vượt quá giới hạn hàng tồn kho! (Hiện tại kho chỉ còn ' . $sach->so_luong_ton . ' cuốn, trong giỏ bạn đã có ' . $chiTiet->so_luong . ' cuốn)'
                    ], 400);
                }
                $chiTiet->so_luong   = $soLuongMoi;
                $chiTiet->thanh_tien = $soLuongMoi * $chiTiet->don_gia;
                $chiTiet->save();
                DB::commit();
                return response()->json([
                    'success' => true,
                    'message' => 'Đã cập nhật thêm số lượng sách vào giỏ hàng thành công!',
                    'data'    => $chiTiet
                ], 200);

            } else {
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

                DB::commit();
                return response()->json([
                    'success' => true,
                    'message' => 'Đã thêm sách vào giỏ hàng thành công!',
                    'data'    => $chiTiet
                ], 201);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Hệ thống gặp sự cố khi xử lý giỏ hàng.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function capNhatSoLuong(Request $request, $sach)
    {
        $request->validate([
            'so_luong' => 'required|integer|min:1'
        ]);
        $user = $request->user();

        $khachHangId = $user->khach_hang_id;
        if (!$khachHangId) {
            $khachHang = KhachHang::where('tai_khoan_id', $user->id)
                ->orWhere('tai_khoan_id', $user->tai_khoan_id)
                ->first();
            if ($khachHang) {
                $khachHangId = $khachHang->khach_hang_id;
            }
        }
        if (!$khachHangId) {
            return response()->json(['success' => false, 'message' => 'Tài khoản chưa liên kết với thông tin khách hàng.'], 403);
        }
        $giohang = GioHang::where('khach_hang_id', $khachHangId)->first();
        if (!$giohang) {
            $giohang = GioHang::create([
                'khach_hang_id' => $khachHangId,
            ]);
        }
        $chiTiet = GioHangItem::where('gio_hang', $giohang->gio_hang_id)
                                ->where('sach', $sach)
                                ->first();
        if (!$chiTiet) {
            return response()->json(['success' => false, 'message' => 'Sản phẩm sách này không tồn tại bên trong giỏ.'], 404);
        }
        $sachModel = Sach::find($sach);
        if ($request->so_luong > $sachModel->so_luong_ton) {
            return response()->json(['success' => false, 'message' => 'Số lượng tồn kho không đủ (Còn lại: ' . $sachModel->so_luong_ton . ')'], 400);
        }
        $chiTiet->so_luong = $request->so_luong;
        $chiTiet->thanh_tien = $request->so_luong * ($chiTiet->don_gia ?? $sachModel->gia_ban);
        $chiTiet->save();
        return response()->json([
            'success' => true,
            'message' => 'Cập nhật số lượng thành công.',
            'data' => $chiTiet
        ], 200);
    }
    public function xoaChiTiet(Request $request, $sach)
    {
        $user = $request->user();

        // 1. Đồng bộ cơ chế tìm khach_hang_id chuẩn xác
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
                'message' => 'Không tìm thấy thông tin khách hàng tương ứng với tài khoản.'
            ], 403);
        }

        try {
            // 2. Tìm giỏ hàng
            $giohang = GioHang::where('khach_hang_id', $khachHangId)->first();
            if (!$giohang) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin giỏ hàng.'], 404);
            }

            // 3. Tìm và xóa item (Sử dụng đúng cột 'gio_hang' và 'sach' theo DB của bạn)
            $chiTiet = GioHangItem::where('gio_hang', $giohang->gio_hang_id)
                                    ->where('sach', $sach)
                                    ->first();
            if ($chiTiet) {
                $chiTiet->delete();
                return response()->json([
                    'success' => true,
                    'message' => 'Đã loại bỏ sản phẩm sách ra khỏi giỏ hàng.'
                ], 200);
            }

            return response()->json(['success' => false, 'message' => 'Mặt hàng này không tồn tại trong giỏ.'], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gặp sự cố khi xóa sản phẩm khỏi giỏ hàng.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}