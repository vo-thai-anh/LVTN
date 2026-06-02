import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const AuthContext = createContext();

const normalizeUser = (user = {}) => {
  const detail = user.thong_tin_chi_tiet || {};
  const rawRole = user.role || user.quyen || user.loai_nguoi_dung || detail.loai_nguoi_dung || null;
  return {
    ...user,
    email: detail.email || user.email || '',
    so_dien_thoai: detail.so_dien_thoai || user.so_dien_thoai || '',
    dia_chi: detail.dia_chi || user.dia_chi || '',
    ten_khach_hang: detail.ten_khach_hang || detail.ho_ten || user.ten_khach_hang || '',
    role: rawRole ? String(rawRole) : null,
    thong_tin_chi_tiet: detail,

  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo từ LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      try {
        setUser(normalizeUser(JSON.parse(savedUser)));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData, token) => {
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('token', token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
