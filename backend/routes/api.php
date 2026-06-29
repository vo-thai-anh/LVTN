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
use App\Http\Controllers\API\PhuongThucThanhToanController;

Route::post('/login',[AuthController::class,'login']); //v
Route::post('/register',[AuthController::class,'register']);//v
Route::post('/registerNhanVien', [AuthController::class, 'registerNhanVien']);//v
Route::get('/sach/filter', [SachController::class, 'filter']);//v
Route::get('/sach/search', [SachController::class, 'search']);//v
Route::get('/sach', [SachController::class, 'index']);//v
Route::get('/sach/{id}', [SachController::class, 'show']);//v

Route::get('/loaisach', [LoaiSachController::class, 'index']);//v
Route::get('/loaisach/{id}', [LoaiSachController::class, 'show']);//v

route::post('/themloainguoidung', [LoaiNguoiDungController::class, 'store']);//v
route::get('/chitietloainguoidung/{id}', [LoaiNguoiDungController::class, 'show']);
route::put('/sualoainguoidung/{id}', [LoaiNguoiDungController::class, 'update']);//v
route::delete('/xoaloainguoidung/{id}', [LoaiNguoiDungController::class, 'destroy']);//v

route::post('/themphuongthuc', [PhuongThucThanhToanController::class, 'store']);//v

Route::middleware('auth:sanctum')->group(function () {
    //admin
    Route::get('/nguoidung', [AdminController::class, 'index']);//v
    //nhanvien
    
    // người dùng
    Route::get('/nguoidung/{id}', [KhachHangController::class, 'show']);//v
    Route::put('/nguoidung/{id}', [KhachHangController::class, 'update']);
    Route::delete('/nguoidung/{id}', [KhachHangController::class, 'destroy']);
    // giỏ hàng
    Route::get('/giohang', [GioHangController::class, 'index']);//v
    Route::post('/giohang', [GioHangController::class, 'store']);//v
    Route::put('/giohang/{id}', [GioHangController::class, 'update']);//v
    Route::delete('/giohang/{id}', [GioHangController::class, 'destroy']);//v

    //loainguoidung
    route::get('/loainguoidung', [LoaiNguoiDungController::class, 'index']);//v

    // quản lý sách
    Route::post('/sach', [SachController::class, 'store']);//v
    Route::post('/sach/{id}', [SachController::class, 'update']);//v
    Route::delete('/sach/{id}', [SachController::class, 'destroy']);//v

    // quản lý loại sách
    Route::post('/loaisach', [LoaiSachController::class, 'store']);//v
    Route::put('/loaisach/{id}', [LoaiSachController::class, 'update']);//v
    Route::delete('/loaisach/{id}', [LoaiSachController::class, 'destroy']);//v

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
    Route::patch('/donhang/{id}', [DonhangController::class, 'updateStatus']);
    
    Route::post('/chitietgiohang/them', [GioHang_ItemController::class, 'themVaoGio']);//v
    Route::put('/chitietgiohang/{sach}', [GioHang_ItemController::class, 'capNhatSoLuong']);//v
    Route::delete('/chitietgiohang/{sach}', [GioHang_ItemController::class, 'xoaChiTiet']);//v
    //sepay
    Route::post('/webhook/sepay', [DonHangController::class, 'handleSePayWebhook']);
});






