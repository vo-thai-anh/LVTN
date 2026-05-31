<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\PhieuNhap;
use App\Models\Sach;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PhieuNhapController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $phieuNhaps = PhieuNhap::with('Sach')->paginate(20);
        return response()->json([
            'success' => true,
            'data'    => $phieuNhaps
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sach'      => 'required|exists:sach,sach_id',
            'ngay_nhap' => 'required|date',
            'tong_tien' => 'required|numeric|min:0',
            'so_luong'  => 'required|integer|min:1'
        ]);

        $phieuNhap = new PhieuNhap($validated);
        $phieuNhap->phieu_nhap_id = strtoupper(Str::random(10));
        $phieuNhap->save();

        return response()->json([
            'success' => true,
            'message' => 'Tạo phiếu nhập thành công',
            'data'    => $phieuNhap
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $phieuNhap = PhieuNhap::with('Sach')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data'    => $phieuNhap
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $phieuNhap = PhieuNhap::findOrFail($id);
        $validated = $request->validate([
            'sach'      => 'sometimes|required|exists:sach,sach_id',
            'ngay_nhap' => 'sometimes|required|date',
            'tong_tien' => 'sometimes|required|numeric|min:0',
            'so_luong'  => 'sometimes|required|integer|min:1'
        ]);

        $phieuNhap->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật phiếu nhập thành công',
            'data'    => $phieuNhap
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $phieuNhap = PhieuNhap::findOrFail($id);
        $phieuNhap->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa phiếu nhập thành công'
        ]);
    }
}
