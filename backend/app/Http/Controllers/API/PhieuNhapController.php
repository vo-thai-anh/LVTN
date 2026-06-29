<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\PhieuNhap;
use App\Models\PhieuNhapChiTiet;
use App\Models\Sach;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PhieuNhapController extends Controller
{
    // Lấy danh sách phiếu nhập kèm chi tiết
    public function index()
    {
        $phieuNhaps = PhieuNhap::with(['chiTiet.sach'])->latest()->paginate(20);
        return response()->json(['success' => true, 'data' => $phieuNhaps]);
    }

    // Tạo phiếu nhập mới với nhiều dòng chi tiết
    public function store(Request $request)
    {
        $request->validate([
            'ngay_nhap' => 'required|date',
            'ghi_chu'   => 'nullable|string',
            'chi_tiet'  => 'required|array|min:1',
            'chi_tiet.*.sach_id' => 'required|exists:sach,sach_id',
            'chi_tiet.*.so_luong' => 'required|integer|min:1',
            'chi_tiet.*.don_gia_nhap' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Tạo phiếu tổng
            $phieu = PhieuNhap::create([
                'ngay_nhap' => $request->ngay_nhap,
                'ghi_chu'   => $request->ghi_chu,
                'tong_tien' => collect($request->chi_tiet)->sum(fn($i) => $i['so_luong'] * $i['don_gia_nhap'])
            ]);

            // 2. Lưu chi tiết và cập nhật tồn kho
            foreach ($request->chi_tiet as $item) {
                PhieuNhapChiTiet::create([
                    'phieu_nhap_id' => $phieu->phieu_nhap_id,
                    'sach_id'       => $item['sach_id'],
                    'so_luong'      => $item['so_luong'],
                    'don_gia_nhap'  => $item['don_gia_nhap']
                ]);

                // Tăng tồn kho
                Sach::where('sach_id', $item['sach_id'])->increment('so_luong_ton', $item['so_luong']);
            }

            return response()->json(['success' => true, 'message' => 'Nhập kho thành công', 'data' => $phieu], 201);
        });
    }

    // Xem chi tiết một phiếu nhập cụ thể
    public function show(string $id)
    {
        $phieu = PhieuNhap::with('chiTiet.sach')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $phieu]);
    }

    // Xóa phiếu nhập (Cần xử lý hoàn trả tồn kho)
    public function destroy(string $id)
    {
        return DB::transaction(function () use ($id) {
            $phieu = PhieuNhap::with('chiTiet')->findOrFail($id);
            
            // Hoàn trả lại tồn kho trước khi xóa phiếu
            foreach ($phieu->chiTiet as $item) {
                Sach::where('sach_id', $item->sach_id)->decrement('so_luong_ton', $item->so_luong);
            }

            $phieu->delete();
            return response()->json(['success' => true, 'message' => 'Đã hủy phiếu và cập nhật tồn kho']);
        });
    }
}
