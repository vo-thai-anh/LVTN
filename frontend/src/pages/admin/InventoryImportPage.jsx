import React, { useState, useEffect } from 'react';
import { AdminAPI } from '../../services/adminService';
import { Plus, Trash2, Save } from 'lucide-react';

const InventoryImportPage = () => {
    const [chiTiet, setChiTiet] = useState([{ sach_id: '', so_luong: 1, don_gia_nhap: 0 }]);

    const handleAddRow = () => {
        setChiTiet([...chiTiet, { sach_id: '', ten_sach: '', search_query: '', so_luong: 1, don_gia_nhap: 0, open_dropdown: false }]);
    };

    const handleRemoveRow = (index) => {
        if (chiTiet.length === 1) {
            toast.error('Phiếu nhập phải có ít nhất 1 mặt hàng');
            return;
        }
        setChiTiet(chiTiet.filter((_, i) => i !== index));
    };

    const handleSearchChange = (index, value) => {
        const newChiTiet = [...chiTiet];
        newChiTiet[index].search_query = value;
        newChiTiet[index].open_dropdown = true;
        setChiTiet(newChiTiet);
    };

    const handleSelectBook = (index, book) => {
        const newChiTiet = [...chiTiet];
        newChiTiet[index].sach_id = book.id;
        newChiTiet[index].ten_sach = book.tenSach;
        newChiTiet[index].search_query = book.tenSach;
        newChiTiet[index].don_gia_nhap = book.gia || 0;
        newChiTiet[index].open_dropdown = false;
        setChiTiet(newChiTiet);
    };

    const handleQuantityChange = (index, value) => {
        const newChiTiet = [...chiTiet];
        newChiTiet[index].so_luong = Math.max(1, parseInt(value) || 0);
        setChiTiet(newChiTiet);
    };

    const handlePriceChange = (index, value) => {
        const newChiTiet = [...chiTiet];
        newChiTiet[index].don_gia_nhap = Math.max(0, parseFloat(value) || 0);
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
            console.error('Lỗi submit:', error);
            const msg = error.response?.data?.message || error.message || 'Lỗi không xác định';
            toast.error("Có lỗi xảy ra: " + msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewDetail = (phieu) => {
        setSelectedPhieu(phieu);
        setShowDetailModal(true);
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
            )}
        </div>
    );
};

export default InventoryImportPage;