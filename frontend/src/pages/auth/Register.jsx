import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAxios as axiosClient } from '../../axiosClient';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, BookOpen, Loader } from 'lucide-react';
import '../../styles/design-system.css';
import './Register.css';

const Field = ({ ico: Ico, id, label, type = 'text', name, placeholder,
                 autoComplete, required, minLength,
                 showToggle, shown, onToggle,
                 value, onChange }) => (
  <div className="ds-field-compact">
    <label className="ds-label-compact" htmlFor={id}>{label}</label>
    <div className="ds-input-wrap">
      <Ico size={14} className="ds-input-ico" />
      <input
        id={id}
        type={showToggle ? (shown ? 'text' : 'password') : type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`ds-input-refined${showToggle ? ' ds-input-pass' : ''}`}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
      />
      {showToggle && (
        <button type="button" className="auth-eye-compact" onClick={onToggle} tabIndex={-1}>
          {shown ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    ten_dang_nhap: '',
    ten_khach_hang: '', // Bổ sung để lưu họ tên thật của khách hàng
    email: '',
    so_dien_thoai: '',
    dia_chi: '',
    mat_khau: '',
    mat_khau_confirmation: '',
  });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.mat_khau !== formData.mat_khau_confirmation) {
      toast.error('Mật khẩu xác nhận không khớp!'); 
      return;
    }
    setLoading(true);

    // 💡 Tự động sinh mã khach_hang_id (chuỗi 10 ký tự: KH + 8 số timestamp cuối)
    // nhằm đáp ứng đúng yêu cầu của Backend cũ mà không làm xấu UI
    const generatedKhachHangId = 'KH' + substrTimeCompact();

    // Đóng gói dữ liệu đúng từng trường chính xác tuyệt đối với những gì Backend cũ đang validate
    const backendPayload = {
      ten_dang_nhap: formData.ten_dang_nhap,
      mat_khau: formData.mat_khau,
      mat_khau_confirmation: formData.mat_khau_confirmation,
      
      khach_hang_id: generatedKhachHangId,
      ten_khach_hang: formData.ten_khach_hang, // Đã có ô nhập riêng sạch sẽ
      email: formData.email,
      so_dien_thoai: formData.so_dien_thoai,
      dia_chi: formData.dia_chi,
      gioi_tinh: null,
      nam_sinh: null
    };

    try {
      // Gửi payload đã được "chế" đầy đủ trường lên Backend
      const res = await axiosClient.post('/register', backendPayload);
      
      if (res && res.success === false) {
        toast.error(res.message || 'Đăng ký thất bại');
        return;
      }
      toast.success(res.message || 'Đăng ký thành công!');
      navigate('/login');
    } catch (err) {
      if (err.errors) {
        toast.error(Object.values(err.errors)[0][0]);
      } else {
        toast.error(err.message || 'Đăng ký thất bại, vui lòng thử lại.');
      }
    } finally { 
      setLoading(false); 
    }
  };

  // Hàm phụ trợ sinh chuỗi 8 số dựa trên thời gian giống với hàm time() trong PHP
  const substrTimeCompact = () => {
    const timestampStr = Math.floor(Date.now() / 1000).toString();
    return timestampStr.substring(timestampStr.length - 8);
  };

  return (
    <div className="auth-root ds-page">
      <div className="auth-center">
        <div className="ds-card auth-card-premium auth-card-wide">
          <div className="auth-header-compact">
            <div className="auth-logo-box-small">
              <BookOpen size={20} />
            </div>
            <h1 className="auth-title-compact">Đăng ký tài khoản</h1>
            <p className="auth-subtitle-compact">Tham gia cùng chúng tôi để nhận ưu đãi tốt nhất.</p>
          </div>

          <div className="auth-body-compact">
            <form onSubmit={handleSubmit} id="register-form" className="auth-form-compact">
              <div className="auth-grid-compact">
                {/* Tên Đăng Nhập (Để đăng nhập) */}
                <Field ico={User}   id="reg-username" label="Tên đăng nhập"     name="ten_dang_nhap"         placeholder="Tên tài khoản viết liền"        required
                  value={formData.ten_dang_nhap}         onChange={handleChange} />
                
                {/* Họ và Tên (Mới bổ sung để đẩy vào cột ten_khach_hang ở Backend) */}
                <Field ico={User}   id="reg-fullname" label="Họ và tên khách hàng" name="ten_khach_hang"       placeholder="Nhập đầy đủ họ và tên"       required
                  value={formData.ten_khach_hang}         onChange={handleChange} />

                {/* Địa chỉ Email */}
                <Field ico={Mail}   id="reg-email"    label="Địa chỉ Email"     name="email"                 placeholder="example@gmail.com"   type="email" autoComplete="email" required
                  value={formData.email}                 onChange={handleChange} />
                
                {/* Số điện thoại */}
                <Field ico={Phone}  id="reg-phone"    label="Số điện thoại"     name="so_dien_thoai"         placeholder="0901 234 567"         type="tel" autoComplete="tel" required
                  value={formData.so_dien_thoai}         onChange={handleChange} />
                
                {/* Địa chỉ giao hàng */}
                <Field ico={MapPin} id="reg-address"  label="Địa chỉ giao hàng" name="dia_chi"               placeholder="Số nhà, tên đường..."  required
                  value={formData.dia_chi}               onChange={handleChange} />
                
                {/* Mật khẩu */}
                <Field ico={Lock}   id="reg-pass"     label="Mật khẩu"          name="mat_khau"              placeholder="Tối thiểu 6 ký tự"   required minLength={6}
                  showToggle shown={showPass} onToggle={() => setShowPass(p => !p)}
                  value={formData.mat_khau}              onChange={handleChange} />
                
                {/* Xác nhận mật khẩu */}
                <Field ico={Lock}   id="reg-confirm"  label="Xác nhận mật khẩu" name="mat_khau_confirmation" placeholder="Lặp lại mật khẩu"    required
                  showToggle shown={showConfirm} onToggle={() => setShowConfirm(p => !p)}
                  value={formData.mat_khau_confirmation} onChange={handleChange} />
              </div>

              <button type="submit" className="ds-btn-primary premium-btn" disabled={loading} id="register-submit">
                {loading ? <><Loader size={16} className="ds-spin" /> Đang xử lý...</> : 'Đăng ký ngay'}
              </button>
            </form>

            <div className="auth-footer-compact">
              <p className="auth-switch-text">
                Đã có tài khoản?{' '}
                <Link to="/login" className="auth-switch-link" id="go-login">Đăng nhập</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;