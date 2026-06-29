<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\PhieuXuat;
use App\Models\PhieuXuatChiTiet;
use App\Models\Sach;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PhieuXuatController extends Controller
{
    // Lấy danh sách phiếu xuất kèm chi tiết
    public function index()
    {
        $phieuXuats = PhieuXuat::with(['chiTiet.sach'])->latest()->paginate(20);
        return response()->json(['success' => true, 'data' => $phieuXuats]);
    }

    // Tạo phiếu xuất mới (Kiểm tra tồn kho trước khi xuất)
    public function store(Request $request)
    {
        $request->validate([
            'ngay_xuat' => 'required|date',
            'chi_tiet'  => 'required|array|min:1',
            'chi_tiet.*.sach_id' => 'required|exists:sach,sach_id',
            'chi_tiet.*.so_luong' => 'required|integer|min:1',
            'chi_tiet.*.don_gia_xuat' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Kiểm tra tồn kho trước khi tạo phiếu
            foreach ($request->chi_tiet as $item) {
                $sach = Sach::where('sach_id', $item['sach_id'])->lockForUpdate()->first();
                if ($sach->so_luong_ton < $item['so_luong']) {
                    return response()->json([
                        'success' => false, 
                        'message' => "Sách '{$sach->ten_sach}' không đủ tồn kho (còn: {$sach->so_luong_ton})"
                    ], 422);
                }
            }

            // 2. Tạo phiếu tổng
            $phieu = PhieuXuat::create([
                'ngay_xuat' => $request->ngay_xuat,
                'ghi_chu'   => $request->ghi_chu,
                'tong_tien' => collect($request->chi_tiet)->sum(fn($i) => $i['so_luong'] * $i['don_gia_xuat'])
            ]);

            // 3. Lưu chi tiết và giảm tồn kho
            foreach ($request->chi_tiet as $item) {
                PhieuXuatChiTiet::create([
                    'phieu_xuat_id' => $phieu->phieu_xuat_id,
                    'sach_id'       => $item['sach_id'],
                    'so_luong'      => $item['so_luong'],
                    'don_gia_xuat'  => $item['don_gia_xuat']
                ]);

                // Giảm tồn kho
                Sach::where('sach_id', $item['sach_id'])->decrement('so_luong_ton', $item['so_luong']);
            }

            return response()->json(['success' => true, 'message' => 'Xuất kho thành công', 'data' => $phieu], 201);
        });
    }

    // Xem chi tiết phiếu xuất
    public function show(string $id)
    {
        $phieu = PhieuXuat::with('chiTiet.sach')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $phieu]);
    }

    // Hủy phiếu xuất (Hoàn trả tồn kho)
    public function destroy(string $id)
    {
        return DB::transaction(function () use ($id) {
            $phieu = PhieuXuat::with('chiTiet')->findOrFail($id);
            
            // Cộng lại tồn kho
            foreach ($phieu->chiTiet as $item) {
                Sach::where('sach_id', $item->sach_id)->increment('so_luong_ton', $item->so_luong);
            }

            $phieu->delete();
            return response()->json(['success' => true, 'message' => 'Đã hủy phiếu xuất và hoàn trả tồn kho']);
        });
    }
}
