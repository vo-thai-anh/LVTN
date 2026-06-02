import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit2, Trash2, X, Image as ImageIcon, 
  BookOpen, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminAPI } from '../../services/adminService';
import toast from 'react-hot-toast';

import AdminPagination from '../../components/admin/AdminPagination';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  
  // State quản lý File ảnh và Link xem trước ảnh (Preview)
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [formData, setFormData] = useState({
    ten_sach: '',
    tac_gia: '',
    nha_xuat_ban: '',
    gia: '',
    so_luong_ton: '',
    loai_sach: '',
    mo_ta: '',
    trang_thai: 1,
    trong_luong: '',
    kich_thuoc: '',
    so_trang: '',
    anh_bia: '', // Giữ lại để lưu URL cũ khi sửa sách
    nha_cung_cap: ''
  });

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchData();
      else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, catsRes] = await Promise.all([
        AdminAPI.getBooks({ search: searchTerm, page: page, size: 8 }),
        AdminAPI.getCategories()
      ]);
      
      console.log("Dữ liệu gốc nhận về từ Service API:", booksRes);
      
      // 📝 CẬP NHẬT LẠI ĐOẠN ĐỌC DỮ LIỆU TẠI ĐÂY:
      if (booksRes && booksRes.content) {
        // Trích xuất chính xác mảng danh sách từ thuộc tính 'content'
        setBooks(booksRes.content); 
        setTotalPages(booksRes.totalPages || 1);
      } else if (booksRes && booksRes.data) {
        // Phương án dự phòng nếu Backend trả về dạng bọc gốc .data.data
        setBooks(Array.isArray(booksRes.data.data) ? booksRes.data.data : booksRes.data);
        setTotalPages(booksRes.last_page || 1);
      } else if (Array.isArray(booksRes)) {
        setBooks(booksRes);
        setTotalPages(1);
      } else {
        setBooks([]); // Đảm bảo luôn trả về mảng rỗng nếu không khớp cấu trúc nào
      }

      // Logic xử lý danh mục thể loại (giữ nguyên hoặc bọc an toàn tương tự)
      if (catsRes && catsRes.data) {
        setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
      } else {
        setCategories(Array.isArray(catsRes) ? catsRes : []);
      }

    } catch (err) {
      console.error("Lỗi fetch:", err);
      toast.error('Lỗi kết nối dữ liệu từ Server');
    } finally {
      setLoading(false);
    }
  };


  const handleOpenModal = (book = null) => {
    setSelectedFile(null);
    setPreviewUrl('');

    if (book) {
      setEditingBook(book);
      setFormData({
        ten_sach: book.ten_sach || '',
        tac_gia: book.tac_gia || '',
        nha_xuat_ban: book.nha_xuat_ban || '',
        gia: book.gia?.toString() || '',
        so_luong_ton: book.so_luong_ton?.toString() || '',
        // ✅ SỬA LỖI: Tự động bắt đúng thuộc tính ID của danh mục thuộc sách
        loai_sach: book.loai_sach_id || book.loai_sach?.loai_sach_id || book.loai_sach?.id || '',
        mo_ta: book.mo_ta || '',
        trang_thai: book.trang_thai ?? 1,
        trong_luong: book.trong_luong?.toString() || '',
        kich_thuoc: book.kich_thuoc || '',
        so_trang: book.so_trang?.toString() || '',
        anh_bia: book.anh_bia || '',
        nha_cung_cap: book.nha_cung_cap || ''
      });
      if (book.anh_bia) setPreviewUrl(book.anh_bia);
    } else {
      setEditingBook(null);
      // ✅ SỬA LỖI: Lấy ID của danh mục đầu tiên một cách linh hoạt, tránh bị trống Form
      const defaultCategoryId = categories?.[0]?.loai_sach_id || categories?.[0]?.id || '';
      
      setFormData({
        ten_sach: '', tac_gia: '', nha_xuat_ban: '', gia: '', so_luong_ton: '',
        loai_sach: defaultCategoryId, // Gán ID mặc định chuẩn
        mo_ta: '', trang_thai: 1,
        trong_luong: '', kich_thuoc: '', so_trang: '', anh_bia: '', nha_cung_cap: ''
      });
    }
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chỉ chọn tệp tin hình ảnh!');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    const categoryId = parseInt(formData.loai_sach);
    if (isNaN(categoryId)) {
      toast.error('Vui lòng chọn danh mục hợp lệ');
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading(editingBook ? 'Đang cập nhật sản phẩm...' : 'Đang tải ảnh lên Cloudinary và lưu sách...');
    
    try {
      const formPayload = new FormData();
      formPayload.append('ten_sach', formData.ten_sach);
      formPayload.append('tac_gia', formData.tac_gia);
      formPayload.append('nha_xuat_ban', formData.nha_xuat_ban || '');
      formPayload.append('gia', parseFloat(formData.gia) || 0);
      formPayload.append('so_luong_ton', parseInt(formData.so_luong_ton) || 0);
      formPayload.append('loai_sach', categoryId);
      formPayload.append('mo_ta', formData.mo_ta || '');
      formPayload.append('trang_thai', parseInt(formData.trang_thai));
      formPayload.append('trong_luong', parseInt(formData.trong_luong) || 0);
      formPayload.append('so_trang', parseInt(formData.so_trang) || 0);
      formPayload.append('kich_thuoc', formData.kich_thuoc || '');
      formPayload.append('nha_cung_cap', formData.nha_cung_cap || '');
console.log("Dữ liệu thực tế trong FormData:", Object.fromEntries(formPayload));
      if (selectedFile) {
        formPayload.append('anh_bia_file', selectedFile);
      } else if (editingBook && formData.anh_bia) {
        formPayload.append('anh_bia', formData.anh_bia);
      }
      if (editingBook) {
        await AdminAPI.updateBook(editingBook.sach_id, formPayload);
      } else {
        await AdminAPI.addBook(formPayload);
      }

      toast.success(editingBook ? 'Cập nhật thành công!' : 'Thêm sản phẩm mới thành công!', { id: loadingToast });
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(`Lỗi: ${err.message || 'Không thể lưu dữ liệu'}`, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await AdminAPI.deleteBook(id);
      toast.success('Đã xóa sản phẩm');
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi xóa sản phẩm');
    }
  };

  return (
    <div className="book-management animate-in">
      <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '32px', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: 'auto' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 500 }}>Quản lý Sản phẩm</h3>
        </div>
        <div style={{ position: 'relative', width: '240px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} size={14} />
          <input
            type="text"
            placeholder="Tìm kiếm sách, tác giả..."
            className="form-control"
            style={{ paddingLeft: '36px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus size={16} /> Thêm mới
        </button>
      </header>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thông tin Sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá niêm yết</th>
              <th className="text-center">Kho</th>
              <th className="text-center">Trạng thái</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <tr key={`book-skeleton-${i}`}>
                  <td colSpan="6" style={{ padding: '24px' }}>
                    <div className="skeleton" style={{ height: '40px', borderRadius: '2px' }} />
                  </td>
                </tr>
              ))
            ) : (!books || !Array.isArray(books) || books.length === 0) ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state" style={{ padding: '40px 0', textAlgin: 'center', width: '100%' }}>
                    <p style={{ fontWeight: 500, color: 'var(--admin-text-muted)' }}>
                      {!books ? "Biến books đang bị null/undefined!" : !Array.isArray(books) ? "Biến books không phải là một mảng!" : "Chưa có dữ liệu sản phẩm nào trong Database."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              books.map((book, idx) => {
                const rowKey = book?.sach_id ? `book-row-${book.sach_id}` : `book-idx-${idx}`;
                
                // Log thử 1 dòng đầu tiên ra tab Console để bạn kiểm tra tên các trường chính xác từ DB
                if (idx === 0) console.log("Cấu trúc 1 cuốn sách nhận từ Backend:", book);

                return (
                  <tr key={rowKey}>
                    {/* Cột 1: Thông tin Sản phẩm */}
                    <td>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '56px', background: '#f0f0f0', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
                          {book?.anhBia ? (
                            <img src={book.anhBia} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '10px' }}>No Img</div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '14px', color: '#333' }}>
                            {book?.tenSach || <span style={{ color: 'red' }}>Sai trường tenSach?</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {book?.tacGia || "Không rõ tác giả"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '12px', padding: '4px 10px', background: '#f5f5f5', borderRadius: '2px', fontWeight: 500 }}>
                        {book?.loaiSach?.tenLoai ||
                        book?.theLoai?.tenLoai ||
                        book?.category?.name ||
                        <span style={{ color: 'orange' }}>Chưa map đúng danh mục</span>}
                      </span>
                    </td>

                    {/* Cột 3: Giá niêm yết */}
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {book?.gia ? `${Number(book.gia).toLocaleString()}đ` : '0đ'}
                      </div>
                    </td>

                    {/* Cột 4: Kho */}
                    <td className="text-center">
                      <span>{book?.soLuong ?? book?.so_luong ?? 0}</span>
                    </td>

                    {/* Cột 5: Trạng thái */}
                    <td className="text-center">
                      <span style={{
                        fontSize: '11px', fontWeight: 500, padding: '4px 12px', borderRadius: '12px',
                        background: Number(book?.trang_thai) === 1 ? '#e6fffa' : '#fff5f5',
                        color: Number(book?.trang_thai) === 1 ? '#047481' : '#c53030'
                      }}>
                        {Number(book?.trang_thai) === 1 ? 'Ổn định' : 'Ngưng bán'}
                      </span>
                    </td>

                    {/* Cột 6: Hành động */}
                    <td className="text-center">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => handleOpenModal(book)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '12px' }}>Sửa</button>
                        <button onClick={() => handleDelete(book?.sach_id)} className="btn btn-danger" style={{ padding: '2px 8px', fontSize: '12px' }}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <AnimatePresence>
        {showModal && (
          <div className="admin-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="admin-modal-content"
              style={{ maxWidth: '800px' }}
            >
              <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--admin-divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontWeight: 500, fontSize: '18px' }}>{editingBook ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}</h3>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ minWidth: '32px', minHeight: '32px', padding: 0, borderRadius: '50%' }}><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '32px', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  
                  {/* Khu vực Upload Ảnh Bìa Trực Quan */}
                  <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px', border: '1px dashed var(--admin-divider)', borderRadius: '4px', background: 'var(--admin-bg-ash)' }}>
                    <label className="form-label" style={{ fontWeight: 500, width: '100%', textAlign: 'left' }}>Hình ảnh bìa sách</label>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                    />
                    
                    <div 
                      onClick={() => fileInputRef.current.click()}
                      style={{ width: '120px', height: '160px', border: '1px solid var(--admin-divider)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: '#fff', position: 'relative' }}
                    >
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--admin-text-light)', padding: '10px' }}>
                          <Upload size={24} style={{ margin: '0 auto 8px' }} />
                          <span style={{ fontSize: '12px' }}>Chọn ảnh</span>
                        </div>
                      )}
                    </div>
                    {previewUrl && (
                      <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(''); }} style={{ fontSize: '12px', color: '#c53030', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa ảnh lựa chọn</button>
                    )}
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Tên sách</label>
                    <input required className="form-control" value={formData.ten_sach} onChange={(e) => setFormData({...formData, ten_sach: e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Tác giả</label>
                    <input required className="form-control" value={formData.tac_gia} onChange={(e) => setFormData({...formData, tac_gia: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nhà xuất bản</label>
                    <input className="form-control" value={formData.nha_xuat_ban} onChange={(e) => setFormData({...formData, nha_xuat_ban: e.target.value})} placeholder="VD: NXB Trẻ" />
                  </div>
                  
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Danh mục Thể loại</label>
                    <select
                      className="form-control"
                      value={formData.loai_sach}
                      onChange={(e) => setFormData({...formData, loai_sach: e.target.value})}
                    >
                      {/* {categories?.length === 0 && (
                        <option value="">-- Chưa tải được danh mục / Thể loại rỗng --</option>
                      )} */}
                      
                      {categories?.map((c, idx) => {
                        const name = c.ten_loai_sach || c.tenLoai;
                        const optionKey = name ? `cat-opt-${name}` : `cat-idx-${idx}`;
                        // console.log(c);
                        return (
                          <option key={optionKey} value={name}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Giá (VNĐ)</label>
                    <input required type="number" className="form-control" value={formData.gia} onChange={(e) => setFormData({...formData, gia: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số lượng kho</label>
                    <input required type="number" className="form-control" value={formData.so_luong_ton} onChange={(e) => setFormData({...formData, so_luong_ton: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số trang</label>
                    <input type="number" min="0" className="form-control" value={formData.so_trang} onChange={(e) => setFormData({...formData, so_trang: e.target.value})} placeholder="VD: 320" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trọng lượng (gram)</label>
                    <input type="number" min="0" className="form-control" value={formData.trong_luong} onChange={(e) => setFormData({...formData, trong_luong: e.target.value})} placeholder="VD: 450" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kích thước (cm)</label>
                    <input className="form-control" value={formData.kich_thuoc} onChange={(e) => setFormData({...formData, kich_thuoc: e.target.value})} placeholder="VD: 14.5 x 20.5 cm" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trạng thái</label>
                    <select className="form-control" value={formData.trang_thai} onChange={(e) => setFormData({...formData, trang_thai: parseInt(e.target.value)})}>
                      <option value={1}>Đang bán</option>
                      <option value={0}>Ngưng bán</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Mô tả sản phẩm</label>
                    <textarea className="form-control" rows={3} value={formData.mo_ta} onChange={(e) => setFormData({...formData, mo_ta: e.target.value})} style={{ resize: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--admin-divider)' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Hủy bỏ</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Đang xử lý...' : 'Lưu dữ liệu'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookManagement;