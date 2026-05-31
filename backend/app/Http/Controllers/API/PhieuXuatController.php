<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\PhieuXuat;
use App\Models\Sach;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PhieuXuatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $phieuXuats = PhieuXuat::with('Sach')->paginate(20);
        return response()->json([
            'success' => true,
            'data'    => $phieuXuats
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sach'      => 'required|exists:sach,sach_id',
            'ngay_xuat' => 'required|date',
            'tong_tien' => 'required|numeric|min:0',
            'so_luong'  => 'required|integer|min:1'
        ]);

        $phieuXuat = new PhieuXuat($validated);
        $phieuXuat->phieu_xuat_id = strtoupper(Str::random(10));
        $phieuXuat->save();

        return response()->json([
            'success' => true,
            'message' => 'Tạo phiếu xuất thành công',
            'data'    => $phieuXuat
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $phieuXuat = PhieuXuat::with('Sach')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data'    => $phieuXuat
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $phieuXuat = PhieuXuat::findOrFail($id);
        $validated = $request->validate([
            'sach'      => 'sometimes|required|exists:sach,sach_id',
            'ngay_xuat' => 'sometimes|required|date',
            'tong_tien' => 'sometimes|required|numeric|min:0',
            'so_luong'  => 'sometimes|required|integer|min:1'
        ]);

        $phieuXuat->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật phiếu xuất thành công',
            'data'    => $phieuXuat
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $phieuXuat = PhieuXuat::findOrFail($id);
        $phieuXuat->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa phiếu xuất thành công'
        ]);
    }
}
