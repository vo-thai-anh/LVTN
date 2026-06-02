
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/400x600/e2e8f0/475569?text=Chua+co+anh';
  
  // Chuẩn hóa đường dẫn: Đổi tất cả dấu gạch chéo ngược (\) thành gạch chéo xuôi (/)
  const normalizedPath = path.replace(/\\/g, '/');

  // Nếu là URL tuyệt đối từ Cloudinary (http/https), blob hoặc link gốc, giữ nguyên nguyên vẹn
  if (normalizedPath.startsWith('http') || normalizedPath.startsWith('blob:') || normalizedPath.startsWith('/')) {
    return normalizedPath;
  }

  // Phương án dự phòng nếu sau này có ảnh mẫu cục bộ lưu ở Backend Laravel
  const apiBase = import.meta.env.VITE_API_USER_URL || 'http://localhost:8000/api';
  const rootDomain = apiBase.replace(/\/api$/, '');
  
  return `${rootDomain}/storage/${normalizedPath}`;
};
