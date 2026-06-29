<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\PhuongThucThanhToan;
use Illuminate\Http\Request;

class PhuongThucThanhToanController extends Controller
{
    // Lấy danh sách tất cả phương thức thanh toán
    public function index()
    {
        return response()->json(PhuongThucThanhToan::all(), 200);
    }

    // Thêm phương thức thanh toán mới
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten'        => 'required|string|max:255',
            'mo_ta'      => 'nullable|string',
            'trang_thai' => 'required|integer|in:0,1'
        ]);

        try {
            $phuongThuc = PhuongThucThanhToan::create($validated);
            return response()->json(['success' => true, 'data' => $phuongThuc], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Xem chi tiết một phương thức
    public function show(string $id)
    {
        $phuongThuc = PhuongThucThanhToan::findOrFail($id);
        return response()->json($phuongThuc, 200);
    }

    // Cập nhật phương thức
    public function update(Request $request, string $id)
    {
        $phuongThuc = PhuongThucThanhToan::findOrFail($id);
        $validated = $request->validate([
            'ten'        => 'sometimes|required|string|max:255',
            'mo_ta'      => 'nullable|string',
            'trang_thai' => 'sometimes|required|in:active,inactive'
        ]);

        $phuongThuc->update($validated);
        return response()->json(['success' => true, 'data' => $phuongThuc], 200);
    }

    // Xóa phương thức
    public function destroy(string $id)
    {
        $phuongThuc = PhuongThucThanhToan::findOrFail($id);
        $phuongThuc->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa thành công'], 200);
    }
}
