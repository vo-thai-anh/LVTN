import React, { useState } from 'react';
import { AdminAPI } from '../../services/adminService';
import { Plus, Trash2, Save } from 'lucide-react';

const InventoryImportPage = () => {
    const [chiTiet, setChiTiet] = useState([{ sach_id: '', so_luong: 1, don_gia_nhap: 0 }]);

    const handleAddRow = () => {
        setChiTiet([...chiTiet, { sach_id: '', so_luong: 1, don_gia_nhap: 0 }]);
    };

    const handleRemoveRow = (index) => {
        setChiTiet(chiTiet.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const newChiTiet = [...chiTiet];
        newChiTiet[index][field] = value;
        setChiTiet(newChiTiet);
    };

    const handleSubmit = async () => {
        try {
            await adminService.createPhieuNhap({
                ngay_nhap: new Date().toISOString().split('T')[0],
                chi_tiet: chiTiet
            });
            alert("Nhập kho thành công!");
        } catch (error) {
            alert("Có lỗi xảy ra: " + error.response?.data?.message);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Tạo Phiếu Nhập Kho</h2>
            {chiTiet.map((row, index) => (
                <div key={index} className="flex gap-2 mb-2">
                    <input type="text" placeholder="ID Sách" className="border p-2" onChange={(e) => handleChange(index, 'sach_id', e.target.value)} />
                    <input type="number" placeholder="Số lượng" className="border p-2 w-24" onChange={(e) => handleChange(index, 'so_luong', e.target.value)} />
                    <input type="number" placeholder="Đơn giá" className="border p-2 w-32" onChange={(e) => handleChange(index, 'don_gia_nhap', e.target.value)} />
                    <button onClick={() => handleRemoveRow(index)} className="text-red-500"><Trash2 size={20} /></button>
                </div>
            ))}
            <button onClick={handleAddRow} className="bg-blue-500 text-white p-2 rounded flex items-center gap-1"><Plus size={16}/> Thêm sách</button>
            <button onClick={handleSubmit} className="bg-green-600 text-white p-2 rounded ml-2 flex items-center gap-1"><Save size={16}/> Lưu phiếu</button>
        </div>
    );
};

export default InventoryImportPage;