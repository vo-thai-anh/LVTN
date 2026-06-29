<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\LoaiSach;
use Illuminate\Http\Request;

class LoaiSachController extends Controller
{
    public function index()
    {
        $loaisach = LoaiSach::withCount('sachs')->get();
        return response()->json(['success' => true, 'data' => $loaisach]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten_loai' => 'required|string|max:30|unique:loaisach,ten_loai',
        ]);

        $loaisach = LoaiSach::create([
            'ten_loai' => $validated['ten_loai']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo thể loại thành công.',
            'data'    => $loaisach
        ], 201);
    }
    public function show($id)
    {
        $loaisach = LoaiSach::with('sachs')->findOrFail($id);
        
        return response()->json(['success' => true, 'data' => $loaisach]);
    }
    public function update(Request $request, $id)
    {
        $loaisach = LoaiSach::findOrFail($id);

        $validated = $request->validate([
            'ten_loai' => 'required|string|max:30|unique:loaisach,ten_loai,' . $id . ',loai_sach_id',
        ]);

        $loaisach->update([
            'ten_loai' => $validated['ten_loai']
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Cập nhật thành công.', 
            'data' => $loaisach
        ]);
    }
    public function destroy($id)
    {
        $loaisach = LoaiSach::findOrFail($id);
        if ($loaisach->sachs()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa: Vẫn còn sách thuộc thể loại này.'
            ], 409);
        }

        $loaisach->delete();

        return response()->json(['success' => true, 'message' => 'Đã xóa thành công.']);
    }
}