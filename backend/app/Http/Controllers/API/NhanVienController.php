<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\NhanVien;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NhanVienController extends Controller
{

    public function index()
    {
        $nhanviens = NhanVien::with(['taiKhoan', 'loaiNguoiDung'])->paginate(20);
        return response()->json([
            'success' => true,
            'data'    => $nhanviens
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten_nhan_vien'  => 'required|string|max:30',
            'email'          => 'required|email|max:30|unique:nhanvien,email',
            'so_dien_thoai'  => 'required|string|max:10|unique:nhanvien,so_dien_thoai',
            'dia_chi'        => 'nullable|string|max:255',
            'gioi_tinh'      => 'nullable|string|max:10',
            'nam_sinh'       => 'nullable|date',
            'tai_khoan_id'   => 'required|string|exists:taikhoan,tai_khoan_id',
            'loai_nguoi_dung'=> 'required|string|exists:loainguoidung,loai_nguoi_dung_id'
        ]);

        $nhanVien = new NhanVien([
            'ten_nhan_vien' => $validated['ten_nhan_vien'],
            'email'         => $validated['email'],
            'so_dien_thoai' => $validated['so_dien_thoai'],
            'dia_chi'       => $validated['dia_chi'] ?? null,
            'gioi_tinh'     => $validated['gioi_tinh'] ?? null,
            'nam_sinh'      => $validated['nam_sinh'] ?? null,
        ]);
        $nhanVien->nhan_vien_id = strtoupper(Str::random(10));
        $nhanVien->tai_khoan_id = $validated['tai_khoan_id'];
        $nhanVien->loai_nguoi_dung = $validated['loai_nguoi_dung'];
        $nhanVien->save();

        return response()->json([
            'success' => true,
            'message' => 'Tạo nhân viên thành công',
            'data'    => $nhanVien
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $nhanVien = NhanVien::with(['taiKhoan', 'loaiNguoiDung'])->findOrFail($id);
        return response()->json([
            'success' => true,
            'data'    => $nhanVien
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $nhanVien = NhanVien::findOrFail($id);

        $validated = $request->validate([
            'ten_nhan_vien'  => 'sometimes|required|string|max:30',
            'email'          => 'sometimes|required|email|max:30|unique:nhanvien,email,' . $id . ',nhan_vien_id',
            'so_dien_thoai'  => 'sometimes|required|string|max:10|unique:nhanvien,so_dien_thoai,' . $id . ',nhan_vien_id',
            'dia_chi'        => 'nullable|string|max:255',
            'gioi_tinh'      => 'nullable|string|max:10',
            'nam_sinh'       => 'nullable|date',
            'tai_khoan_id'   => 'sometimes|required|string|exists:taikhoan,tai_khoan_id',
            'loai_nguoi_dung'=> 'sometimes|required|string|exists:loainguoidung,loai_nguoi_dung_id'
        ]);

        if (isset($validated['ten_nhan_vien'])) {
            $nhanVien->ten_nhan_vien = $validated['ten_nhan_vien'];
        }
        if (isset($validated['email'])) {
            $nhanVien->email = $validated['email'];
        }
        if (isset($validated['so_dien_thoai'])) {
            $nhanVien->so_dien_thoai = $validated['so_dien_thoai'];
        }
        if (array_key_exists('dia_chi', $validated)) {
            $nhanVien->dia_chi = $validated['dia_chi'];
        }
        if (array_key_exists('gioi_tinh', $validated)) {
            $nhanVien->gioi_tinh = $validated['gioi_tinh'];
        }
        if (array_key_exists('nam_sinh', $validated)) {
            $nhanVien->nam_sinh = $validated['nam_sinh'];
        }
        if (isset($validated['tai_khoan_id'])) {
            $nhanVien->tai_khoan_id = $validated['tai_khoan_id'];
        }
        if (isset($validated['loai_nguoi_dung'])) {
            $nhanVien->loai_nguoi_dung = $validated['loai_nguoi_dung'];
        }

        $nhanVien->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật nhân viên thành công',
            'data'    => $nhanVien
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $nhanVien = NhanVien::findOrFail($id);
        $nhanVien->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa nhân viên thành công'
        ]);
    }
}
