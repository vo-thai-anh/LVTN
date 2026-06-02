<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\Sach;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Cloudinary\Cloudinary;

class SachController extends Controller
{
    private function getCloudinaryInstance()
    {
        $cloudinaryUrl = env('CLOUDINARY_URL');
        if (!$cloudinaryUrl) {
            throw new \Exception('Cấu hình CLOUDINARY_URL không tồn tại trong file .env');
        }
        return new Cloudinary($cloudinaryUrl);
    }

    private function getPublicIdFromUrl($url)
    {
        if (empty($url)) return null;
            $parts = explode('/api_uploads/', $url);
        if (count($parts) < 2) return null;
            $filename = 'api_uploads/' . explode('.', $parts[1])[0];
        return $filename;
    }

    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('size', 8);
        $query = Sach::with('loaiSach');
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('ten_sach', 'LIKE', '%' . $search . '%')
                    ->orWhere('tac_gia', 'LIKE', '%' . $search . '%');
            });
        }

        $sachs = $query->orderBy('sach_id', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $sachs
        ]);
    }
    /**
     * THÊM SÁCH MỚI: ID SỐ TỰ TĂNG + TIMESTAMPS TỰ ĐỘNG + UPLOAD CLOUDINARY
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'ten_sach'     => 'required|string|max:255',
            'tac_gia'      => 'required|string|max:255',
            'gia'          => 'required|numeric|min:0',
            'so_luong_ton' => 'required|integer|min:0',
            'loai_sach'    => 'nullable|integer',
            'nha_xuat_ban' => 'nullable|string|max:255',
            'mo_ta'        => 'nullable|string',
            'trang_thai'   => 'required|integer|in:0,1',
            'trong_luong'  => 'nullable|integer|min:0',
            'so_trang'     => 'nullable|integer|min:0',
            'kich_thuoc'   => 'nullable|string|max:100',
            'nha_cung_cap' => 'nullable|string|max:255',
            'anh_bia'      => 'nullable|string'
        ]);
        try {
            // --- BƯỚC 1: KHỞI TẠO SÁCH VỚI ẢNH BÌA RỖNG ---
            $sach = new Sach($validatedData);
            $sach->anh_bia = ''; // Gán ảnh bìa trống lúc ban đầu
            $sach->save();
            // --- BƯỚC 2: KIỂM TRA VÀ UPLOAD FILE LÊN CLOUDINARY ---
            if ($request->hasFile('anh_bia_file')) {
                $file = $request->file('anh_bia_file');
                $cloudinary = $this->getCloudinaryInstance();
                // Lúc này $sach->sach_id đã có giá trị là số tự tăng từ DB (Ví dụ: 15, 16...)
                $publicId =  $sach->sach_id;
                // Thực hiện đẩy file vào thư mục 'api_uploads' trên Cloudinary
                $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                    'folder' => 'api_uploads',
                    'public_id' => $publicId,
                    'resource_type' => 'auto',
                ]);
                print_r($result);
                // --- BƯỚC 3: LẤY LINK ẢNH VÀ CẬP NHẬT NGƯỢC LẠI ---
                if (isset($result['secure_url'])) {
                    $sach->anh_bia = $result['secure_url'];
                    $sach->save();
                }
            }
            return response()->json([
                'success' => true,
                'message' => 'Thêm sách mới và đồng bộ ảnh lên Cloudinary thành công!',
                'data' => $sach
            ], 201);
        } catch (\Exception $e) {
            if (isset($sach) && $sach->exists && empty($sach->anh_bia) && $request->hasFile('anh_bia_file')) {
                $sach->delete();
            }
            return response()->json([
                'success' => false,
                'message' => 'Lỗi thêm sách: ' . $e->getMessage()
            ], 500);
        }
    }
    public function show($id)
    {
        $sach = Sach::with('loaiSach')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data'    => $sach
        ]);
    }
    public function update(Request $request, $id)
    {
        $sach = Sach::findOrFail($id);

        $validatedData = $request->validate([
            'ten_sach'     => 'sometimes|required|string|max:255',
            'tac_gia'      => 'sometimes|required|string|max:255',
            'gia'          => 'sometimes|required|numeric|min:0',
            'so_luong_ton' => 'sometimes|required|integer|min:0',
            'loai_sach'    => 'sometimes|required|integer',
            'nha_xuat_ban' => 'nullable|string|max:255',
            'mo_ta'        => 'nullable|string',
            'trang_thai'   => 'sometimes|required|integer|in:0,1',
            'trong_luong'  => 'nullable|integer|min:0',
            'so_trang'     => 'nullable|integer|min:0',
            'kich_thuoc'   => 'nullable|string|max:100',
            'nha_cung_cap' => 'nullable|string|max:255',
            'anh_bia'      => 'nullable|string'
        ]);
        
        try {
            if ($request->hasFile('anh_bia_file')) {
                $file = $request->file('anh_bia_file');
                $cloudinary = $this->getCloudinaryInstance();

                // 1. DỌN DẸP: Tìm và xóa ảnh cũ trên Cloudinary để đỡ tốn tài nguyên dung lượng Cloud
                $oldPublicId = $this->getPublicIdFromUrl($sach->anh_bia);
                if ($oldPublicId) {
                    $cloudinary->uploadApi()->destroy($oldPublicId);
                }

                // 2. UPLOAD ẢNH MỚI
                $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                    'folder' => 'api_uploads',
                    'resource_type' => 'auto',
                ]);

                if (isset($result['secure_url'])) {
                    $validatedData['anh_bia'] = $result['secure_url'];
                }
            }

            $sach->update($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thông tin và thay đổi ảnh trên Cloudinary thành công!',
                'data' => $sach
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $sach = Sach::findOrFail($id);

        try {
            // Xóa ảnh đính kèm trên hệ thống Cloudinary trước
            $publicId = $this->getPublicIdFromUrl($sach->anh_bia);
            if ($publicId) {
                $cloudinary = $this->getCloudinaryInstance();
                $cloudinary->uploadApi()->destroy($publicId);
            }

            // Sau đó tiến hành xóa thông tin bản ghi sách dưới DB
            $sach->delete();

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa sản phẩm và giải phóng ảnh trên Cloudinary thành công!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa sản phẩm do ràng buộc dữ liệu: ' . $e->getMessage()
            ], 409);
        }
    }

    /**
     * Bộ lọc dữ liệu Client (Tìm kiếm, Giá, Thể loại)
     */
    public function filter(Request $request)
    {
        $query = Sach::with('loaiSach');

        if ($request->filled('loai_sach_id')) {
            $query->where('loai_sach', $request->loai_sach_id);
        }
        if ($request->filled('nha_xuat_ban')) {
            $query->where('nha_xuat_ban', 'LIKE', '%' . $request->nha_xuat_ban . '%');
        }
        if ($request->filled('gia_min')) {
            $query->where('gia', '>=', $request->gia_min);
        }
        if ($request->filled('gia_max')) {
            $query->where('gia', '<=', $request->gia_max);
        }

        if ($request->filled('sort_by')) {
            switch ($request->sort_by) {
                case 'gia_tang': $query->orderBy('gia', 'asc'); break;
                case 'gia_giam': $query->orderBy('gia', 'desc'); break;
                case 'moi_nhat': default: $query->orderBy('sach_id', 'desc'); break;
            }
        } else {
            $query->orderBy('sach_id', 'desc');
        }

        return response()->json([
            'success' => true,
            'data'    => $query->paginate(12)
        ]);
    }
}