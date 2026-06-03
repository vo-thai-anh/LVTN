import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, User, Shield, Phone, Mail, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminAPI } from '../../services/adminService';
import toast from 'react-hot-toast';

import AdminPagination from '../../components/admin/AdminPagination';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [NhanVien, setNhanVien] = useState([]);
  const [activeTab, setActiveTab] = useState('user');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [formData, setFormData] = useState({
    ten_dang_nhap: '',
    mat_khau: '',
    email: '',
    ten_nhan_vien: '',
    so_dien_thoai: '',
    chuc_vu: '',
    loai_nguoi_dung: ''
  });

  const fetchRoles = async () => {
    try {
        const res = await AdminAPI.getRoles();
        // console.log(">>> [DEBUG DỮ LIỆU QUYỀN]:", res);
        setRoles(Array.isArray(res) ? res : (res.data || []));
    } catch (err) {
        toast.error('Không tải được danh sách quyền');
    }
};
  useEffect(() => {
      fetchRoles();
  }, []);

  useEffect(() => {
    // console.log("Dữ liệu roles sau khi fetch:", roles);
}, [roles]);

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
        // Gọi cả 2 API
        const [userRes, nvRes] = await Promise.all([
            AdminAPI.getUsers({ keyword: searchTerm, page: page, size: 8 }),
            AdminAPI.getNhanViens()
        ]);
        
        setUsers(userRes.content || userRes);
        setNhanViens(nvRes);
    } catch (err) {
        toast.error('Lỗi tải dữ liệu');
    } finally {
        setLoading(false);
    }
};

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
          tenDangNhap:user.ten_dang_nhap || '',
          email: user.email || '',
          matKhau:'',
          soDienThoai: user.so_dien_thoai || '',
          diaChi: user.dia_chi || '',
          chucVu: user.chuc_vu || '',
          loai_nguoi_dung:user.role|| '' ,
      });
    } else {
      setEditingUser(null);
      setFormData({
          tenDangNhap: '',
          email: '',
          matKhau: '',
          soDienThoai: '',
          diaChi: '',
          hoTen: '',
          chucVu: '',
          loai_nguoi_dung: '' });
    }
    setShowModal(true);
  };
  console.log(">>> [DEBUG DỮ LIỆU GỬI ĐI]:", formData);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      const payload = {
              ten_dang_nhap: formData.ten_dang_nhap,
              mat_khau: formData.mat_khau,
              email: formData.email,
              ten_nhan_vien: formData.ten_nhan_vien,
              so_dien_thoai: formData.so_dien_thoai,
              chuc_vu: formData.chuc_vu,
              loai_nguoi_dung: parseInt(formData.loai_nguoi_dung)
          };
          console.log(">>> [PAYLOAD CHUẨN]:", payload);
      try {
          console.log("Payload gửi đi:", payload)
          await AdminAPI.addUser(payload);
          console.log("Kết quả từ server:", response);
          toast.success('Đã tạo thành viên thành công!');
          setShowModal(false);
          fetchData();
      }  catch (err) {
          console.log("--- BẮT ĐẦU GHI LỖI ---");
          if (err.response) {
              // Server trả về lỗi (4xx, 5xx)
              console.error("Dữ liệu lỗi từ server:", err.response.data);
              console.error("Trạng thái lỗi:", err.response.status);
          } else if (err.request) {
              // Request đã gửi nhưng không nhận được phản hồi
              console.error("Không nhận được phản hồi từ server:", err.request);
          } else {
              console.log(err.message);
              console.error("Lỗi:", err.message);
          }
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
                console.log(">>> [DEBUG DỮ LIỆU NHẬN VỀ]:", user) ||
                <tr key={user?.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--admin-text-head)', fontSize: '14px' }}>{user?.ten_dang_nhap || user?.ho_ten || 'Thành viên'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>{user?.email}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px' }}>{user?.so_dien_thoai || '—'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: 'var(--admin-text-muted)' }}>{user?.dia_chi || '—'}</td>
                  <td className="text-center">
                    <span style={{
                      fontSize: '11px', fontWeight: 500, padding: '4px 10px', borderRadius: '4px',
                      background: (user?.role) === 'Admin' ? 'rgba(62, 106, 225, 0.1)' : 'var(--admin-bg-ash)',
                      color: (user?.role) === 'Admin' ? 'var(--admin-primary)' : 'var(--admin-text-muted)'
                    }}>
                      {user?.role}
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
                {/* Tên đăng nhập */}
                <div className="form-group">
                    <label className="form-label">Tên đăng nhập</label>
                    <input 
                        required className="form-control"
                        value={formData.ten_dang_nhap}
                        onChange={(e) => setFormData(prev => ({...prev, ten_dang_nhap: e.target.value}))}
                    />
                </div>

                {/* Họ và tên */}
                <div className="form-group">
                    <label className="form-label">Họ và tên</label>
                    <input required className="form-control" value={formData.ten_nhan_vien}
                        onChange={(e) => setFormData(prev => ({...prev, ten_nhan_vien: e.target.value}))} />
                </div>

                {/* Email & SĐT */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input required type="email" className="form-control" value={formData.email}
                            onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Số điện thoại</label>
                        <input required className="form-control" value={formData.so_dien_thoai}
                            onChange={(e) => setFormData(prev => ({...prev, so_dien_thoai: e.target.value}))} />
                    </div>
                </div>

                {/* Chức vụ & Quyền */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">Chức vụ</label>
                        <input required className="form-control" value={formData.chuc_vu}
                            onChange={(e) => setFormData(prev => ({...prev, chuc_vu: e.target.value}))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Loại người dùng</label>
                        <select
                            required
                            className="form-control"
                            value={formData.loai_nguoi_dung} // ĐÃ SỬA: Dùng đúng tên từ useState
                            onChange={(e) => setFormData(prev => ({...prev, loai_nguoi_dung: e.target.value}))} // ĐÃ SỬA: Ghi vào đúng key
                        >
                            <option value="">-- Chọn quyền --</option>
                            {roles.map(role => (
                                <option key={role.loai_nguoi_dung_id} value={role.loai_nguoi_dung_id}>
                                    {role.ten}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Mật khẩu */}
                <div className="form-group">
                    <label className="form-label">Mật khẩu</label>
                    <input type="password" required={!editingUser} className="form-control" 
                        value={formData.mat_khau} // ĐÃ SỬA: Dùng đúng tên
                        onChange={(e) => setFormData(prev => ({...prev, mat_khau: e.target.value}))} />
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
