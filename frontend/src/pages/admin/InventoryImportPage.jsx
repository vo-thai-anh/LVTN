import React, { useState, useEffect } from 'react';
import { AdminAPI } from '../../services/adminService';
import { 
  Plus, Trash2, Save, Calendar, FileText, 
  Search, Eye, X, Loader2, History, ChevronRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

const InventoryImportPage = () => {
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

    // Form state for creating Phieu Nhap
    const [ngayNhap, setNgayNhap] = useState(new Date().toISOString().split('T')[0]);
    const [ghiChu, setGhiChu] = useState('');
    const [chiTiet, setChiTiet] = useState([
        { sach_id: '', ten_sach: '', search_query: '', so_luong: 1, don_gia_nhap: 0, open_dropdown: false }
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
            const res = await AdminAPI.getPhieuNhap();
            // Paginated response format
            if (res && res.data) {
                setHistory(res.data.data || []);
            } else {
                setHistory(Array.isArray(res) ? res : []);
            }
        } catch (error) {
            console.error('Lỗi fetch history:', error);
            toast.error('Không thể tải lịch sử nhập kho');
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

    const closeDropdownWithDelay = (index) => {
        setTimeout(() => {
            const newChiTiet = [...chiTiet];
            if (newChiTiet[index]) {
                newChiTiet[index].open_dropdown = false;
                // If user blurred without selecting, revert search query to current book name
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
        return chiTiet.reduce((sum, item) => sum + (item.so_luong * item.don_gia_nhap), 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate
        for (let i = 0; i < chiTiet.length; i++) {
            if (!chiTiet[i].sach_id) {
                toast.error(`Vui lòng chọn sách cho dòng thứ ${i + 1}`);
                return;
            }
            if (chiTiet[i].so_luong <= 0) {
                toast.error(`Số lượng ở dòng thứ ${i + 1} phải lớn hơn 0`);
                return;
            }
        }

        try {
            setSubmitting(true);
            const payload = {
                ngay_nhap: ngayNhap,
                ghi_chu: ghiChu,
                chi_tiet: chiTiet.map(item => ({
                    sach_id: item.sach_id,
                    so_luong: item.so_luong,
                    don_gia_nhap: item.don_gia_nhap
                }))
            };

            await AdminAPI.createPhieuNhap(payload);
            toast.success("Tạo phiếu nhập kho thành công!");
            
            // Reset form
            setNgayNhap(new Date().toISOString().split('T')[0]);
            setGhiChu('');
            setChiTiet([{ sach_id: '', ten_sach: '', search_query: '', so_luong: 1, don_gia_nhap: 0, open_dropdown: false }]);
            
            // Reload history and switch tab
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
        <div className="admin-wrapper-inner" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: 'var(--admin-text-head)' }}>
                        Quản Lý Nhập Kho
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--admin-text-muted)' }}>
                        Nhập sách mới vào kho và xem lịch sử các lô hàng đã nhập.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', background: 'var(--admin-bg-ash)', padding: '4px', borderRadius: '8px' }}>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className="btn"
                        style={{ 
                            minHeight: '34px',
                            padding: '6px 16px',
                            background: activeTab === 'history' ? 'var(--admin-bg-pure)' : 'transparent',
                            color: activeTab === 'history' ? 'var(--admin-text-head)' : 'var(--admin-text-muted)',
                            boxShadow: activeTab === 'history' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500
                        }}
                    >
                        <History size={15} style={{ marginRight: '6px' }} /> Lịch sử nhập
                    </button>
                    <button 
                        onClick={() => setActiveTab('create')}
                        className="btn"
                        style={{ 
                            minHeight: '34px',
                            padding: '6px 16px',
                            background: activeTab === 'create' ? 'var(--admin-bg-pure)' : 'transparent',
                            color: activeTab === 'create' ? 'var(--admin-text-head)' : 'var(--admin-text-muted)',
                            boxShadow: activeTab === 'create' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500
                        }}
                    >
                        <Plus size={15} style={{ marginRight: '6px' }} /> Tạo phiếu nhập
                    </button>
                </div>
            </div>

            {/* Content view */}
            {activeTab === 'history' ? (
                <div className="ds-card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <div className="ds-card-title" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--admin-text-head)' }}>DANH SÁCH PHIẾU NHẬP KHO</span>
                    </div>

                    <div className="admin-table-container">
                        {loadingHistory ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: '12px' }}>
                                <Loader2 size={32} className="ds-spin" color="var(--admin-primary)" />
                                <span style={{ color: 'var(--admin-text-light)', fontSize: '13px' }}>Đang tải lịch sử nhập kho...</span>
                            </div>
                        ) : history.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: '8px' }}>
                                <FileText size={40} color="var(--admin-text-light)" style={{ opacity: 0.5 }} />
                                <span style={{ color: 'var(--admin-text-muted)', fontSize: '14px', fontWeight: 500 }}>Chưa có phiếu nhập kho nào</span>
                                <button 
                                    onClick={() => setActiveTab('create')} 
                                    className="btn btn-primary" 
                                    style={{ marginTop: '8px', minHeight: '36px', fontSize: '13px', padding: '6px 16px' }}
                                >
                                    Tạo phiếu đầu tiên
                                </button>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px', paddingLeft: '24px' }}>Mã Phiếu</th>
                                        <th style={{ width: '150px' }}>Ngày Nhập</th>
                                        <th style={{ width: '130px' }}>Số Mặt Hàng</th>
                                        <th>Tổng Giá Trị</th>
                                        <th>Ghi Chú</th>
                                        <th className="text-center" style={{ width: '120px', paddingRight: '24px' }}>Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((phieu) => {
                                        const totalItems = phieu.chi_tiet?.length || 0;
                                        return (
                                            <tr key={phieu.phieu_nhap_id}>
                                                <td style={{ paddingLeft: '24px', fontWeight: 600, color: 'var(--admin-text-head)' }}>
                                                    #{phieu.phieu_nhap_id}
                                                </td>
                                                <td>{new Date(phieu.ngay_nhap).toLocaleDateString('vi-VN')}</td>
                                                <td>{totalItems} mặt hàng</td>
                                                <td style={{ fontWeight: 600, color: 'var(--ds-green)' }}>
                                                    {formatCurrency(phieu.tong_tien)}
                                                </td>
                                                <td style={{ color: 'var(--admin-text-muted)', fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {phieu.ghi_chu || <em style={{ color: 'var(--admin-text-light)' }}>Không có</em>}
                                                </td>
                                                <td className="text-center" style={{ paddingRight: '24px' }}>
                                                    <button 
                                                        onClick={() => handleViewDetail(phieu)}
                                                        className="btn btn-secondary"
                                                        title="Xem chi tiết"
                                                        style={{ minHeight: '32px', width: '32px', height: '32px', padding: 0, borderRadius: '50%' }}
                                                    >
                                                        <Eye size={14} />
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
                <form onSubmit={handleSubmit} className="ds-card animate-in" style={{ borderRadius: '12px', padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '24px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={14} color="var(--admin-text-muted)" /> Ngày nhập kho
                            </label>
                            <input 
                                type="date" 
                                className="form-control" 
                                value={ngayNhap}
                                onChange={(e) => setNgayNhap(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FileText size={14} color="var(--admin-text-muted)" /> Ghi chú phiếu nhập
                            </label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Nhập ghi chú (nhà cung cấp, người giao hàng, lý do...)"
                                value={ghiChu}
                                onChange={(e) => setGhiChu(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--admin-divider)', paddingTop: '20px', marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, color: 'var(--admin-text-head)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Danh sách sách nhập kho
                        </h4>

                        {/* Detail rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {chiTiet.map((row, index) => {
                                // Filter books based on row search query
                                const filteredBooks = books.filter(b => 
                                    b.tenSach.toLowerCase().includes(row.search_query.toLowerCase()) ||
                                    b.tacGia.toLowerCase().includes(row.search_query.toLowerCase())
                                ).slice(0, 5); // Limit dropdown display to 5 matching books for speed

                                return (
                                    <div 
                                        key={index} 
                                        style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr auto', 
                                            gap: '12px', 
                                            alignItems: 'start',
                                            padding: '12px',
                                            background: 'var(--admin-bg-ash)',
                                            borderRadius: '8px',
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Book Select Search Column */}
                                        <div style={{ position: 'relative' }}>
                                            <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', color: 'var(--admin-text-light)' }}>Tên sách / Tác giả</label>
                                            <div style={{ position: 'relative' }}>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    style={{ background: '#fff', paddingRight: '30px' }}
                                                    placeholder="Gõ để tìm kiếm sách..." 
                                                    value={row.search_query}
                                                    onChange={(e) => handleSearchChange(index, e.target.value)}
                                                    onFocus={() => {
                                                        const newChiTiet = [...chiTiet];
                                                        newChiTiet[index].open_dropdown = true;
                                                        setChiTiet(newChiTiet);
                                                    }}
                                                    onBlur={() => closeDropdownWithDelay(index)}
                                                />
                                                <Search size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} />
                                            </div>

                                            {/* Dropdown overlay */}
                                            {row.open_dropdown && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    background: '#fff',
                                                    border: '1px solid #d0d1d2',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                    zIndex: 1000,
                                                    marginTop: '4px',
                                                    maxHeight: '220px',
                                                    overflowY: 'auto'
                                                }}>
                                                    {loadingBooks ? (
                                                        <div style={{ padding: '12px', textAlign: 'center', color: 'var(--admin-text-light)', fontSize: '13px' }}>Đang tải danh sách sách...</div>
                                                    ) : filteredBooks.length === 0 ? (
                                                        <div style={{ padding: '12px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '13px' }}>Không tìm thấy sách nào khớp</div>
                                                    ) : (
                                                        filteredBooks.map(book => (
                                                            <div 
                                                                key={book.id}
                                                                onMouseDown={() => handleSelectBook(index, book)}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '10px',
                                                                    padding: '8px 12px',
                                                                    cursor: 'pointer',
                                                                    borderBottom: '1px solid var(--admin-divider)',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-bg-ash)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                {book.anhBia ? (
                                                                    <img src={book.anhBia} alt={book.tenSach} style={{ width: '28px', height: '40px', objectFit: 'cover', borderRadius: '2px' }} />
                                                                ) : (
                                                                    <div style={{ width: '28px', height: '40px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }} />
                                                                )}
                                                                <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-head)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.tenSach}</div>
                                                                    <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>TG: {book.tacGia} | Tồn: <strong style={{ color: 'var(--admin-primary)' }}>{book.soLuong}</strong></div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Quantity Column */}
                                        <div>
                                            <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', color: 'var(--admin-text-light)' }}>Số lượng</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                style={{ background: '#fff' }}
                                                min="1"
                                                value={row.so_luong} 
                                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            />
                                        </div>

                                        {/* Unit Price Column */}
                                        <div>
                                            <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', color: 'var(--admin-text-light)' }}>Đơn giá nhập (đ)</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                style={{ background: '#fff' }}
                                                min="0"
                                                step="500"
                                                value={row.don_gia_nhap} 
                                                onChange={(e) => handlePriceChange(index, e.target.value)}
                                            />
                                        </div>

                                        {/* Total Column */}
                                        <div>
                                            <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', color: 'var(--admin-text-light)' }}>Thành tiền</label>
                                            <div 
                                                className="form-control" 
                                                style={{ 
                                                    background: 'transparent', 
                                                    border: 'none', 
                                                    paddingLeft: 0, 
                                                    fontWeight: 600, 
                                                    color: 'var(--admin-text-head)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    height: '38px' 
                                                }}
                                            >
                                                {formatCurrency(row.so_luong * row.don_gia_nhap)}
                                            </div>
                                        </div>

                                        {/* Delete Action Column */}
                                        <div style={{ height: '55px', display: 'flex', alignItems: 'center' }}>
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveRow(index)} 
                                                className="btn btn-danger"
                                                style={{ minHeight: '38px', height: '38px', width: '38px', padding: 0, border: '1px solid #fee2e2', borderRadius: '6px' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Actions block */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                            <button 
                                type="button" 
                                onClick={handleAddRow} 
                                className="btn btn-secondary" 
                                style={{ minHeight: '38px', fontSize: '13px' }}
                            >
                                <Plus size={15} /> Thêm mặt sách
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>TỔNG CỘNG PHIẾU:</span>
                                    <h3 style={{ margin: 0, color: 'var(--admin-primary)', fontSize: '20px', fontWeight: 700 }}>
                                        {formatCurrency(calculateGrandTotal())}
                                    </h3>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="btn btn-primary" 
                                    style={{ minHeight: '42px', padding: '0 24px', fontWeight: 600 }}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={16} className="ds-spin" style={{ marginRight: '6px' }} /> Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} style={{ marginRight: '6px' }} /> Lưu phiếu nhập
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
                <div className="admin-modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div 
                        className="admin-modal-content animate-in" 
                        style={{ maxWidth: '650px', width: '100%', borderRadius: '12px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--admin-divider)' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--admin-text-head)' }}>
                                Chi Tiết Phiếu Nhập Kho #{selectedPhieu.phieu_nhap_id}
                            </h3>
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--admin-text-light)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', background: 'var(--admin-bg-ash)', padding: '16px', borderRadius: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--admin-text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Ngày Nhập Kho</div>
                                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--admin-text-head)', marginTop: '4px' }}>
                                        {new Date(selectedPhieu.ngay_nhap).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--admin-text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Tổng Tiền Thanh Toán</div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ds-green)', marginTop: '4px' }}>
                                        {formatCurrency(selectedPhieu.tong_tien)}
                                    </div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--admin-text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Ghi Chú</div>
                                    <div style={{ fontSize: '13px', color: 'var(--admin-text-body)', marginTop: '4px' }}>
                                        {selectedPhieu.ghi_chu || <em style={{ color: 'var(--admin-text-light)' }}>Không có ghi chú</em>}
                                    </div>
                                </div>
                            </div>

                            <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Danh sách sản phẩm ({selectedPhieu.chi_tiet?.length || 0})
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {selectedPhieu.chi_tiet?.map((item, index) => {
                                    const sach = item.sach || {};
                                    return (
                                        <div 
                                            key={item.chi_tiet_phieu_nhap_id || index}
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '12px', 
                                                padding: '10px 12px', 
                                                border: '1px solid var(--admin-divider)', 
                                                borderRadius: '8px' 
                                            }}
                                        >
                                            {sach.anh_bia ? (
                                                <img src={sach.anh_bia} alt={sach.ten_sach} style={{ width: '32px', height: '46px', objectFit: 'cover', borderRadius: '3px' }} />
                                            ) : (
                                                <div style={{ width: '32px', height: '46px', background: '#e2e8f0', borderRadius: '3px' }} />
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-head)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {sach.ten_sach || `Sách (ID: ${item.sach_id})`}
                                                </div>
                                                <div style={{ fontSize: '11.5px', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                                                    Tác giả: {sach.tac_gia || 'N/A'}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--admin-text-body)' }}>
                                                    {item.so_luong} cuốn  ×  {formatCurrency(item.don_gia_nhap)}
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-head)', marginTop: '2px' }}>
                                                    {formatCurrency(item.so_luong * item.don_gia_nhap)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--admin-divider)' }}>
                            <button 
                                onClick={() => setShowDetailModal(false)}
                                className="btn btn-secondary"
                                style={{ minHeight: '36px', fontSize: '13px' }}
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

export default InventoryImportPage;