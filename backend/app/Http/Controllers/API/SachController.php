<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\Controller;
use App\Models\Sach;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SachController extends Controller
{
    public function index()
    {
        $sachs = Sach::with('loaisach')->paginate(12);

        return response()->json([
            'success' => true,
            'data'    => $sachs
        ]);
    }
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'ten_sach'     => 'required|string|max:255',
            'tac_gia'      => 'required|string|max:255',
            'gia'          => 'required|numeric|min:0',
            'so_luong'     => 'required|integer|min:0',
            'loai_sach_id' => 'required|exists:loaisach,loai_sach_id',
            'anh_bia'      => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'mo_ta'        => 'nullable|string',
        ]);

        $validatedData['loai_sach'] = $validatedData['loai_sach_id'];
        unset($validatedData['loai_sach_id']);

        try {
                if ($request->hasFile('anh_bia')) {
                $path = $request->file('anh_bia')->store('books', 'public');
                $validatedData['anh_bia'] = asset('storage/' . $path);
                $file = $request->file('anh_bia');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('assets/product'), $fileName);
                $validatedData['anh_bia'] = 'assets/product/' . $fileName;
            }
            $sach = new Sach($validatedData);
            $sach->sach_id = strtoupper(Str::random(10));
            $sach->save();
            return response()->json([
                'success' => true,
                'message' => 'Thêm sách thành công',
                'data' => $sach
            ], 201);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);

        }
    }
    public function filter(Request $request)
    {
        $query = Sach::with('loaisach');
        if ($request->has('loai_sach_id') && $request->loai_sach_id != '') {
            $query->where('loai_sach_id', $request->loai_sach_id);
        }
        if ($request->has('nha_xuat_ban') && $request->nha_xuat_ban != '') {
            $query->where('nha_xuat_ban', 'LIKE', '%' . $request->nha_xuat_ban . '%');
        }
        if ($request->has('gia_min') && $request->gia_min != '') {
            $query->where('gia', '>=', $request->gia_min);
        }
        if ($request->has('gia_max') && $request->gia_max != '') {
            $query->where('gia', '<=', $request->gia_max);
        }
        if ($request->has('sort_by') && $request->sort_by != '') {
            switch ($request->sort_by) {
                case 'gia_tang':
                    $query->orderBy('gia', 'asc');
                    break;
                case 'gia_giam':
                    $query->orderBy('gia', 'desc');
                    break;
                case 'moi_nhat':
                    $query->orderBy('id', 'desc');
                    break;
            }
        } else {
            $query->orderBy('id', 'desc');
        }

        $sachs = $query->paginate(12);

        return response()->json([
            'success' => true,
            'data'    => $sachs
        ]);
    }
    public function show($id)
    {
        $sach = Sach::with('loaisach')->findOrFail($id);
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
            'so_luong'     => 'sometimes|required|integer|min:0',
            'loai_sach_id' => 'sometimes|required|exists:loaisach,loai_sach_id',
            'anh_bia'      => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'mo_ta'        => 'nullable|string',
        ]);

        if (isset($validatedData['loai_sach_id'])) {
            $validatedData['loai_sach'] = $validatedData['loai_sach_id'];
            unset($validatedData['loai_sach_id']);
        }

        if ($request->hasFile('anh_bia')) {
            $path = $request->file('anh_bia')->store('books', 'public');
            $validatedData['anh_bia'] = asset('storage/' . $path);
            $file = $request->file('anh_bia');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('assets/product'), $fileName);
            $validatedData['anh_bia'] = 'assets/product/' . $fileName;
        }

        $sach->update($validatedData);
        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sách thành công',
            'data' => $sach
        ]);
    }

    public function destroy($id)
    {
        $sach = Sach::findOrFail($id);
        $sach->delete();
        return response()->json([
            'success' => true,
            'message' => 'Xóa sách thành công'
        ]);
    }

    public function search(Request $request)
    {
        $query = Sach::with('loaisach');

        if ($request->filled('search')) {

            $keyword = strtolower($request->search);

            $query->whereRaw("
                LOWER(REPLACE(unaccent(ten_sach), ' ', ''))
                ILIKE
                LOWER(REPLACE(unaccent(?), ' ', ''))
            ", ["%$keyword%"]);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(12)
        ]);
    }
}
