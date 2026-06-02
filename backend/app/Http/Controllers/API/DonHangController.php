<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\DonHang;
use App\Models\DonHangItem;
use App\Models\GioHang;
use App\Models\Sach;
use App\Models\ThanhToan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DonHangController extends Controller
{
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'ho_ten'                 => 'required|string|max:255',
            'so_dien_thoai'          => 'required|string|max:20',
            'dia_chi'                => 'required|string|max:255',
            'phuong_thuc_thanh_toan' => 'required|in:transfer,cod',
            'ghi_chu'                => 'nullable|string'
        ]);
        $khachHangId = $request->user()->khach_hang_id ?? $request->user()->id;
        $giohang = GioHang::with('chitietgiohangs.sach')
            ->where('khach_hang_id', $khachHangId)
            ->first();
        if (!$giohang || $giohang->chitietgiohangs->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Giỏ hàng của bạn đang trống!'
            ], 400);
        }
        try {
            DB::beginTransaction();

            $tongTien = 0;
            $tongSoLuongSach = 0;
            // Vòng lặp 1: Tính toán tổng tiền hóa đơn
            foreach ($giohang->chitietgiohangs as $item) {
                if (!$item->sach) {
                    throw new \Exception("Có sản phẩm trong giỏ hàng không còn tồn tại hệ thống.");
                }
                $giaHienTai = $item->sach->gia ?? $item->don_gia; // Sử dụng cột 'gia' từ Model Sach
                $tongTien += $giaHienTai * $item->so_luong;
                $tongSoLuongSach += $item->so_luong;
            }
            // Tạo mã đơn hàng dạng Chuỗi ngẫu nhiên (Ví dụ: DH837194) vì $keyType = 'string'
            $newDonHangId = 'DH' . strtoupper(Str::random(8));
            // Khởi tạo bản ghi Đơn hàng mới
            $donhang = DonHang::create([
                'don_hang_id'       => $newDonHangId,
                'khach_hang'        => $khachHangId,
                'tong_tien'         => $tongTien,
                'thanh_tien'        => $tongTien,
                'so_tien_giam'      => 0,
                'trang_thai'        => 'CHỜ_XÁC_NHẬN',
                'ten_nguoi_nhan'    => $validated['ho_ten'],
                'sdt_nguoi_nhan'    => $validated['so_dien_thoai'],
                'dia_chi_giao_hang' => $validated['dia_chi'],
                'so_luong_sach'     => $tongSoLuongSach,
                'ghi_chu'           => $validated['ghi_chu'] ?? null,
                'ngay_tao'          => now(),
            ]);
            // Vòng lặp 2: Trừ kho bằng Pessimistic Locking và tạo chi tiết hóa đơn
            foreach ($giohang->chitietgiohangs as $item) {
                // Khóa dòng dữ liệu để tránh xung đột thao tác đồng thời (Race Condition)
                $sach = Sach::lockForUpdate()->find($item->sach_id);
                // Đồng bộ kiểm tra trường 'so_luong_ton' chuẩn Model Sach
                if (!$sach || $sach->so_luong_ton < $item->so_luong) {
                    throw new \Exception("Sách '{$item->sach->ten_sach}' đã hết hàng hoặc không đủ số lượng cung cấp.");
                }
                // Trừ số lượng tồn kho của cuốn sách
                $sach->decrement('so_luong_ton', $item->so_luong);
                // Tạo chi tiết mặt hàng đơn đặt
                DonHangItem::create([
                    'don_hang_id' => $donhang->don_hang_id, // Sử dụng don_hang_id thay vì id
                    'sach_id'     => $item->sach_id,
                    'so_luong'    => $item->so_luong,
                    'don_gia'     => $item->sach->gia ?? $item->don_gia,
                    'thanh_tien'  => ($item->sach->gia ?? $item->don_gia) * $item->so_luong
                ]);
            }
            // Ghi nhận trạng thái thanh toán ban đầu cho đơn hàng
            ThanhToan::create([
                'don_hang_id' => $donhang->don_hang_id,
                'phuong_thuc' => strtoupper($validated['phuong_thuc_thanh_toan']),
                'so_tien'     => $tongTien,
                'trang_thai'  => 'CHUA_THANH_TOAN',
                'ngay_tao'    => now()
            ]);
            // Dọn sạch hoàn toàn các mặt hàng trong giỏ sau khi mua thành công
            $giohang->chitietgiohangs()->delete();
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Đặt hàng thành công!',
                'don_hang_id' => $donhang->don_hang_id
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Quá trình đặt hàng thất bại: ' . $e->getMessage()
            ], 500);
        }
    }
    public function index(Request $request)
    {
        $khachHangId = $request->user()->khach_hang_id ?? $request->user()->id;
        // Sửa liên kết từ 'chitietdonhangs' thành 'giohang' hoặc tên quan hệ chi tiết mặt hàng tương ứng của bạn
        $donhangs = DonHang::with('thanhtoan')
            ->where('khach_hang', $khachHangId) // Khớp cột 'khach_hang'
            ->orderBy('ngay_tao', 'desc')
            ->get();
        return response()->json([
            'success' => true,
            'data'    => $donhangs
        ]);
    }
    public function show(Request $request, $id)
    {
        $khachHangId = $request->user()->khach_hang_id ?? $request->user()->id;

        $donhang = DonHang::with('thanhtoan')
            ->where('khach_hang', $khachHangId)
            ->findOrFail($id); 

        return response()->json([
            'success' => true,
            'data'    => $donhang
        ]);
    }
    public function huydon(Request $request, $id)
    {
        $khachHangId = $request->user()->khach_hang_id ?? $request->user()->id;
        
        // Truy vấn đơn hàng ở trạng thái cho phép hủy
        $donhang = DonHang::where('khach_hang', $khachHangId)
            ->where('don_hang_id', $id)
            ->whereIn('trang_thai', ['CHỜ_XÁC_NHẬN', 'ĐÃ_XÁC_NHẬN'])
            ->first();

        if (!$donhang) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng không tồn tại, đã bị hủy hoặc đang trong quá trình vận chuyển.'
            ], 404);
        }
        try {
            DB::beginTransaction();
            // Nếu bạn có model quan hệ DonHangItem liên kết, hãy lấy danh sách chi tiết để hoàn kho
            $items = DonHangItem::where('don_hang_id', $donhang->don_hang_id)->get();
            
            foreach ($items as $item) {
                $sach = Sach::lockForUpdate()->find($item->sach_id);
                if ($sach) {
                    // Cộng trả lại số lượng sách vào cột 'so_luong_ton' chuẩn DB
                    $sach->increment('so_luong_ton', $item->so_luong);
                }
            }
            // Cập nhật trạng thái đơn hàng
            $donhang->update([
                'trang_thai' => 'ĐÃ_HỦY'
            ]);
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Đơn hàng đã được hủy thành công và hoàn trả số lượng vào kho.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Quá trình hủy đơn hàng thất bại: ' . $e->getMessage()
            ], 500);
        }
    }
}