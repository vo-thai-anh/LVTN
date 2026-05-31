import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, User, Shield, Phone, Mail, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminAPI } from '../../services/adminService';
import toast from 'react-hot-toast';

import AdminPagination from '../../components/admin/AdminPagination';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [formData, setFormData] = useState({
    tenDangNhap: '', email: '', matKhau: '', soDienThoai: '', diaChi: '', role: 'khach_hang'
  });

  useEffect(() => {
    fetchData();
  }, [page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 0) fetchData();
      else setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await AdminAPI.getUsers({ keyword: searchTerm, page: page, size: 8 });
      // Spring Boot Page response: { content: [], totalPages: X }
      if (res?.content) {
        setUsers(res.content);
        setTotalPages(res.totalPages);
      } else {
        setUsers(res || []);
        setTotalPages(1);
      }
    } catch (err) {
      toast.error('Lỗi tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ 
        tenDangNhap: user?.tenDangNhap || user?.hoTen || '', 
        email: user?.email || '', 
        matKhau: '', 
        soDienThoai: user?.soDienThoai || '', 
        diaChi: user?.diaChi || '', 
        role: user?.role || user?.quyen || 'khach_hang'
      });
    } else {
      setEditingUser(null);
      setFormData({ tenDangNhap: '', email: '', matKhau: '', soDienThoai: '', diaChi: '', role: 'khach_hang' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const loadingToast = toast.loading('Đang xử lý...');
    try {
      let payload = { ...formData };
      
      // Nếu đang sửa và không nhập mật khẩu mới -> Xóa trường matKhau khỏi payload để Backend không đổi
      if (editingUser && !formData.matKhau) {
        delete payload.matKhau;
      }

      if (editingUser) {
        await AdminAPI.updateUser(editingUser.id, payload);
        toast.success('Cập nhật thành công', { id: loadingToast });
      } else {
        await AdminAPI.addUser(payload);
        toast.success('Thêm người dùng mới thành công', { id: loadingToast });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Lỗi: ' + err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa người dùng này?')) return;
    try {
      await AdminAPI.deleteUser(id);
      toast.success('Đã xóa người dùng');
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi xóa người dùng');
    }
  };

  return (
    <div className="user-management animate-in">
       <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '32px', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: 'auto' }}>
           <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 500 }}>Quản lý Thành viên</h3>
        </div>
        <div style={{ position: 'relative', width: '240px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-light)' }} size={14} />
          <input 
            type="text" 
            placeholder="Tìm kiếm thành viên..." 
            className="form-control"
            style={{ paddingLeft: '36px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchData()}
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
              <th>Họ tên & Email</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th className="text-center">Quyền</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1,2,3].map(i => <tr key={i}><td colSpan="5" style={{ padding: '24px' }}><div className="skeleton" style={{ height: '40px', borderRadius: '2px' }} /></td></tr>)
            ) : users?.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">
                    <User className="empty-state-icon" style={{ margin: '0 auto 16px', color: 'var(--admin-text-light)' }} />
                    <p style={{ fontWeight: 500, color: 'var(--admin-text-muted)' }}>Danh sách thành viên trống.</p>
                  </div>
                </td>
              </tr>
            ) : (
              Array.isArray(users) && users.map((user) => (
                <tr key={user?.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--admin-text-head)', fontSize: '14px' }}>{user?.tenDangNhap || user?.hoTen || 'Thành viên'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>{user?.email}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px' }}>{user?.soDienThoai || '—'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: 'var(--admin-text-muted)' }}>{user?.diaChi || '—'}</td>
                  <td className="text-center">
                    <span style={{ 
                      fontSize: '11px', fontWeight: 500, padding: '4px 10px', borderRadius: '4px',
                      background: (user?.role || user?.quyen) === 'admin' || (user?.role || user?.quyen) === 'ADMIN' ? 'rgba(62, 106, 225, 0.1)' : 'var(--admin-bg-ash)',
                      color: (user?.role || user?.quyen) === 'admin' || (user?.role || user?.quyen) === 'ADMIN' ? 'var(--admin-primary)' : 'var(--admin-text-muted)'
                    }}>
                      {user?.role || user?.quyen || 'khach_hang'}
                    </span>
                  </td>
                  <td className="text-center">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleOpenModal(user)} className="btn btn-secondary" style={{ minWidth: '32px', minHeight: '32px', padding: 0 }}><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(user?.id)} className="btn btn-danger" style={{ minWidth: '32px', minHeight: '32px', padding: 0 }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
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
              style={{ maxWidth: '450px' }}
            >
              <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--admin-divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontWeight: 500, fontSize: '18px' }}>{editingUser ? 'Sửa Thành viên' : 'Thêm Thành viên'}</h3>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ minWidth: '32px', minHeight: '32px', padding: 0, borderRadius: '50%' }}><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                <div className="form-group">
                  <label className="form-label">Tên đăng nhập</label>
                  <input required className="form-control" value={formData.tenDangNhap} onChange={(e) => setFormData({...formData, tenDangNhap: e.target.value})} disabled={!!editingUser} placeholder="VD: nguyenvana" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input required type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={!!editingUser} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu {editingUser && '(để trống nếu không đổi)'}</label>
                  <input type="password" className="form-control" value={formData.matKhau} onChange={(e) => setFormData({...formData, matKhau: e.target.value})} required={!editingUser} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input className="form-control" value={formData.soDienThoai} onChange={(e) => setFormData({...formData, soDienThoai: e.target.value})} placeholder="0912..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phân quyền</label>
                    <select className="form-control" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                      <option value="khach_hang">👤 Khách hàng</option>
                      <option value="admin">🛡️ Admin</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Địa chỉ</label>
                  <input className="form-control" value={formData.diaChi} onChange={(e) => setFormData({...formData, diaChi: e.target.value})} placeholder="Số nhà, đường, quận, thành phố" />
                </div>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--admin-divider)' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Đang lưu...' : 'Lưu thông tin'}
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

export default UserManagement;
