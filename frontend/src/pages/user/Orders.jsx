import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/userService';
import { Package, Clock, XCircle, CheckCircle2, FileText, Loader, ChevronRight, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/design-system.css';
import './Orders.css';

const fmt        = (n)  => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const fmtDate    = (d)  => {
  if (!d) return '';
  const [year, month, day] = d.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'CHỜ_XÁC_NHẬN': case 'CHỜ_LẤY_HÀNG':
      return <span className="ds-badge ds-badge-wait"><Clock size={11} /> Chờ xử lý</span>;
    case 'ĐANG_GIAO_HÀNG':
      return <span className="ds-badge ds-badge-info"><Package size={11} /> Đang giao</span>;
    case 'ĐÃ_GIAO_HÀNG':
      return <span className="ds-badge ds-badge-success"><CheckCircle2 size={11} /> Đã giao</span>;
    case 'ĐÃ_HỦY': case 'HỦY':
      return <span className="ds-badge ds-badge-danger"><XCircle size={11} /> Đã hủy</span>;
    default:
      return <span className="ds-badge ds-badge-wait">{status}</span>;
  }
};

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;
    setCancelingId(orderId);
    try {
      await orderAPI.cancelOrder(orderId);
      toast.success('Hủy đơn hàng thành công');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trang_thai: 'ĐÃ_HỦY' } : o));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể hủy lúc này');
    } finally { setCancelingId(null); }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    
    orderAPI.getOrders()
      .then(res => {
        console.log('>>> [DEBUG] Dữ liệu đơn hàng nhận được:', res);
        const data = res?.data || res || [];
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error('Không thể tải danh sách đơn hàng.'))
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  if (loading) return (
    <div className="ds-page ords-loading-wrap">
      <Loader size={38} className="ds-spin ords-spinner-color" />
    </div>
  );

  return (
    <div className="ds-page">
      <div className="ds-wrap">
        {/* ... */}
        {orders.map(order => (
          <div key={order.don_hang_id} className="ds-card ords-card">
            <div className="ords-card-hd">
              <div className="ords-card-id">
                <span className="ords-id-label">Đơn hàng</span>
                <span className="ords-id-val">#{order.don_hang_id}</span>
              </div>
              <StatusBadge status={order.trang_thai} />
            </div>

            <div className="ords-card-body">
              <div className="ords-info-grid">
                <div className="ords-info-item">
                  <Calendar size={13} className="ords-ico" />
                  <span className="ords-info-label">Ngày đặt:</span>
                  <span className="ords-info-val">{fmtDate(order.ngay_tao)}</span>
                </div>
                <div className="ords-info-item">
                  <Package size={13} className="ords-ico" />
                  <span className="ords-info-label">Người nhận:</span>
                  <span className="ords-info-val">{order.ten_nguoi_nhan} · {order.sdt_nguoi_nhan}</span>
                </div>
                <div className="ords-info-item">
                  <CreditCard size={13} className="ords-ico" />
                  <span className="ords-info-label">Thanh toán:</span>
                  <span className="ords-info-val">{order.thanhtoan?.phuong_thuc?.mo_ta|| 'Chưa xác định'}</span>
                </div>
              </div>
            </div>

            <div className="ords-card-ft">
              <div className="ords-total-wrap">
                <span className="ords-total-label">Tổng cộng</span>
                {/* Dùng tong_tien thay vì thanh_tien nếu Backend lưu như vậy */}
                <span className="ords-total-val">{fmt(order.tong_tien)}</span>
              </div>
              <div className="ords-actions-wrap">
                {order.trang_thai === 'CHỜ_XÁC_NHẬN' && (
                  <button
                    className="ords-cancel-btn"
                    onClick={() => handleCancelOrder(order.don_hang_id)}
                    disabled={cancelingId === order.don_hang_id}
                  >
                    {cancelingId === order.don_hang_id ? <Loader size={14} className="ds-spin" /> : <XCircle size={14} />}
                    Hủy đơn
                  </button>
                )}
                <Link to={`/orders/${order.don_hang_id}`} className="ords-detail-btn">
                  Xem chi tiết <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
