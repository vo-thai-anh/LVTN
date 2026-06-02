<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\LoaiSach;
use Illuminate\Http\Request;

class LoaiSachController extends Controller
{
    public function index()
    {
        $loaisach = LoaiSach::with('sachs')->get();
        return response()->json([
            'success' => true,
            'data'    => $loaisach
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten_loai' => 'required|string|max:30|unique:loaisach,ten_loai',
        ]);
        try {
            $loaisach = LoaiSach::create([
                'ten_loai' => $validated['ten_loai']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Tạo thể loại sách mới thành công.',
                'data'    => $loaisach
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo loại sách: ' . $e->getMessage()
            ], 500);
        }
    }
    public function show($id)
    {
        $loaisach = LoaiSach::with('sachs')->where('loai_sach_id', $id)->first();
        
        if (!$loaisach) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thể loại sách này trên hệ thống.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $loaisach
        ]);
    }
    public function update(Request $request, $id)
    {
        $loaisach = LoaiSach::where('loai_sach_id', $id)->first();
        if (!$loaisach) {
            return response()->json([
                'success' => false,
                'message' => 'Thể loại sách không tồn tại.'
            ], 404);
        }
        // Kiểm tra validation, loại trừ trùng tên với chính bản ghi hiện tại đang sửa
        $validated = $request->validate([
            'ten_loai' => 'required|string|max:30|unique:loaisach,ten_loai,' . $id . ',loai_sach_id',
        ]);
        // Cập nhật tên loại sách.
        // Nhờ có $timestamps = true, Laravel sẽ tự động cập nhật lại thời gian thay đổi mới nhất vào DB.
        $loaisach->update([
            'ten_loai' => $validated['ten_loai']
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin thể loại sách thành công.',
            'data'    => $loaisach
        ]);
    }
    public function destroy($id)
    {
        $loaisach = LoaiSach::where('loai_sach_id', $id)->first();

        if (!$loaisach) {
            return response()->json([
                'success' => false,
                'message' => 'Thể loại sách không tồn tại hoặc đã bị xóa trước đó.'
            ], 404);
        }

        // Tiến hành xóa bản ghi
        $loaisach->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa hoàn toàn thể loại sách ra khỏi hệ thống.'
        ]);
    }
}