<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\LoaiSach;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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
            'ten_loai' => 'required|string|max:30'
        ]);

        $loaisach = new LoaiSach([
            'ten_loai' => $validated['ten_loai']
        ]);
        $loaisach->loai_sach_id = strtoupper(Str::random(10));
        $loaisach->save();

        return response()->json([
            'success' => true,
            'message' => 'Tạo loại sách thành công',
            'data'    => $loaisach
        ], 201);
    }

    public function show($id)
    {

        $loaisach = LoaiSach::with('sachs')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data'    => $loaisach
        ]);
    }
    

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
