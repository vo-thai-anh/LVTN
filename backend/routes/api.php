<?php

use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\ImageController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\SachController;
use App\Http\Controllers\API\LoaiSachController;
use App\Http\Controllers\API\GioHangController;
use App\Http\Controllers\API\DonHangController;
use App\Http\Controllers\API\GioHang_ItemController;
use App\Http\Controllers\API\KhachHangController;
use App\Http\Controllers\API\LoaiNguoiDungController;
use App\Http\Controllers\API\NhanVienController;
use App\Http\Controllers\API\PhieuNhapController;
use App\Http\Controllers\API\PhieuXuatController;

Route::post('/login',[AuthController::class,'login']);
Route::post('/register',[AuthController::class,'register']);
Route::post('/registerNhanVien', [AuthController::class, 'registerNhanVien']);
Route::get('/sach/filter', [SachController::class, 'filter']);
Route::get('/sach/search', [SachController::class, 'search']);
Route::get('/sach', [SachController::class, 'index']);
Route::get('/sach/{id}', [SachController::class, 'show']);

Route::get('/loaisach', [LoaiSachController::class, 'index']);
Route::get('/loaisach/{id}', [LoaiSachController::class, 'show']);

route::post('/themloainguoidung', [LoaiNguoiDungController::class, 'store']);
route::get('/chitietloainguoidung/{id}', [LoaiNguoiDungController::class, 'show']);
route::put('/sualoainguoidung/{id}', [LoaiNguoiDungController::class, 'update']);
route::delete('/xoaloainguoidung/{id}', [LoaiNguoiDungController::class, 'destroy']);
Route::middleware('auth:sanctum')->group(function () {
    //admin
    Route::get('/nguoidung', [AdminController::class, 'index']);
    //nhanvien
    // người dùng
    Route::get('/nguoidung/{id}', [KhachHangController::class, 'show']);
    Route::put('/nguoidung/{id}', [KhachHangController::class, 'update']);
    Route::delete('/nguoidung/{id}', [KhachHangController::class, 'destroy']);
    // giỏ hàng
    Route::get('/giohang', [GioHangController::class, 'index']);
    Route::post('/giohang', [GioHangController::class, 'store']);
    Route::put('/giohang/{id}', [GioHangController::class, 'update']);
    Route::delete('/giohang/{id}', [GioHangController::class, 'destroy']);
    //loainguoidung
    route::get('/loainguoidung', [LoaiNguoiDungController::class, 'index']);

    // quản lý sách
    Route::post('/sach', [SachController::class, 'store']);
    Route::post('/sach/{id}', [SachController::class, 'update']);
    Route::delete('/sach/{id}', [SachController::class, 'destroy']);

    // quản lý loại sách
    Route::post('/loaisach', [LoaiSachController::class, 'store']);
    Route::put('/loaisach/{id}', [LoaiSachController::class, 'update']);
    Route::delete('/loaisach/{id}', [LoaiSachController::class, 'destroy']);

    // quản lý nhân viên
    Route::get('/nhanvien', [NhanVienController::class, 'index']);
    Route::post('/nhanvien', [NhanVienController::class, 'store']);
    Route::get('/nhanvien/{id}', [NhanVienController::class, 'show']);
    Route::put('/nhanvien/{id}', [NhanVienController::class, 'update']);
    Route::delete('/nhanvien/{id}', [NhanVienController::class, 'destroy']);

    // quản lý phiếu nhập
    Route::get('/phieunhap', [PhieuNhapController::class, 'index']);
    Route::post('/phieunhap', [PhieuNhapController::class, 'store']);
    Route::get('/phieunhap/{id}', [PhieuNhapController::class, 'show']);
    Route::put('/phieunhap/{id}', [PhieuNhapController::class, 'update']);
    Route::delete('/phieunhap/{id}', [PhieuNhapController::class, 'destroy']);

    // quản lý phiếu xuất
    Route::get('/phieuxuat', [PhieuXuatController::class, 'index']);
    Route::post('/phieuxuat', [PhieuXuatController::class, 'store']);
    Route::get('/phieuxuat/{id}', [PhieuXuatController::class, 'show']);
    Route::put('/phieuxuat/{id}', [PhieuXuatController::class, 'update']);
    Route::delete('/phieuxuat/{id}', [PhieuXuatController::class, 'destroy']);

    // đơn hàng
    Route::get('donhang', [DonhangController::class, 'index']);
    Route::post('/checkout', [DonhangController::class, 'checkout']);
    Route::get('/donhang/{id}', [DonhangController::class, 'show']);
    Route::delete('/donhang/{id}', [DonhangController::class, 'huydon']);

    // chi tiết giỏ hàng
    Route::post('/chitietgiohang/them', [GioHang_ItemController::class, 'themVaoGio']);
    Route::put('/chitietgiohang/{sach}', [GioHang_ItemController::class, 'capNhatSoLuong']);
    Route::delete('/chitietgiohang/{sach}', [GioHang_ItemController::class, 'xoaChiTiet']);
});






