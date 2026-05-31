<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\KhachHang;
use App\Models\TaiKhoan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                // Validate cho bảng taikhoan
                'tai_khoan_id'  => 'required|string|max:10|unique:taikhoan,tai_khoan_id',
                'ten_dang_nhap' => 'required|string|max:30|unique:taikhoan,ten_dang_nhap',
                'mat_khau'      => 'required|string|min:6|confirmed',
                
                // Validate cho bảng khachhang
                'khach_hang_id' => 'required|string|max:10|unique:khachhang,khach_hang_id',
                'ten_khach_hang'=> 'required|string|max:30',
                'email'         => 'required|email|max:30|unique:khachhang,email',
                'so_dien_thoai' => 'required|string|max:10|unique:khachhang,so_dien_thoai',
                'dia_chi'       => 'required|string|max:255',
                'gioi_tinh'     => 'nullable|string|max:10',
                'nam_sinh'      => 'nullable|date',
            ]);

            DB::beginTransaction();

            // 1. Tạo bản ghi tài khoản bảo mật trước
            $taiKhoan = TaiKhoan::create([
                'tai_khoan_id'  => $validated['tai_khoan_id'],
                'ten_dang_nhap' => $validated['ten_dang_nhap'],
                'mat_khau'      => Hash::make($validated['mat_khau']),
            ]);

            // 2. Tạo bản ghi thông tin chi tiết khách hàng trỏ về tài khoản trên
            $khachHang = KhachHang::create([
                'khach_hang_id'  => $validated['khach_hang_id'],
                'ten_khach_hang' => $validated['ten_khach_hang'],
                'email'          => $validated['email'],
                'so_dien_thoai'  => $validated['so_dien_thoai'],
                'dia_chi'        => $validated['dia_chi'],
                'gioi_tinh'      => $validated['gioi_tinh'] ?? null,
                'nam_sinh'       => $validated['nam_sinh'] ?? null,
                'tai_khoan_id'   => $taiKhoan->tai_khoan_id, // Gắn khóa ngoại
            ]);

            DB::commit();

            return response()->json([
                "success" => true,
                "message" => "Đăng ký tài khoản khách hàng thành công",
                "data"    => [
                    "tai_khoan"  => $taiKhoan,
                    "khach_hang" => $khachHang
                ]
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                "success" => false,
                "message" => "Dữ liệu đầu vào không hợp lệ",
                "errors"  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "success" => false,
                "message" => "Lỗi hệ thống không thể đăng ký",
                "error"   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đăng nhập hệ thống (Kiểm tra từ bảng taikhoan và liên kết lấy thông tin khachhang)
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'ten_dang_nhap' => 'required|string',
                'mat_khau'      => 'required|string'
            ], [
                'ten_dang_nhap.required' => 'Vui lòng nhập tên đăng nhập',
                'mat_khau.required'      => 'Vui lòng nhập mật khẩu'
            ]);

            // Tìm tài khoản bảo mật trước
            $taiKhoan = TaiKhoan::where('ten_dang_nhap', $request->ten_dang_nhap)->first();

            if (!$taiKhoan || !Hash::check($request->mat_khau, $taiKhoan->mat_khau)) {
                return response()->json([
                    "success" => false,
                    "message" => "Tên đăng nhập hoặc mật khẩu không chính xác"
                ], 401);
            }

            // Lấy thông tin khách hàng đi kèm với tài khoản này (nếu có)
            $khachHang = KhachHang::where('tai_khoan_id', $taiKhoan->tai_khoan_id)->first();

            // Khởi tạo Token bằng Laravel Sanctum (Đảm bảo model TaiKhoan đã use HasApiTokens)
            $token = $taiKhoan->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success'      => true,
                'message'      => 'Đăng nhập thành công',
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => [
                    'tai_khoan_id'  => $taiKhoan->tai_khoan_id,
                    'ten_dang_nhap' => $taiKhoan->ten_dang_nhap,
                    'thong_tin_chi_tiet' => $khachHang // Trả về thông tin email, sđt, địa chỉ...
                ]
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                "success" => false,
                "message" => "Thiếu thông tin đăng nhập",
                "errors"  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                "success" => false,
                "message" => "Lỗi máy chủ",
                "error"   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đăng xuất hệ thống
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công!'
        ], 200);
    }
}
