import React, { useEffect, useState } from 'react';
import { User, Mail, Calendar, Shield, LogOut, Lock, Trash2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  // Kullanıcı Bilgileri State'i
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    joinDate: '',
    totalMinutes: 0,
    averageScore: 0
  });

  // Şifre Değiştirme State'i
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfileData = async () => {
      if(!userId) return;
      try {
        // 1. Kullanıcı Kimlik Bilgileri
        const userRes = await api.get(`/Users/${userId}`);
        
        // 2. İstatistik Bilgileri
        const statsRes = await api.get(`/Practice/history/${userId}`);

        setProfile({
            username: userRes.data.username,
            email: userRes.data.email,
            joinDate: userRes.data.createdAt,
            // Backend'den artık haftalık veriler bu isimlerle geliyor:
            totalMinutes: statsRes.data.weeklyMinutes, 
            averageScore: statsRes.data.weeklyScore
        });

      } catch (error) {
        console.error("Profil yüklenirken hata:", error);
      }
    };
    fetchProfileData();
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
        await api.put(`/Users/change-password/${userId}`, {
            oldPassword: passwords.oldPassword,
            newPassword: passwords.newPassword
        });
        setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi!' });
        setPasswords({ oldPassword: '', newPassword: '' });
        setTimeout(() => setShowPasswordForm(false), 2000);
    } catch (error) {
        setMessage({ type: 'error', text: error.response?.data || 'Bir hata oluştu.' });
    }
  };

  const handleDeleteAccount = async () => {
    if(window.confirm("Hesabını kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz!")) {
        try {
            await api.delete(`/Users/delete-account/${userId}`);
            alert("Hesabınız silindi.");
            localStorage.clear();
            navigate('/');
        } catch (error) {
            alert("Hesap silinemedi.");
        }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.pageWrapper}>
        
        {/* MERKEZİ KART YAPISI */}
        <div style={styles.mainCard}>
            
            {/* 1. ÜST KISIM: AVATAR VE İSİM */}
            <div style={styles.headerSection}>
                <div style={styles.avatarCircle}>
                    {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
                </div>
                <h1 style={styles.name}>{profile.username || "Kullanıcı"}</h1>
                <span style={styles.roleBadge}>Öğrenci</span>
                
                {/* İstatistik Özeti (Yatay) - GÜNCELLENDİ */}
                <div style={styles.miniStatsRow}>
                    <div style={styles.miniStat}>
                        {/* Etiket Değişti: Haftalık Başarı */}
                        <span style={styles.miniLabel}>Haftalık Başarı</span>
                        <span style={{...styles.miniValue, color:'#2ecc71'}}>%{profile.averageScore}</span>
                    </div>
                    <div style={styles.divider}></div>
                    <div style={styles.miniStat}>
                        {/* Etiket Değişti: Haftalık Süre */}
                        <span style={styles.miniLabel}>Haftalık Süre</span>
                        <span style={{...styles.miniValue, color:'#3498db'}}>{profile.totalMinutes} dk</span>
                    </div>
                </div>
            </div>

            {/* 2. BİLGİ LİSTESİ */}
            <div style={styles.infoSection}>
                <h3 style={styles.sectionTitle}>Hesap Bilgileri</h3>
                
                <div style={styles.infoItem}>
                    <Mail size={18} color="#888" />
                    <div style={styles.infoText}>
                        <span style={styles.infoLabel}>E-posta</span>
                        <span style={styles.infoValue}>{profile.email || "Yükleniyor..."}</span>
                    </div>
                </div>

                <div style={styles.infoItem}>
                    <Calendar size={18} color="#888" />
                    <div style={styles.infoText}>
                        <span style={styles.infoLabel}>Katılım Tarihi</span>
                        <span style={styles.infoValue}>
                            {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. AYARLAR & GÜVENLİK */}
            <div style={styles.settingsSection}>
                <h3 style={styles.sectionTitle}>Güvenlik</h3>

                {/* Şifre Değiştirme Alanı */}
                {!showPasswordForm ? (
                    <button onClick={() => setShowPasswordForm(true)} style={styles.actionBtn}>
                        <Lock size={18} /> Şifre Değiştir
                    </button>
                ) : (
                    <form onSubmit={handleChangePassword} style={styles.passwordForm}>
                        <div style={styles.formHeader}>
                            <span>Yeni Şifre Belirle</span>
                            <X size={18} style={{cursor:'pointer'}} onClick={() => setShowPasswordForm(false)} />
                        </div>
                        
                        <input 
                            type="password" 
                            placeholder="Eski Şifre" 
                            style={styles.input} 
                            value={passwords.oldPassword}
                            onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                            required
                        />
                        <input 
                            type="password" 
                            placeholder="Yeni Şifre" 
                            style={styles.input} 
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                            required
                        />
                        
                        {message.text && (
                            <div style={{
                                ...styles.messageBox, 
                                color: message.type === 'error' ? '#e74c3c' : '#2ecc71',
                                background: message.type === 'error' ? '#fdecea' : '#eafaf1'
                            }}>
                                {message.text}
                            </div>
                        )}

                        <button type="submit" style={styles.saveBtn}>
                            <Save size={16} /> Güncelle
                        </button>
                    </form>
                )}

                {/* Çıkış Yap */}
                <button onClick={handleLogout} style={styles.logoutBtn}>
                    <LogOut size={18} /> Çıkış Yap
                </button>

                {/* Hesap Silme (Tehlikeli Bölge) */}
                <div style={styles.dangerZone}>
                    <button onClick={handleDeleteAccount} style={styles.deleteBtn}>
                        <Trash2 size={16} /> Hesabımı Sil
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Inter, sans-serif', backgroundColor: '#f0f7ff', minHeight: '100vh', display:'flex', justifyContent:'center', padding:'40px 20px' },
  pageWrapper: { width: '100%', maxWidth: '500px' }, // Kartın genişliğini sınırladık

  mainCard: { backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', overflow:'hidden' },

  // Header
  headerSection: { backgroundColor: '#fff', padding: '40px 20px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom:'1px solid #f0f0f0' },
  avatarCircle: { width: '90px', height: '90px', backgroundColor: '#3498db', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '36px', fontWeight: 'bold', marginBottom: '15px', border:'4px solid #e0efff' },
  name: { fontSize: '24px', fontWeight: '800', color: '#2c3e50', margin: '0 0 5px 0' },
  roleBadge: { backgroundColor: '#e0efff', color: '#3498db', padding: '4px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: '700', marginBottom:'25px' },
  
  miniStatsRow: { display:'flex', alignItems:'center', gap:'20px', backgroundColor:'#f9f9f9', padding:'15px 30px', borderRadius:'16px' },
  miniStat: { display:'flex', flexDirection:'column', alignItems:'center' },
  miniLabel: { fontSize:'11px', color:'#888', fontWeight:'600', textTransform:'uppercase' },
  miniValue: { fontSize:'18px', fontWeight:'800' },
  divider: { width:'1px', height:'30px', backgroundColor:'#ddd' },

  // Bilgi Bölümü
  infoSection: { padding: '30px' },
  sectionTitle: { fontSize: '14px', fontWeight: '700', color: '#999', textTransform: 'uppercase', marginBottom: '15px', letterSpacing:'0.5px' },
  infoItem: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  infoText: { display:'flex', flexDirection:'column' },
  infoLabel: { fontSize:'12px', color:'#888' },
  infoValue: { fontSize:'15px', fontWeight:'500', color:'#333' },

  // Ayarlar Bölümü
  settingsSection: { padding: '0 30px 40px', display:'flex', flexDirection:'column', gap:'15px' },
  actionBtn: { width:'100%', padding:'12px', border:'1px solid #eee', backgroundColor:'#fff', borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', color:'#555', fontWeight:'600', transition:'0.2s' },
  logoutBtn: { width:'100%', padding:'12px', border:'1px solid #e74c3c', backgroundColor:'#fff', borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', color:'#e74c3c', fontWeight:'600', marginTop:'10px' },
  
  // Şifre Formu
  passwordForm: { backgroundColor:'#f8f9fa', padding:'20px', borderRadius:'16px', border:'1px solid #eee' },
  formHeader: { display:'flex', justifyContent:'space-between', marginBottom:'15px', fontSize:'14px', fontWeight:'600', color:'#555' },
  input: { width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd', marginBottom:'10px', fontSize:'14px' },
  saveBtn: { width:'100%', padding:'10px', backgroundColor:'#3498db', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' },
  messageBox: { padding:'10px', borderRadius:'8px', fontSize:'13px', marginBottom:'10px', textAlign:'center', fontWeight:'500' },

  // Danger Zone
  dangerZone: { marginTop:'20px', paddingTop:'20px', borderTop:'1px solid #eee', textAlign:'center' },
  deleteBtn: { background:'none', border:'none', color:'#ccc', fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', margin:'0 auto', transition:'0.2s' }
};

export default Profile;