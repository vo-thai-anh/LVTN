<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API;
use App\Models\LoaiNguoiDung;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class LoaiNguoiDungController extends Controller
{

    public function index()
    {
        try {
            $loais = LoaiNguoiDung::all();
            
            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách loại người dùng thành công',
                'data'    => $loais
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống không thể lấy dữ liệu',
                'error'    => $e->getMessage()
            ], 500);
        }
    }
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ten' => 'required|string|max:50|unique:loainguoidung,ten',
        ], [
            'ten.required' => 'Tên loại người dùng không được để trống.',
            'ten.max'      => 'Tên loại người dùng tối đa 50 ký tự.',
            'ten.unique'   => 'Tên loại người dùng này đã tồn tại.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu đầu vào không hợp lệ',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $loaiNguoiDung = LoaiNguoiDung::create([
                'ten' => $request->ten
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thêm mới loại người dùng thành công',
                'data'    => $loaiNguoiDung
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi không thể thêm mới dữ liệu',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function show(string $id)
    {
        try {
            $loai = LoaiNguoiDung::find($id);

            if (!$loai) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy loại người dùng có mã: ' . $id
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tìm thấy thông tin chi tiết',
                'data'    => $loai
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi máy chủ',
                'error'    => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 4. Cập nhật thông tin loại người dùng (Loại trừ bản ghi hiện tại khi check trùng tên)
     */
    public function update(Request $request, string $id)
    {
        $loai = LoaiNguoiDung::find($id);

        if (!$loai) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy loại người dùng để cập nhật'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'ten' => 'required|string|max:50|unique:loainguoidung,ten,' . $id . ',loai_nguoi_dung_id',
        ], [
            'ten.required' => 'Tên loại người dùng không được để trống.',
            'ten.max'      => 'Tên loại người dùng tối đa 50 ký tự.',
            'ten.unique'   => 'Tên loại người dùng này đã bị trùng với loại khác.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu cập nhật không hợp lệ',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $loai->update([
                'ten' => $request->ten
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thông tin thành công',
                'data'    => $loai
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi không thể cập nhật',
                'error'    => $e->getMessage()
            ], 500);
        }
    }
    public function destroy(string $id)
    {
        try {
            $loai = LoaiNguoiDung::find($id);

            if (!$loai) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy loại người dùng cần xóa'
                ], 404);
            }

            $loai->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa loại người dùng thành công'
            ], 200);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === "23000") {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa loại người dùng này vì đang có tài khoản liên kết thuộc nhóm này.'
                ], 409);
            }
            return response()->json([
                'success' => false,
                'message' => 'Lỗi ràng buộc cơ sở dữ liệu',
                'error'    => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống không thể xóa dữ liệu',
                'error'    => $e->getMessage()
            ], 500);
        }
    }
}