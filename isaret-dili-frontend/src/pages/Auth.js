import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, User, LogIn, UserPlus, KeyRound, Loader2 } from 'lucide-react';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState('login'); 
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    token: '', 
    newPassword: '' 
  });

  useEffect(() => {
    if (location.state && location.state.mode === 'register') {
      setMode('register');
    }
  }, [location]);

  const clearStatus = () => setStatusMessage({ type: '', text: '' });

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearStatus();

    try {
      if (mode === 'login') {
        const res = await api.post('/Auth/login', { email: formData.email, password: formData.password });
        
        localStorage.setItem('token', res.data.token);
        if (res.data.username) localStorage.setItem('userName', res.data.username);
        if (res.data.userId) localStorage.setItem('userId', res.data.userId);
        
        // 🔥 GÜNCELLEME: Rol bilgisini kaydet (Admin kontrolü için)
        if (res.data.role) localStorage.setItem('userRole', res.data.role);

        navigate('/dashboard'); 
      } 
      else if (mode === 'register') {
        await api.post('/Auth/register', { 
          username: formData.username, 
          email: formData.email, 
          password: formData.password 
        });
        setStatusMessage({ type: 'success', text: 'Kayıt başarılı! Giriş yapabilirsiniz.' });
        setTimeout(() => { setMode('login'); clearStatus(); }, 2000);
      } 
      else if (mode === 'forgot') {
        await api.post('/Auth/forgot-password', { email: formData.email });
        setMode('reset'); 
        setStatusMessage({ type: 'success', text: 'Kod e-posta adresinize gönderildi!' });
      } 
      else if (mode === 'reset') {
        await api.post('/Auth/reset-password', { 
          email: formData.email, 
          token: formData.token, 
          newPassword: formData.newPassword 
        });
        setStatusMessage({ type: 'success', text: 'Şifreniz güncellendi! Giriş yapabilirsiniz.' });
        setTimeout(() => { setMode('login'); clearStatus(); }, 2500);
      }
    } catch (error) {
      setStatusMessage({ 
        type: 'error', 
        text: error.response?.data || "İşlem başarısız. Bilgilerinizi kontrol edin." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.authCard}>
        <div style={styles.iconBox}>
          {mode === 'login' && <LogIn size={30} color="#3498db" />}
          {mode === 'register' && <UserPlus size={30} color="#3498db" />}
          {(mode === 'forgot' || mode === 'reset') && <KeyRound size={30} color="#3498db" />}
        </div>

        <h2 style={styles.title}>
          {mode === 'login' && 'Tekrar Hoş Geldiniz'}
          {mode === 'register' && 'Hesap Oluşturun'}
          {mode === 'forgot' && 'Şifremi Unuttum'}
          {mode === 'reset' && 'Yeni Şifre Belirle'}
        </h2>

        {statusMessage.text && (
          <div style={{
            ...styles.statusBox,
            backgroundColor: statusMessage.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: statusMessage.type === 'error' ? '#dc2626' : '#16a34a',
          }}>
            {statusMessage.text}
          </div>
        )}
        
        <form onSubmit={handleAction} style={styles.form}>
          {mode === 'register' && (
            <div style={styles.inputGroup}>
              <User size={18} style={styles.inputIcon} />
              <input type="text" placeholder="Kullanıcı Adı" style={styles.input} required 
                onChange={(e) => setFormData({...formData, username: e.target.value})} />
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'forgot' || mode === 'reset') && (
             <div style={styles.inputGroup}>
                <Mail size={18} style={styles.inputIcon} />
                <input type="email" placeholder="E-posta Adresi" style={styles.input} required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})} />
             </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div style={styles.inputGroup}>
              <Lock size={18} style={styles.inputIcon} />
              <input type="password" placeholder="Şifre" style={styles.input} required 
                onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          )}

          {mode === 'reset' && (
            <>
              <div style={styles.inputGroup}>
                <KeyRound size={18} style={styles.inputIcon} />
                <input type="text" placeholder="6 Haneli Kod" style={styles.input} required 
                  onChange={(e) => setFormData({...formData, token: e.target.value})} />
              </div>
              <div style={styles.inputGroup}>
                <Lock size={18} style={styles.inputIcon} />
                <input type="password" placeholder="Yeni Şifre" style={styles.input} required 
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})} />
              </div>
            </>
          )}

          {mode === 'login' && (
            <div style={styles.forgotPass} onClick={() => { setMode('forgot'); clearStatus(); }}>
              Şifremi Unuttum
            </div>
          )}

          <button type="submit" style={styles.mainBtn} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              mode === 'login' ? 'Giriş Yap' : 
              mode === 'register' ? 'Kayıt Ol' : 
              mode === 'forgot' ? 'Kod Gönder' : 'Şifreyi Güncelle'
            )}
          </button>
        </form>

        <p style={styles.toggleText}>
          {mode === 'login' ? "Hesabınız yok mu?" : "Zaten üye misiniz?"}
          <span 
            onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                clearStatus();
            }} 
            style={styles.toggleLink}
          >
            {mode === 'login' ? " Hemen Başla" : " Giriş Yap"}
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f7ff' },
  authCard: { width: '100%', maxWidth: '400px', padding: '40px', borderRadius: '24px', backgroundColor: '#fff', boxShadow: '0 10px 30px rgba(52, 152, 219, 0.1)', textAlign: 'center' },
  iconBox: { width: '60px', height: '60px', backgroundColor: '#eef7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1a1a1a' },
  statusBox: { padding: '12px', borderRadius: '12px', fontSize: '14px', marginBottom: '20px', fontWeight: '500' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '15px', color: '#95a5a6' },
  input: { width: '100%', padding: '12px 15px 12px 45px', borderRadius: '12px', border: '1px solid #eee', outline: 'none', fontSize: '15px' },
  forgotPass: { textAlign: 'right', fontSize: '13px', color: '#3498db', cursor: 'pointer', marginTop: '-5px', fontWeight: '500' },
  mainBtn: { backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  toggleText: { marginTop: '20px', fontSize: '14px', color: '#666' },
  toggleLink: { color: '#3498db', fontWeight: 'bold', cursor: 'pointer' }
};

export default Auth;