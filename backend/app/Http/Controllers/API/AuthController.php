<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\KhachHang;
use App\Models\NhanVien;
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
                'ten_dang_nhap'   => 'required|string|max:30|unique:taikhoan,ten_dang_nhap',
                'mat_khau'        => 'required|string|min:6|confirmed',
                'loai_nguoi_dung' => 'nullable|integer|exists:loainguoidung,loai_nguoi_dung_id',
                
                'ten_khach_hang'  => 'required|string|max:100',
                'email'           => 'required|email|max:100|unique:khachhang,email',
                'so_dien_thoai'   => 'required|string|max:10|unique:khachhang,so_dien_thoai',
                'dia_chi'         => 'required|string|max:255',
                'gioi_tinh'       => 'nullable|string|max:10',
                'nam_sinh'        => 'nullable|date',
            ], [
                'ten_dang_nhap.required' => 'Tên đăng nhập không được để trống.',
                'ten_dang_nhap.unique'   => 'Tên đăng nhập này đã tồn tại trên hệ thống.',
                'mat_khau.required'      => 'Mật khẩu không được để trống.',
                'mat_khau.min'           => 'Mật khẩu phải từ 6 ký tự trở lên.',
                'mat_khau.confirmed'     => 'Xác nhận mật khẩu không trùng khớp.',
                'ten_khach_hang.required'=> 'Vui lòng nhập họ và tên của bạn.',
                'email.required'         => 'Email không được bỏ trống.',
                'email.unique'           => 'Email này đã được đăng ký sử dụng.',
                'so_dien_thoai.required' => 'Số điện thoại không được bỏ trống.',
                'so_dien_thoai.unique'   => 'Số điện thoại này đã tồn tại.',
                'dia_chi.required'       => 'Vui lòng nhập địa chỉ giao hàng.',
            ]);

            DB::beginTransaction();

            $taiKhoan = TaiKhoan::create([
                'ten_dang_nhap'   => $validated['ten_dang_nhap'],
                'mat_khau'        => Hash::make($validated['mat_khau']),
                'loai_nguoi_dung' => $validated['loai_nguoi_dung'] ?? 1,
            ]);
            $generatedKhachHangId = 'KH' . substr(time(), -8);
            $khachHang = KhachHang::create([
                'khach_hang_id'   => $generatedKhachHangId,
                'ten_khach_hang'  => $validated['ten_khach_hang'],
                'email'           => $validated['email'],
                'so_dien_thoai'   => $validated['so_dien_thoai'],
                'dia_chi'         => $validated['dia_chi'],
                'gioi_tinh'       => $validated['gioi_tinh'] ?? null,
                'nam_sinh'        => $validated['nam_sinh'] ?? null,
                'tai_khoan_id'    => $taiKhoan->tai_khoan_id,
            ]);
            DB::commit();
            return response()->json([
                "success" => true,
                "message" => "Đăng ký tài khoản khách hàng thành công!",
                "data"    => [
                    "tai_khoan" => [
                        "tai_khoan_id"  => $taiKhoan->tai_khoan_id,
                        "ten_dang_nhap" => $taiKhoan->ten_dang_nhap,
                    ],
                    "khach_hang" => $khachHang
                ]
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                "success" => false,
                "message" => "Dữ liệu đăng ký không hợp lệ, vui lòng kiểm tra lại.",
                "errors"  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "success" => false,
                "message" => "Hệ thống gặp sự cố, không thể hoàn tất đăng ký.",
                "error"   => $e->getMessage()
            ], 500);
        }
    }

    public function registerNhanVien(Request $request)
    {
        try {
            $validated = $request->validate([
                'ten_dang_nhap'   => 'required|string|max:30|unique:taikhoan,ten_dang_nhap',
                'mat_khau'        => 'required|string|min:6',
                'email'           => 'required|unique:taikhoan,email',
                'ten_nhan_vien'   => 'required|string|max:100',
                'so_dien_thoai'   => 'required|string|max:10',
                'chuc_vu'         => 'required|string',
                'loai_nguoi_dung' => 'required|integer|exists:loainguoidung,loai_nguoi_dung_id',
            ]);
            DB::beginTransaction();
            $taiKhoan = TaiKhoan::create([
                'ten_dang_nhap' => $validated['ten_dang_nhap'],
                'mat_khau'      => Hash::make($validated['mat_khau']),
                'email'         => $validated['email'],
                'loai_nguoi_dung'=> $validated['loai_nguoi_dung'],
                'ngay_tao'      => now(),
            ]);
            $nhanVien = NhanVien::create([
                'ma_nhan_vien' => 'NV' . str_pad(NhanVien::max('nhan_vien_id') + 1, 6, '0', STR_PAD_LEFT),
                'ten_nhan_vien' => $validated['ten_nhan_vien'],
                'so_dien_thoai' => $validated['so_dien_thoai'],
                'email'         => $validated['email'],
                'chuc_vu'       => $validated['chuc_vu'],
                'tai_khoan_id'  => $taiKhoan->tai_khoan_id,
            ]);
            DB::commit();
            return response()->json([
                "success" => true,
                "message" => "Đã tạo tài khoản nhân viên thành công!",
                "data"    => ["tai_khoan" => $taiKhoan, "nhan_vien" => $nhanVien]
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(["success" => false, "message" => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(["success" => false, "message" => "Lỗi: " . $e->getMessage()], 500);
        }
    }
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
            $taiKhoan = TaiKhoan::where('ten_dang_nhap', $request->ten_dang_nhap)->first();
            if (!$taiKhoan || !Hash::check($request->mat_khau, $taiKhoan->mat_khau)) {
                return response()->json([
                    "success" => false,
                    "message" => "Tên đăng nhập hoặc mật khẩu không chính xác"
                ], 401);
            }
            $khachHang = KhachHang::where('tai_khoan_id', $taiKhoan->tai_khoan_id)->first();
            $token = $taiKhoan->createToken('auth_token')->plainTextToken;
            return response()->json([
                'success'      => true,
                'message'      => 'Đăng nhập thành công',
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => [
                    'tai_khoan_id'   => $taiKhoan->tai_khoan_id,
                    'ten_dang_nhap' => $taiKhoan->ten_dang_nhap,
                    'loai_nguoi_dung' => $taiKhoan->loai_nguoi_dung,
                    'thong_tin_chi_tiet' => $khachHang
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
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công!'
        ], 200);
    }
}