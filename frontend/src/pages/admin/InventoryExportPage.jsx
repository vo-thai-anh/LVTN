import React, { useState, useEffect } from 'react';
import { AdminAPI } from '../../services/adminService';
import { 
  Plus, Trash2, Save, Calendar, FileText, 
  Search, Eye, X, Loader2, History, Truck, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/inventory.css';

const InventoryExportPage = () => {
    // Tab state: 'history' or 'create'
    const [activeTab, setActiveTab] = useState('history');
    
    // History list state
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedPhieu, setSelectedPhieu] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Book list for searchable select
    const [books, setBooks] = useState([]);
    const [loadingBooks, setLoadingBooks] = useState(false);

    // Form state for creating Phieu Xuat
    const [ngayXuat, setNgayXuat] = useState(new Date().toISOString().split('T')[0]);
    const [ghiChu, setGhiChu] = useState('');
    const [chiTiet, setChiTiet] = useState([
        { sach_id: '', ten_sach: '', search_query: '', so_luong: 1, don_gia_xuat: 0, ton_kho: 0, open_dropdown: false }
    ]);
    const [submitting, setSubmitting] = useState(false);

    // Load initial data
    useEffect(() => {
        fetchHistory();
        fetchBooks();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await AdminAPI.getPhieuXuat();
            if (res && res.data) {
                setHistory(res.data.data || []);
            } else {
                setHistory(Array.isArray(res) ? res : []);
            }
        } catch (error) {
            console.error('Lỗi fetch history:', error);
            toast.error('Không thể tải lịch sử xuất kho');
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchBooks = async () => {
        try {
            setLoadingBooks(true);
            const res = await AdminAPI.getBooks({ size: 1000 });
            if (res && res.content) {
                setBooks(res.content);
            }
        } catch (error) {
            console.error('Lỗi tải danh mục sách:', error);
        } finally {
            setLoadingBooks(false);
        }
    };

    const handleAddRow = () => {
        setChiTiet([...chiTiet, { sach_id: '', ten_sach: '', search_query: '', so_luong: 1, don_gia_xuat: 0, ton_kho: 0, open_dropdown: false }]);
    };

    const handleRemoveRow = (index) => {
        if (chiTiet.length === 1) {
            toast.error('Phiếu xuất phải có ít nhất 1 mặt hàng');
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
        newChiTiet[index].don_gia_xuat = book.gia || 0;
        newChiTiet[index].ton_kho = book.soLuong || 0;
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
        newChiTiet[index].don_gia_xuat = Math.max(0, parseFloat(value) || 0);
        setChiTiet(newChiTiet);
    };

    const closeDropdownWithDelay = (index) => {
        setTimeout(() => {
            const newChiTiet = [...chiTiet];
            if (newChiTiet[index]) {
                newChiTiet[index].open_dropdown = false;
                if (!newChiTiet[index].sach_id) {
                    newChiTiet[index].search_query = '';
                } else {
                    newChiTiet[index].search_query = newChiTiet[index].ten_sach;
                }
                setChiTiet(newChiTiet);
            }
        }, 200);
    };

    const calculateGrandTotal = () => {
        return chiTiet.reduce((sum, item) => sum + (item.so_luong * item.don_gia_xuat), 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const hasStockError = () => {
        return chiTiet.some(item => item.sach_id && item.so_luong > item.ton_kho);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        for (let i = 0; i < chiTiet.length; i++) {
            const item = chiTiet[i];
            if (!item.sach_id) {
                toast.error(`Vui lòng chọn sách cho dòng thứ ${i + 1}`);
                return;
            }
            if (item.so_luong <= 0) {
                toast.error(`Số lượng ở dòng thứ ${i + 1} phải lớn hơn 0`);
                return;
            }
            if (item.so_luong > item.ton_kho) {
                toast.error(`Dòng thứ ${i + 1} vượt quá hàng tồn kho (Tồn: ${item.ton_kho}, Cần xuất: ${item.so_luong})`);
                return;
            }
        }

        try {
            setSubmitting(true);
            const payload = {
                ngay_xuat: ngayXuat,
                ghi_chu: ghiChu,
                chi_tiet: chiTiet.map(item => ({
                    sach_id: item.sach_id,
                    so_luong: item.so_luong,
                    don_gia_xuat: item.don_gia_xuat
                }))
            };

            await AdminAPI.createPhieuXuat(payload);
            toast.success("Tạo phiếu xuất kho thành công!");
            
            setNgayXuat(new Date().toISOString().split('T')[0]);
            setGhiChu('');
            setChiTiet([{ sach_id: '', ten_sach: '', search_query: '', so_luong: 1, don_gia_xuat: 0, ton_kho: 0, open_dropdown: false }]);
            
            fetchHistory();
            setActiveTab('history');
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
        <div className="inventory-container animate-in">
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 className="inventory-header-title">Quản Lý Xuất Kho</h2>
                    <p className="inventory-header-subtitle">
                        Lập phiếu xuất sách bàn giao và xem lịch sử các mặt hàng đã xuất.
                    </p>
                </div>
                <div className="inventory-tabs-container">
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`inventory-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    >
                        <History size={16} /> Lịch sử xuất
                    </button>
                    <button 
                        onClick={() => setActiveTab('create')}
                        className={`inventory-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                    >
                        <Plus size={16} /> Tạo phiếu xuất
                    </button>
                </div>
            </div>

            {/* Content view */}
            {activeTab === 'history' ? (
                <div className="inventory-card">
                    <div className="inventory-card-title-bar">
                        <span className="inventory-card-title-text">DANH SÁCH LỊCH SỬ XUẤT KHO</span>
                        <span style={{ fontSize: '12px', color: 'var(--inv-text-muted)', fontWeight: 500 }}>
                            Tổng số: {history.length} phiếu
                        </span>
                    </div>

                    <div className="inventory-table-container">
                        {loadingHistory ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: '12px' }}>
                                <Loader2 size={32} className="ds-spin" color="var(--inv-primary)" />
                                <span style={{ color: 'var(--inv-text-muted)', fontSize: '13px' }}>Đang tải lịch sử xuất kho...</span>
                            </div>
                        ) : history.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: '8px' }}>
                                <FileText size={44} color="var(--inv-text-light)" style={{ opacity: 0.6 }} />
                                <span style={{ color: 'var(--inv-text-dark)', fontSize: '14px', fontWeight: 600 }}>Chưa có phiếu xuất kho nào</span>
                                <button 
                                    onClick={() => setActiveTab('create')} 
                                    className="inventory-btn inventory-btn-primary" 
                                    style={{ marginTop: '12px', minHeight: '38px', fontSize: '13px' }}
                                >
                                    Tạo phiếu đầu tiên
                                </button>
                            </div>
                        ) : (
                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '100px', paddingLeft: '24px' }}>Mã Phiếu</th>
                                        <th style={{ width: '160px' }}>Ngày Xuất</th>
                                        <th style={{ width: '140px' }}>Số Mặt Hàng</th>
                                        <th style={{ width: '180px' }}>Tổng Giá Trị</th>
                                        <th>Ghi Chú</th>
                                        <th className="text-center" style={{ width: '120px', paddingRight: '24px' }}>Chi Tiết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((phieu) => {
                                        const totalItems = phieu.chi_tiet?.length || 0;
                                        return (
                                            <tr key={phieu.phieu_xuat_id}>
                                                <td style={{ paddingLeft: '24px', fontWeight: 700, color: 'var(--inv-primary)' }}>
                                                    #{phieu.phieu_xuat_id}
                                                </td>
                                                <td style={{ fontWeight: 500 }}>
                                                    {new Date(phieu.ngay_xuat).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td style={{ color: 'var(--inv-text-muted)' }}>
                                                    <span className="inventory-badge inventory-badge-blue">
                                                        <Truck size={13} /> {totalItems} sản phẩm
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 700, color: 'var(--inv-primary)' }}>
                                                    {formatCurrency(phieu.tong_tien)}
                                                </td>
                                                <td style={{ color: 'var(--inv-text-muted)', fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {phieu.ghi_chu || <em style={{ color: 'var(--inv-text-light)' }}>Không có ghi chú</em>}
                                                </td>
                                                <td className="text-center" style={{ paddingRight: '24px' }}>
                                                    <button 
                                                        onClick={() => handleViewDetail(phieu)}
                                                        className="inventory-btn inventory-btn-secondary"
                                                        title="Xem chi tiết"
                                                        style={{ minHeight: '36px', height: '36px', width: '36px', padding: 0, borderRadius: '50%' }}
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ) : (
                /* CREATE FORM VIEW */
                <form onSubmit={handleSubmit} className="inventory-card animate-in">
                    <div className="inventory-card-title-bar">
                        <span className="inventory-card-title-text">Lập Phiếu Xuất Kho Mới</span>
                    </div>

                    <div className="inventory-form-row">
                        <div className="inventory-input-group">
                            <label className="inventory-label">
                                <Calendar size={15} color="var(--inv-primary)" /> Ngày Xuất Kho
                            </label>
                            <input 
                                type="date" 
                                className="inventory-input" 
                                value={ngayXuat}
                                onChange={(e) => setNgayXuat(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="inventory-input-group">
                            <label className="inventory-label">
                                <FileText size={15} color="var(--inv-primary)" /> Ghi Chú / Lý Do Xuất
                            </label>
                            <input 
                                type="text" 
                                className="inventory-input" 
                                placeholder="Ví dụ: Xuất bàn giao đại lý quận 1, Xuất tặng phẩm..."
                                value={ghiChu}
                                onChange={(e) => setGhiChu(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="inventory-items-section">
                        <h4 className="inventory-section-title">
                            <Truck size={16} color="var(--inv-primary)" /> Danh Sách Sách Xuất Kho
                        </h4>

                        {/* Detail rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {chiTiet.map((row, index) => {
                                const filteredBooks = books.filter(b => 
                                    b.tenSach.toLowerCase().includes(row.search_query.toLowerCase()) ||
                                    b.tacGia.toLowerCase().includes(row.search_query.toLowerCase())
                                ).slice(0, 5); 

                                const isOverStock = row.sach_id && row.so_luong > row.ton_kho;

                                return (
                                    <div key={index} className={`inventory-item-card ${isOverStock ? 'has-error' : ''}`}>
                                        {/* Book Select Search Column */}
                                        <div className="inventory-combobox">
                                            <label className="inventory-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--inv-text-muted)', marginBottom: '4px' }}>
                                                Tên Sách / Tác Giả
                                            </label>
                                            <div className="inventory-input-icon-wrapper">
                                                <input 
                                                    type="text" 
                                                    className="inventory-input" 
                                                    placeholder="Gõ tên sách để tìm..." 
                                                    value={row.search_query}
                                                    onChange={(e) => handleSearchChange(index, e.target.value)}
                                                    onFocus={() => {
                                                        const newChiTiet = [...chiTiet];
                                                        newChiTiet[index].open_dropdown = true;
                                                        setChiTiet(newChiTiet);
                                                    }}
                                                    onBlur={() => closeDropdownWithDelay(index)}
                                                />
                                                <Search size={16} className="inventory-input-icon" />
                                            </div>

                                            {/* Dropdown overlay */}
                                            {row.open_dropdown && (
                                                <div className="inventory-combobox-dropdown">
                                                    {loadingBooks ? (
                                                        <div style={{ padding: '12px', textAlign: 'center', color: 'var(--inv-text-muted)', fontSize: '13px' }}>Đang tải danh sách sách...</div>
                                                    ) : filteredBooks.length === 0 ? (
                                                        <div style={{ padding: '12px', textAlign: 'center', color: 'var(--inv-text-muted)', fontSize: '13px' }}>Không tìm thấy sách nào khớp</div>
                                                    ) : (
                                                        filteredBooks.map(book => (
                                                            <div 
                                                                key={book.id}
                                                                onMouseDown={() => handleSelectBook(index, book)}
                                                                className="inventory-combobox-item"
                                                            >
                                                                {book.anhBia ? (
                                                                    <img src={book.anhBia} alt={book.tenSach} className="inventory-book-thumb" />
                                                                ) : (
                                                                    <div className="inventory-book-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                                                                )}
                                                                <div className="inventory-book-info">
                                                                    <div className="inventory-book-title">{book.tenSach}</div>
                                                                    <div className="inventory-book-author">TG: {book.tacGia}</div>
                                                                    <div className={`inventory-book-stock ${book.soLuong === 0 ? 'out' : ''}`}>
                                                                        Còn lại tồn: {book.soLuong} cuốn
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Quantity Column */}
                                        <div className="inventory-input-group">
                                            <label className="inventory-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--inv-text-muted)', marginBottom: '4px' }}>
                                                Số Lượng
                                            </label>
                                            <input 
                                                type="number" 
                                                className="inventory-input" 
                                                min="1"
                                                value={row.so_luong} 
                                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            />
                                            {row.sach_id && (
                                                <div className={`inventory-row-stock-info ${isOverStock ? 'error' : ''}`}>
                                                    Tồn kho: {row.ton_kho} cuốn
                                                </div>
                                            )}
                                        </div>

                                        {/* Unit Price Column */}
                                        <div className="inventory-input-group">
                                            <label className="inventory-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--inv-text-muted)', marginBottom: '4px' }}>
                                                Giá Xuất (đ)
                                            </label>
                                            <input 
                                                type="number" 
                                                className="inventory-input" 
                                                min="0"
                                                step="1000"
                                                value={row.don_gia_xuat} 
                                                onChange={(e) => handlePriceChange(index, e.target.value)}
                                            />
                                        </div>

                                        {/* Total Column */}
                                        <div className="inventory-input-group">
                                            <label className="inventory-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--inv-text-muted)', marginBottom: '4px' }}>
                                                Thành Tiền
                                            </label>
                                            <div className="inventory-row-total-value">
                                                {formatCurrency(row.so_luong * row.don_gia_xuat)}
                                            </div>
                                        </div>

                                        {/* Delete Action Column */}
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveRow(index)} 
                                                className="inventory-btn inventory-btn-danger"
                                                title="Xóa dòng này"
                                                style={{ marginTop: '18px' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Error Banner */}
                        {hasStockError() && (
                            <div className="inventory-error-banner">
                                <AlertTriangle size={18} />
                                <span>Phát hiện mặt hàng có số lượng xuất lớn hơn lượng tồn kho thực tế! Vui lòng điều chỉnh lại.</span>
                            </div>
                        )}

                        {/* Summary Footer */}
                        <div className="inventory-summary-footer">
                            <button 
                                type="button" 
                                onClick={handleAddRow} 
                                className="inventory-btn inventory-btn-secondary" 
                            >
                                <Plus size={16} /> Thêm sách cần xuất
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <span className="inventory-grand-total-label">TỔNG GIÁ TRỊ PHIẾU:</span>
                                    <h3 className="inventory-grand-total-val">
                                        {formatCurrency(calculateGrandTotal())}
                                    </h3>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={submitting || hasStockError()}
                                    className="inventory-btn inventory-btn-primary" 
                                    style={{ padding: '0 28px' }}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={16} className="ds-spin" /> Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} /> Lưu Phiếu Xuất
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* DETAIL MODAL */}
            {showDetailModal && selectedPhieu && (
                <div className="inventory-modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="inventory-modal-card animate-in" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="inventory-modal-header">
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--inv-text-dark)' }}>
                                Chi Tiết Phiếu Xuất Kho #{selectedPhieu.phieu_xuat_id}
                            </h3>
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--inv-text-light)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="inventory-modal-body">
                            <div className="inventory-modal-info-box" style={{ background: '#eff6ff', borderColor: '#dbeafe' }}>
                                <div className="inventory-modal-info-item">
                                    <span className="inventory-modal-info-label">Ngày Xuất Kho</span>
                                    <span className="inventory-modal-info-value">
                                        {new Date(selectedPhieu.ngay_xuat).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <div className="inventory-modal-info-item">
                                    <span className="inventory-modal-info-label">Tổng Giá Trị Lô Xuất</span>
                                    <span className="inventory-modal-info-value" style={{ color: 'var(--inv-primary)' }}>
                                        {formatCurrency(selectedPhieu.tong_tien)}
                                    </span>
                                </div>
                                <div className="inventory-modal-info-item" style={{ gridColumn: 'span 2' }}>
                                    <span className="inventory-modal-info-label">Ghi Chú / Lý do xuất</span>
                                    <span className="inventory-modal-info-value" style={{ fontWeight: 'normal', color: 'var(--inv-text-dark)' }}>
                                        {selectedPhieu.ghi_chu || <em>Không có ghi chú nào</em>}
                                    </span>
                                </div>
                            </div>

                            <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--inv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                                Danh sách sản phẩm thực tế ({selectedPhieu.chi_tiet?.length || 0})
                            </h4>

                            <div className="inventory-modal-items-list">
                                {selectedPhieu.chi_tiet?.map((item, index) => {
                                    const sach = item.sach || {};
                                    return (
                                        <div key={item.chi_tiet_phieu_xuat_id || index} className="inventory-modal-item-row">
                                            {sach.anh_bia ? (
                                                <img src={sach.anh_bia} alt={sach.ten_sach} style={{ width: '36px', height: '50px', objectFit: 'cover', borderRadius: '4px', background: '#e2e8f0' }} />
                                            ) : (
                                                <div style={{ width: '36px', height: '50px', background: '#e2e8f0', borderRadius: '4px' }} />
                                            )}
                                            <div className="inventory-modal-item-info">
                                                <div className="inventory-modal-item-title">
                                                    {sach.ten_sach || `Sách (Mã: ${item.sach_id})`}
                                                </div>
                                                <div className="inventory-modal-item-author">
                                                    Tác giả: {sach.tac_gia || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="inventory-modal-item-qty-price">
                                                <div className="inventory-modal-item-math">
                                                    {item.so_luong} cuốn × {formatCurrency(item.don_gia_xuat)}
                                                </div>
                                                <div className="inventory-modal-item-total">
                                                    {formatCurrency(item.so_luong * item.don_gia_xuat)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="inventory-modal-footer">
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="inventory-btn inventory-btn-secondary"
                                style={{ minHeight: '38px' }}
                            >
                                Đóng lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryExportPage;