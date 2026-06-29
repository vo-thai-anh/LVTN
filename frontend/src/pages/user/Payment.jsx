import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';
const PaymentGateway = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    // Nếu không có dữ liệu đơn hàng (người dùng gõ URL trực tiếp), quay về trang chủ
    if (!state) {
        navigate('/');
        return null;
    }

    return (
        <div className="pg-wrapper">
            <div className="pg-card">
                <h2>Cổng thanh toán BookOne</h2>
                <div className="pg-info">
                    <p>Mã đơn hàng: <strong>#{state.orderId}</strong></p>
                    <p>Số tiền: <strong>{new Intl.NumberFormat('vi-VN').format(state.total)}đ</strong></p>
                </div>
                
                <img src="https://qr.sepay.vn/img?bank=VietinBank&acc=107879317919&template=compact&des=SEVQR+Thanh+Toan+Don+Hang&showinfo=true&holder=VO%20THAI%20ANH" 
                alt="QR thanh toán - Ngân hàng TMCP Công Thương Việt Nam - 107879317919 - VO THAI ANH"
                width="300" />
                
                <p>Nội dung chuyển khoản: <strong>{state.noi_dung}</strong></p>
                
                <button onClick={() => navigate('/confirm', { state: { orderId: state.orderId } })}>
                    Đã chuyển khoản - Xác nhận đơn hàng
                </button>
            </div>
        </div>
    );
};
export default PaymentGateway;