<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Cloudinary\Cloudinary;

class ImageController extends Controller
{
    /**
     * Xử lý upload ảnh từ API và trả về JSON
     */
    public function upload(Request $request)
    {
        // 1. Kiểm tra dữ liệu đầu vào chuẩn API (Chặn lỗi Redirect của Laravel)
        $validator = Validator::make($request->all(), [
            'image' => 'required',
            'image.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'image.required' => 'Vui lòng chọn ít nhất một file ảnh.',
            'image.*.image'    => 'File tải lên phải là định dạng ảnh.',
            'image.*.mimes'    => 'Ảnh chỉ chấp nhận các định dạng: jpeg, png, jpg, gif.',
            'image.*.max'      => 'Kích thước ảnh tối đa là 2MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            if (!$request->hasFile('image')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy file ảnh trong request.'
                ], 400);
            }

            $files = $request->file('image');
            if (!is_array($files)) {
                $files = [$files];
            }

            $cloudinaryUrl = env('CLOUDINARY_URL');
            if (!$cloudinaryUrl) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cloudinary configuration not found'
                ], 500);
            }

            $cloudinary = new Cloudinary($cloudinaryUrl);
            $uploads = [];

            foreach ($files as $file) {
                if (!$file) {
                    continue;
                }

                $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                    'folder' => 'api_uploads',
                    'resource_type' => 'auto',
                ]);

                if (!$result || !isset($result['secure_url'])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Upload failed for one or more files.',
                        'debug' => $result
                    ], 500);
                }

                $uploads[] = [
                    'url' => $result['secure_url'],
                    'public_id' => $result['public_id'] ?? null,
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'Upload nhiều ảnh lên Cloudinary thành công!',
                'data' => $uploads,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi upload: ' . $e->getMessage(),
                'debug_file' => $e->getFile(),
                'debug_line' => $e->getLine(),
            ], 500);
        }
    }
}