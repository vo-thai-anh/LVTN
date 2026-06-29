import { adminAxios as axios } from '../axiosClient';

const mapBook = (book = {}) => ({
  id: book.sach_id,
  tenSach: book.ten_sach,
  tacGia: book.tac_gia,
  nhaXuatBan: book.nha_xuat_ban,
  gia: book.gia,
  soLuong: book.so_luong_ton,
  loaiSach: {
    id: book.loai_sach || '',
    tenLoai: book.loai_sach?.ten_loai|| ''
  },
  moTa: book.mo_ta,
  trangThai: book.trang_thai,
  anhBia: book.anh_bia,
  trongLuong: book.trong_luong,
  kichThuoc: book.kich_thuoc,
  soTrang: book.so_trang,
  nhaCungCap: book.nha_cung_cap
});

const mapCategory = (cat = {}) => ({
  id: cat.loai_sach_id,
  tenLoai: cat.ten_loai,
});

const mapUser = (user = {}) => ({
  id: user.khach_hang_id||user.nhan_vien_id,
  tenDangNhap: user.TaiKhoan?.ten_dang_nhap ||'',
  email: user.email,
  soDienThoai: user.so_dien_thoai,
  diaChi: user.dia_chi,
  role: user.taikhoan?.loai_nguoi_dung || '',
  hoTen: user.ten_khach_hang || user.ten_nhan_vien || '',
  chucVu: user.chuc_vu || '',
  namSinh: user.nam_sinh || '',
  gioiTinh: user.gioi_tinh || ''
});

const normalizeApiResponse = (res) => {
  if (!res) return null;
  if (res.success && res.data !== undefined) return res.data;
  return res;
};

const buildBookPayload = (payload = {}) => ({
  ten_sach: payload.tenSach,
  tac_gia: payload.tacGia,
  nha_xuat_ban: payload.nhaXuatBan,
  gia: Number(payload.gia) || 0,
  so_luong_ton: Number(payload.soLuong) || 0,
  loai_sach:payload.loai_sach?.id || '',
  mo_ta: payload.moTa,
  trang_thai: Number(payload.trangThai) || 0,
  anh_bia: payload.anhBia,
  trong_luong: Number(payload.trongLuong) || 0,
  kich_thuoc: payload.kichThuoc,
  so_trang: Number(payload.soTrang) || 0,
});
export const AdminAPI = {
  getBooks: async (params) => {
    const endpoint = params?.search ? '/sach/search' : '/sach';
    const res = await axios.get(endpoint, {
      params: {
        search: params?.search || undefined,
        page: params?.page > 0 ? params.page : 1,
      }
    });
    const data = normalizeApiResponse(res);
    return {
      content: Array.isArray(data?.data) ? data.data.map(mapBook) : [],
      totalPages: data?.last_page || 1
    };
  },

  addBook: (data) => {
    if (data instanceof FormData) {
      return axios.post('/sach', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return axios.post('/sach', buildBookPayload(data));
  },
  updateBook: (id, data) => {
    if (data instanceof FormData) {
      return axios.post(`/sach/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return axios.post(`/sach/${id}`, buildBookPayload(data));
  },
  deleteBook: (id) => axios.delete(`/sach/${id}`),
  //categories
  getCategories: async () => {
    const res = await axios.get('/loaisach');
    const data = normalizeApiResponse(res);
    return Array.isArray(data) ? data.map(mapCategory) : (Array.isArray(data?.data) ? data.data.map(mapCategory) : []);
  },
  addCategory: (data) => axios.post('/loaisach', { ten_loai: data.tenLoai }),
  updateCategory: (id, data) => axios.put(`/loaisach/${id}`, { ten_loai: data.tenLoai }),
  deleteCategory: (id) => axios.delete(`/loaisach/${id}`),
  //user
  getUsers: async () => {
    const res = await axios.get('/nguoidung');
    const data = normalizeApiResponse(res);
    return Array.isArray(data) ? data.map(mapUser) : (Array.isArray(data?.data) ? data.data.map(mapUser) : []);
  },
  getNhanViens: async () => {
    const res = await axios.get('/nguoidung');
    const data = normalizeApiResponse(res);
    return Array.isArray(data) ? data.map(mapUser) : (Array.isArray(data?.data) ? data.data.map(mapUser) : []);
  },
  addUser: (data) => {
    return axios.post('/registerNhanVien', {
      ten_dang_nhap: data.ten_dang_nhap,
      mat_khau: data.mat_khau,
      dia_chi: data.dia_chi,
      mat_khau_confirmation: data.mat_khau,
      email: data.email,
      ten_nhan_vien: data.ten_nhan_vien,
      so_dien_thoai: data.so_dien_thoai,
      chuc_vu: data.chuc_vu,
      loai_nguoi_dung: parseInt(data.loai_nguoi_dung)
    });
  },
  updateUser: (id, data) => axios.put(`/nguoidung/${id}`, {
    ten_khach_hang: data.ten_dang_nhap,
    email: data.email,
    so_dien_thoai: data.so_dien_thoai,
    dia_chi: data.dia_chi
  }),
  deleteUser: (id) => axios.delete(`/nguoidung/${id}`),

  getOrders: async () => {
    const res = await axios.get('/donhang');
    const data = normalizeApiResponse(res);
    return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  },
  // updateOrderStatus: async (id, newStatus) => {
  //   // Dùng patch theo đúng route Admin đã thống nhất
  //   return await axios.patch(`/admin/donhang/${id}/status`, {
  //       trang_thai: newStatus
  //   });
  // },
  getOrderById: async (id) => {
    const res = await axios.get(`/donhang/${id}`);
    const data = normalizeApiResponse(res);
    return data;
  },
  updateOrderStatus: (id, statusData) => axios.patch(`/donhang/${id}`, statusData),
  getRoles: async () => {
      try {
          const res = await axios.get('/loainguoidung');
          console.log("Dữ liệu Role:", res);
          return normalizeApiResponse(res);
      } catch (error) {
          console.error("Lỗi gọi API Roles:", error);
          throw error;
      }
  },
};

export default AdminAPI;
