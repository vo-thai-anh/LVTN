<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\DonHang;
use App\Models\DonHangItem;
use App\Models\GioHang;
use App\Models\KhachHang;
use App\Models\PhuongThucThanhToan;
use App\Models\Sach;
use App\Models\ThanhToan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DonHangController extends Controller
{
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'ho_ten'                => 'required|string|max:255',
            'so_dien_thoai'         => 'required|string|max:20',
            'dia_chi'               => 'required|string|max:255',
            'phuong_thuc_thanh_toan'=> 'required|exists:phuongthucthanhtoan,ten',
            'ghi_chu'               => 'nullable|string'
        ]);
        $khachHang = KhachHang::where('tai_khoan_id', $request->user()->tai_khoan_id)->first();
        if (!$khachHang) return response()->json(['success' => false, 'message' => 'Khách hàng không tồn tại!'], 404);
        $giohang = GioHang::with(['giohangitem.Sach'])->where('khach_hang_id', $khachHang->khach_hang_id)->first();
        if (!$giohang || $giohang->giohangitem->isEmpty()) return response()->json(['success' => false, 'message' => 'Giỏ hàng trống!'], 400);
        try {
            DB::beginTransaction();
            $tongTien = 0;
            $tongSoLuongSach = 0;
            foreach ($giohang->giohangitem as $item) {
                $gia = $item->Sach->gia ?? $item->don_gia;
                $tongTien += $gia * $item->so_luong;
                $tongSoLuongSach += $item->so_luong;
            }
            $phuongThuc = PhuongThucThanhToan::where('ten', $validated['phuong_thuc_thanh_toan'])->first();
            if (!$phuongThuc) {
                throw new \Exception("Phương thức thanh toán không hợp lệ!");
            }
            $donhang = DonHang::create([
            'khach_hang'        => $khachHang->khach_hang_id,
            'gio_hang'          => $giohang->gio_hang_id,
            'tong_tien'         => $tongTien,
            'thanh_tien'        => $tongTien,
            'trang_thai'        => 'CHỜ_XÁC_NHẬN',
            'ten_nguoi_nhan'    => $validated['ho_ten'],
            'sdt_nguoi_nhan'    => $validated['so_dien_thoai'],
            'dia_chi_giao_hang' => $validated['dia_chi'],
            'so_luong_sach'     => $tongSoLuongSach,
            'ghi_chu'           => $validated['ghi_chu'] ?? null,
            'ngay_tao'          => now(),
        ]);
            $thanhToan = ThanhToan::create([
                'don_hang'       => $donhang->don_hang_id,
                'phuong_thuc_id' => $phuongThuc->phuong_thuc_id,
                'so_tien'        => $tongTien,
                'trang_thai'     => 0,
                'ngay_tao'       => now()
            ]);

            $donhang->update(['thanh_toan' => $thanhToan->thanh_toan_id]);
            $sachIds = $giohang->giohangitem->pluck('sach');
            $danhSachSach = Sach::whereIn('sach_id', $sachIds)->lockForUpdate()->get()->keyBy('sach_id');

            foreach ($giohang->giohangitem as $item) {
                $sach = $danhSachSach->get($item->sach);
                if (!$sach || $sach->so_luong_ton < $item->so_luong)
                    throw new \Exception("Sách '{$sach->ten_sach}' không đủ số lượng!");
                $sach->decrement('so_luong_ton', $item->so_luong);
                DonHangItem::create([
                    'don_hang'    => $donhang->don_hang_id,
                    'sach'        => $item->sach,
                    'so_luong'    => $item->so_luong,
                    'don_gia'     => $sach->gia,
                    'thanh_tien'  => $sach->gia * $item->so_luong
                ]);
            }

            $giohang->giohangitem()->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'don_hang_id' => $donhang->don_hang_id,
                'noi_dung_ck' => "SEVQR " . $donhang->don_hang_id
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function handleSePayWebhook(Request $request)
    {
        $content = $request->input('content');
        if (!$content) {
            return response()->json(['status' => 'error', 'message' => 'No content'], 400);
        }
        $donHangId = str_replace('SEVQR ', '', $content);
        $donHang = DonHang::find($donHangId);
        if ($donHang) {
            $donHang->update(['trang_thai' => 'DA_THANH_TOAN']);
            if ($donHang->thanhToan) {
                $donHang->thanhToan->update(['trang_thai' => 1]);
            }
        }
        return response()->json(['status' => 'success']);
    }

    public function index(Request $request)
    {
            $user = $request->user();

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Chưa xác thực'], 401);
            }
            $user->load('loaiNguoiDung');

            if ($user->loaiNguoiDung && $user->loaiNguoiDung->ten === 'Admin') {
                $donhangs = DonHang::with('khachHang')
                                    ->orderBy('ngay_tao', 'desc')
                                    ->get();
            }
            else{
                $khachHang = KhachHang::where('tai_khoan_id', $user->tai_khoan_id)->first();
                if (!$khachHang) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin khách hàng'], 404);
                }
                        $donhangs = DonHang::with('khachHang','thanhtoan.phuongThuc')
                                ->where('khach_hang', $khachHang->khach_hang_id)
                                ->orderBy('ngay_tao', 'desc')
                                ->get();
            }
            return response()->json([
            'success' => true,
            'data' => $donhangs
        ]);
    }
    public function show(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Chưa xác thực'], 401);
        }

        $user->load('loaiNguoiDung');

        $query = DonHang::with('khachHang','chitiet.Sach','thanhtoan.phuongThuc');

        if ($user->loaiNguoiDung && $user->loaiNguoiDung->ten === 'Admin') {
            $donhang = $query->find($id);
        } else {
            $khachHang = KhachHang::where('tai_khoan_id', $user->tai_khoan_id)->first();
            if (!$khachHang) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin khách hàng'], 404);
            }

            $donhang = $query->where('khach_hang', $khachHang->khach_hang_id)
                            ->where('don_hang_id', $id)
                            ->first();
        }

        if (!$donhang) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.'
            ], 404);
        }

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
            ->whereIn('trang_thai', ['CHỜ_XÁC_NHẬN'])
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
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'trang_thai' => 'required|string',
        ]);
        $donHang = DonHang::findOrFail($id);
        $currentStatus = $donHang->trang_thai ?? 'CHỜ_XÁC_NHẬN';
        $newStatus = $request->trang_thai;

        $allowedTransitions = [
            'CHỜ_XÁC_NHẬN'   => ['ĐANG_GIAO_HÀNG', 'ĐÃ_HỦY'],
            'ĐANG_GIAO_HÀNG' => ['ĐÃ_GIAO_HÀNG'],
            'ĐÃ_GIAO_HÀNG'   => [],
            'ĐÃ_HỦY'         => [],
        ];

        if ($currentStatus === $newStatus) {
            return response()->json(['message' => 'Đơn hàng đã ở trạng thái này rồi'], 200);
        }
        if (!isset($allowedTransitions[$currentStatus]) || !in_array($newStatus, $allowedTransitions[$currentStatus])) {
            return response()->json([
                'message' => "Không thể chuyển đơn hàng từ {$currentStatus} sang {$newStatus}"
            ], 400);
        }

        $donHang->trang_thai = $newStatus;
        $donHang->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công'
        ]);
    }
}