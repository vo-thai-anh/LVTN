import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils';

// ── ProductCard tối giản theo đúng thiết kế mẫu ──────────────────────────────
const ProductCard = ({ sach }) => {
  const price = sach.gia_ban || sach.gia || 0;
  const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + ' VND';

  // Đã sử dụng getImageUrl từ ../utils/urlHelper

  return (
    <Link to={`/product/${sach.id}`} className="pc2-card">
      <div className="pc2-img-wrap">
        <img
          src={getImageUrl(sach.anh_bia)}
          alt={sach.ten_sach}
          className="pc2-img"
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x600/e2e8f0/475569?text=Chua+co+anh'; }}
        />
        {sach.so_luong <= 0 ? (
          <span className="pc2-oos">Hết hàng</span>
        ) : Number(sach.trang_thai) === 0 && (
          <span className="pc2-oos" style={{ background: '#e53e3e' }}>Ngưng bán</span>
        )}
      </div>
      <div className="pc2-body">
        <p className="pc2-name">{sach.ten_sach}</p>
        <p className="pc2-price">{fmt(price)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
