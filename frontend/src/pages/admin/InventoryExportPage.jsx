import React, { useState } from 'react';
import { AdminAPI } from '../../services/adminService';

const InventoryExportPage = () => {
    // Logic: Form tạo phiếu xuất, gọi adminService.createPhieuXuat
    // Cần thêm logic kiểm tra: nếu so_luong_xuat > tồn_kho thì báo lỗi
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Quản Lý Xuất Kho</h1>
            {/* Form chọn sách và xuất hàng */}
        </div>
    );
};
export default InventoryExportPage;