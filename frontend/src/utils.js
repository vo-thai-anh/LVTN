
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/400x600/e2e8f0/475569?text=Chua+co+anh';
  
  // Chuẩn hóa đường dẫn: Đổi tất cả dấu gạch chéo ngược (\) thành gạch chéo xuôi (/)
  const normalizedPath = path.replace(/\\/g, '/');

  // Nếu là URL tuyệt đối (http...), blob hoặc đường dẫn cục bộ bắt đầu bằng /
  if (normalizedPath.startsWith('http') || normalizedPath.startsWith('blob:') || normalizedPath.startsWith('/')) {
    return normalizedPath;
  }

  // Lấy Base URL của User Backend (nhom1be.onrender.com)
  const apiBase = import.meta.env.VITE_API_USER_URL || import.meta.env.VITE_USER_API_URL || 'http://localhost:8000/api';
  
  // Loại bỏ hậu tố /api để lấy domain gốc
  const rootDomain = apiBase.replace(/\/api$/, '');

  // Xử lý logic đường dẫn tương đương với Laravel
  if (normalizedPath.startsWith('assets/')) {
    return `${rootDomain}/${normalizedPath}`;
  }
  
  return `${rootDomain}/assets/product/${normalizedPath}`;
};
