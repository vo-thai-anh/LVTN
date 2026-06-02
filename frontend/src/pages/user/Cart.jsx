import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { cartAPI } from '../../services/userService';
import {
  ShoppingCart, Trash2, Plus, Minus,
  BookOpen, Loader,
} from 'lucide-react';
import '../../styles/design-system.css';
import { getImageUrl } from '../../utils';
import './Cart.css';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';

/* ── Skeleton row ── */
const SkRow = () => (
  <div className="crt-row">
    <div className="ds-sk cart-sk-img" />
    <div className="cart-sk-meta">
      <div className="ds-sk cart-sk-line-1" />
      <div className="ds-sk cart-sk-line-2" />
    </div>
    <div className="ds-sk cart-sk-price" />
    <div className="ds-sk cart-sk-qty" />
    <div className="ds-sk cart-sk-total" />
    <div className="ds-sk cart-sk-del" />
  </div>
);

/* ── Empty state ── */
const Empty = ({ title, sub, action }) => (
  <div className="crt-empty">
    <ShoppingCart size={54} className="cart-empty-icon" />
    <h2 className="crt-empty-title">{title}</h2>
    <p className="crt-empty-sub">{sub}</p>
    {action}
  </div>
);

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, loadingCart, cartCount, setCartItems } = useCart();
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    console.log('>>> [DEBUG GIỎ HÀNG] Danh sách cartItems thay đổi:', cartItems);
  }, [cartItems]);

  const handleQty = async (item, delta) => {
  const currentQty = parseInt(item.so_luong || 0);
  const newQty = currentQty + delta;
    if (newQty < 1) return;

    const maxStock = item.sach?.so_luong_ton ?? 999;
    if (newQty > maxStock) {
      toast.error(`Chỉ còn ${maxStock} sản phẩm trong kho`);
      return;
    }
    const idSach = item.sach?.sach_id || item.sach;
    
    if (!idSach) {
      console.error("❌ Không tìm thấy ID sách từ item:", item);
      return;
    }

    setUpdating(idSach);
    
    // Cập nhật tạm thời trên UI để mượt mà
    setCartItems(prev => (prev || []).map(cartItem => {
      const cartItemId = cartItem.sach?.sach_id || cartItem.sach;
      return cartItemId === idSach
        ? { ...cartItem, so_luong: newQty, thanh_tien: newQty * (parseFloat(cartItem.don_gia) || 0) }
        : cartItem;
    }));

    try {
      console.log(`>>> [DEBUG API] Đang gọi API update sản phẩm ID: ${idSach} với số lượng mới: ${newQty}`);
      
      // 🛠️ CHỖ NÀY QUAN TRỌNG NHẤT: Phải truyền số idSach, KHÔNG ĐƯỢC truyền nguyên chữ 'item'
      await cartAPI.updateQuantity(idSach, newQty); 
      
      console.log('>>> [DEBUG API] Cập nhật số lượng thành công!');
    } catch (err) {
      console.error('❌ [DEBUG API ERROR] Update Quantity lỗi:', err);
      toast.error('Không thể cập nhật số lượng, vui lòng thử lại');
      
      // Hoàn tác nếu lỗi
      setCartItems(prev => (prev || []).map(cartItem => {
        const cartItemId = cartItem.sach?.sach_id || cartItem.sach;
        return cartItemId === idSach
          ? { ...cartItem, so_luong: currentQty, thanh_tien: currentQty * (parseFloat(cartItem.don_gia) || 0) }
          : cartItem;
      }));
    } finally {
      setUpdating(null);
    }
  };
  const handleDelete = async (item) => {
    const idSach = item.sach?.sach_id || item.sach;
    
    if (!idSach) {
      console.error("❌ Không tìm thấy ID sách để xóa:", item);
      return;
    }

    console.log('>>> [DEBUG DELETE] Chuẩn bị xóa sản phẩm có ID sách:', idSach);
    setDeleting(idSach);
    
    const previousItems = [...cartItems];
    
    // Lọc tạm thời trên UI để xóa dòng ngay lập tức cho mượt
    setCartItems(prev => (prev || []).filter(cartItem => {
      const cartItemId = cartItem.sach?.sach_id || cartItem.sach;
      return cartItemId !== idSach;
    }));
    
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');

    try {
      console.log(`>>> [DEBUG API] Đang gọi API xóa sản phẩm ID: ${idSach}`);
      await cartAPI.removeItem(idSach);
      console.log('>>> [DEBUG API] Xóa sản phẩm thành công!');
    } catch (err) {
      console.error('❌ [DEBUG API ERROR] Remove Item lỗi:', err);
      toast.error('Không thể xóa sản phẩm, vui lòng thử lại');
      setCartItems(previousItems);
    } finally {
      setDeleting(null);
    }
  };
  const currentItems = cartItems || [];
  const total = currentItems.reduce((s, i) => s + parseFloat(i.thanh_tien || 0), 0);

  return (
    <div className="ds-page crt-page">
      <div className="ds-wrap">
        {/* Chưa đăng nhập */}
        {!user && !loadingCart ? (
          <Empty title="Vui lòng đăng nhập" sub="Bạn cần đăng nhập để xem giỏ hàng"
            action={<Link to="/login" className="ds-btn-primary cart-login-btn">Đăng nhập ngay</Link>} />
        ) :
        
        /* Giỏ hàng trống */
        !loadingCart && currentItems.length === 0 ? (
          <Empty title="Giỏ hàng đang trống" sub="Hãy chọn thêm sách để bắt đầu mua sắm"
            action={<Link to="/category" className="ds-btn-primary cart-browse-btn"><BookOpen size={16} />Khám phá sách</Link>} />
        ) : (
          <>
            <div className="ds-page-hd">
              <h1 className="ds-page-title"><ShoppingCart size={24} />Giỏ hàng
                {!loadingCart && <span className="crt-count">{cartCount} sản phẩm</span>}
              </h1>
            </div>

            <div className="crt-layout">
              {/* ── Danh sách sản phẩm ── */}
              <div className="crt-list-col">
                <div className="ds-card crt-list-card">
                  <div className="crt-list-head">
                    <span className="crt-h-product">Sản phẩm</span>
                    <span className="crt-h-price">Đơn giá</span>
                    <span className="crt-h-qty">Số lượng</span>
                    <span className="crt-h-total">Thành tiền</span>
                    <span />
                  </div>
    
                  {/* Rows */}
                  {loadingCart
                    ? [...Array(3)].map((_, i) => <SkRow key={i} />)
                    : currentItems.map((item, idx) => {
                        console.log(`>>> [DEBUG RENDER ROW #${idx}]`, item);
                        return (
                          <div key={item.sach_id || idx} className={`crt-row${idx < currentItems.length - 1 ? ' crt-row-sep' : ''}`}>
                            <div className="crt-item-info">
                              {/* 🛠️ ĐÃ FIX: Điều hướng chuẩn theo item.sach_id */}
                              <Link to={`/product/${item.sach_id}`} className="crt-img-wrap">
                                <img
                                  src={getImageUrl(item.sach?.anh_bia)} // 🛠️ ĐÃ FIX: Chỉ dùng trường anh_bia đồng bộ Cloudinary
                                  alt={item.sach?.ten_sach || 'Sách'} 
                                  className="crt-img"
                                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x600/e2e8f0/475569?text=Chua+co+anh'; }}
                                  referrerPolicy="no-referrer"
                                />
                              </Link>
                              <div className="crt-meta">
                                {/* 🛠️ ĐÃ FIX: Chỉ dùng trường ten_sach dạng snake_case */}
                                <Link to={`/product/${item.sach_id}`} className="crt-name">
                                  {item.sach?.ten_sach || `Sản phẩm #${item.sach_id}`}
                                </Link>
                                {item.sach?.tac_gia && <span className="crt-author">{item.sach.tac_gia}</span>}
                                <span className="crt-price-mobile">{fmt(item.don_gia)}</span>
                              </div>
                            </div>
    
                            <span className="crt-h-price crt-price-val">{fmt(item.don_gia)}</span>
    
                            <div className="crt-h-qty">
                              <div className="crt-qty">
                                <button className="crt-qty-btn" onClick={() => handleQty(item, -1)} disabled={(item.so_luong || 0) <= 1 || updating === item.sach_id}><Minus size={12} /></button>
                                <span className="crt-qty-val">{updating === item.sach_id ? <Loader size={13} className="ds-spin" /> : (item.so_luong || 0)}</span>
                                <button className="crt-qty-btn" onClick={() => handleQty(item, 1)} disabled={updating === item.sach_id}><Plus size={12} /></button>
                              </div>
                            </div>
                            <span className="crt-h-total crt-total-val">{fmt(item.thanh_tien)}</span>
                            <button
                              className="crt-del-btn"
                              onClick={() => handleDelete(item)}
                              disabled={deleting === (item.sach?.sach_id || item.sach)}
                              aria-label="Xóa sản phẩm"
                            >
                              {deleting === (item.sach?.sach_id || item.sach) ? (
                                <Loader size={15} className="ds-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        );
                      })
                  }
                </div>
    
                <Link to="/category" className="crt-continue"> Tiếp tục mua sắm</Link>
              </div>
    
              {/* ── Tóm tắt đơn hàng ── */}
              <div className="crt-summary-col">
                <div className="ds-card crt-summary-card">
                  <h2 className="ds-card-title">Tóm tắt đơn hàng</h2>
                  <div className="crt-sum-body">
                    <div className="crt-sum-row"><span>Tạm tính ({cartCount} sản phẩm)</span><span>{fmt(total)}</span></div>
                    <div className="crt-sum-row"><span>Phí vận chuyển</span><span className="cart-free-tag">Miễn phí</span></div>
                    <div className="crt-sum-divider" />
                    <div className="crt-sum-total"><span>Tổng cộng</span><span className="crt-sum-amount">{fmt(total)}</span></div>
                    <button className="ds-btn-primary crt-checkout-btn" onClick={() => navigate('/checkout')} disabled={loadingCart || currentItems.length === 0} id="proceed-checkout-btn">
                      Tiến hành thanh toán
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;