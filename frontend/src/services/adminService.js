import { adminAxios as axios } from '../axiosClient';

const mapBook = (book = {}) => ({
  id: book.sach_id,
  tenSach: book.ten_sach,
  tacGia: book.tac_gia,
  nhaXuatBan: book.nha_xuat_ban,
  gia: book.gia,
  soLuong: book.so_luong_ton,
  loaiSach: {
    id: book.loai_sach,
    tenLoai: book.loaisach?.ten_loai || ''
  },
  moTa: book.mo_ta,
  trangThai: book.trang_thai,
  anhBia: book.anh_bia,
  trongLuong: book.trong_luong,
  kichThuoc: book.kich_thuoc,
  soTrang: book.so_trang,
});

const mapCategory = (cat = {}) => ({
  id: cat.loai_sach_id,
  tenLoai: cat.ten_loai,
});

const mapUser = (user = {}) => ({
  id: user.khach_hang_id,
  tenDangNhap: user.taiKhoan?.ten_dang_nhap || user.ten_khach_hang || '',
  email: user.email,
  soDienThoai: user.so_dien_thoai,
  diaChi: user.dia_chi,
  role: 'khach_hang'
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
  loai_sach: payload.loaiSach?.id || payload.loai_sach_id || '',
  mo_ta: payload.moTa,
  trang_thai: Number(payload.trangThai) || 0,
  anh_bia: payload.anhBia,
  trong_luong: Number(payload.trongLuong) || 0,
  kich_thuoc: payload.kichThuoc,
  so_trang: Number(payload.soTrang) || 0,
});

const randomId = () => Math.random().toString(36).substring(2, 12).toUpperCase();

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

  addBook: (data) => axios.post('/sach', buildBookPayload(data)),
  updateBook: (id, data) => axios.put(`/sach/${id}`, buildBookPayload(data)),
  deleteBook: (id) => axios.delete(`/sach/${id}`),

  getCategories: async () => {
    const res = await axios.get('/loaisach');
    const data = normalizeApiResponse(res);
    return Array.isArray(data) ? data.map(mapCategory) : (Array.isArray(data?.data) ? data.data.map(mapCategory) : []);
  },
  addCategory: (data) => axios.post('/loaisach', { ten_loai: data.tenLoai }),
  updateCategory: (id, data) => axios.put(`/loaisach/${id}`, { ten_loai: data.tenLoai }),
  deleteCategory: (id) => axios.delete(`/loaisach/${id}`),

  getUsers: async () => {
    const res = await axios.get('/nguoidung');
    const data = normalizeApiResponse(res);
    const users = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    return {
      content: users.map(mapUser),
      totalPages: data?.last_page || 1
    };
  },
  addUser: (data) => axios.post('/register', {
    tai_khoan_id: randomId(),
    ten_dang_nhap: data.tenDangNhap,
    mat_khau: data.matKhau,
    mat_khau_confirmation: data.matKhau,
    khach_hang_id: randomId(),
    ten_khach_hang: data.tenDangNhap,
    email: data.email,
    so_dien_thoai: data.soDienThoai,
    dia_chi: data.diaChi,
    gioi_tinh: data.gioiTinh || null,
    nam_sinh: data.namSinh || null
  }),
  updateUser: (id, data) => axios.put(`/nguoidung/${id}`, {
    ten_khach_hang: data.tenDangNhap,
    email: data.email,
    so_dien_thoai: data.soDienThoai,
    dia_chi: data.diaChi
  }),
  deleteUser: (id) => axios.delete(`/nguoidung/${id}`),

  getOrders: async () => {
    const res = await axios.get('/donhang');
    const data = normalizeApiResponse(res);
    return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  },
  getOrderById: async (id) => {
    const res = await axios.get(`/donhang/${id}`);
    const data = normalizeApiResponse(res);
    return data;
  },
  updateOrderStatus: (id, statusData) => axios.put(`/donhang/${id}`, statusData)
};

export default AdminAPI;
