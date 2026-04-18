import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Video, Camera, Hand } from 'lucide-react';

// Resimler (Senin dosya yoluna göre aynı kalmalı)
import homeGenelImg from '../assets/homegenel.png'; 
import mobilUygulamaImg from '../assets/mobil_tanitim.png'; 

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      
      {/* --- NAVBAR (Landing Page Özel) --- */}
      {/* Sticky özelliği eklendi ve Logo boyutları Navbar.js ile eşitlendi */}
      <nav style={styles.navbar}>
        <div style={styles.logoRow} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Hand size={32} color="#3498db" fill="#3498db" /> 
          <span style={styles.logoText}>İşaretle</span>
        </div>
        <button onClick={() => navigate('/login')} style={styles.navLoginBtn}>Giriş Yap</button>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            İşaret Dilinde Uzmanlaşın: <br />
            <span style={{ color: '#3498db' }}>Kapsamlı Öğrenme Yolculuğunuz Başlasın</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Etkileşimli derslerle işaret dilini kolayca öğrenin.
          </p>
          <div style={styles.heroButtons}>
            <button 
              onClick={() => navigate('/login', { state: { mode: 'register' } })} 
              style={styles.btnPrimary}
            >
              Hemen Başla
            </button>
          </div>
        </div>
        <div style={styles.heroImageArea}>
          <img src={homeGenelImg} alt="İşaret Dili Eğitimi" style={styles.mainImg} />
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Öğrenme Yolculuğunuzun Temel Taşları</h2>
        <p style={styles.sectionSubtitle}>Hedeflerinize ulaşmanız için tasarlanmış ana özellikler ve öğrenme aşamaları.</p>
        
        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <div style={styles.cardIcon}><BarChart color="#3498db" /></div>
            <h4 style={styles.cardTitle}>Kişisel Takip</h4>
            <p style={styles.cardText}>Performans analizleri ve ilerleme raporları ile öğrenme sürecinizi kişiselleştirin.</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardIcon}><Video color="#3498db" /></div>
            <h4 style={styles.cardTitle}>Videolu Dersler</h4>
            <p style={styles.cardText}>Hazırlanan dersler ile sistemli ilerleyin.</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardIcon}><Camera color="#3498db" /></div>
            <h4 style={styles.cardTitle}>Pratik Modu</h4>
            <p style={styles.cardText}>Yapay zeka geri bildirimleriyle hareketlerinizi doğrulayın ve kendinizi geliştirin.</p>
          </div>
        </div>
      </section>

      {/* --- MOBİL UYGULAMA TANITIM --- */}
      <section style={styles.mobileSection}>
        <div style={styles.mobileContent}>
            <span style={styles.mobileTag}>MOBİL UYGULAMA</span>
            <h2 style={styles.mobileTitle}>Her Yerde Öğrenin</h2>
            <p style={styles.mobileText}>
                Otobüste, evde veya molada. İşaretle mobil uygulaması ile derslerinize kaldığınız yerden devam edin.
            </p>
        </div>
        <div style={styles.mobileImageArea}>
            <img src={mobilUygulamaImg} alt="Mobil Uygulama" style={styles.mobileImg} />
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          <span onClick={() => navigate('/hakkimizda')} style={styles.footerLinkItem}>Hakkımızda</span>
        </div>
        <p style={styles.copyText}>© 2024 İşaretle. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Inter, sans-serif', backgroundColor: '#fff' },
  
  // NAVBAR GÜNCELLENDİ (Diğer sayfalarla aynı yükseklik ve sticky özelliği)
  navbar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '0 10%', // Yüksekliği height ile kontrol ettiğimiz için padding'i azalttık
    height: '80px',   // Navbar.js ile aynı yükseklik
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Hafif transparan
    backdropFilter: 'blur(10px)', // Arkası bulanık görünsün
    position: 'sticky', 
    top: 0, 
    zIndex: 1000,
    borderBottom: '1px solid #eee'
  },
  
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px', cursor:'pointer' },
  // Logo Text Navbar.js ile eşitlendi (26px, 800 weight)
  logoText: { fontWeight: '800', fontSize: '26px', color: '#1a1a1a', letterSpacing: '-0.5px' },
  
  navLoginBtn: { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '50px', cursor: 'pointer', fontWeight: '700', fontSize:'14px', transition:'0.3s' },
  
  hero: { display: 'flex', padding: '60px 10% 100px 10%', alignItems: 'center', gap: '40px', background: '#f0f7ff' },
  heroContent: { flex: 1.2 },
  heroTitle: { fontSize: '48px', fontWeight: '800', marginBottom: '20px', color: '#1a1a1a', lineHeight: '1.2', letterSpacing: '-1px' },
  heroSubtitle: { fontSize: '18px', color: '#666', marginBottom: '30px', lineHeight:'1.6' },
  btnPrimary: { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '50px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', boxShadow:'0 10px 20px rgba(52, 152, 219, 0.3)', transition:'transform 0.2s' },
  
  heroImageArea: { flex: 1, textAlign: 'right', display: 'flex', justifyContent: 'flex-end' },
  mainImg: { width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
  
  features: { padding: '100px 10%', textAlign: 'center' },
  sectionTitle: { fontSize: '36px', marginBottom: '15px', fontWeight: '800', color:'#1a1a1a' },
  sectionSubtitle: { color: '#666', marginBottom: '60px', fontSize: '18px', maxWidth:'600px', margin:'0 auto 60px auto' },
  cardsGrid: { display: 'flex', gap: '30px' },
  card: { flex: 1, padding: '40px 30px', border: '1px solid #f0f0f0', borderRadius: '24px', textAlign: 'left', backgroundColor: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', transition:'transform 0.3s' },
  cardIcon: { width: '60px', height: '60px', backgroundColor: '#e0efff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' },
  cardTitle: { marginBottom: '15px', fontSize: '22px', fontWeight: '700', color:'#1a1a1a' },
  cardText: { fontSize: '16px', color: '#666', lineHeight: '1.6' },
  
  mobileSection: { display: 'flex', padding: '100px 10%', alignItems: 'center', backgroundColor: '#f0f7ff', gap: '60px' },
  mobileContent: { flex: 1 },
  mobileTag: { color: '#3498db', fontWeight: '800', fontSize: '14px', letterSpacing: '1px', textTransform:'uppercase', display:'block', marginBottom:'10px' },
  mobileTitle: { fontSize: '42px', fontWeight: '800', margin: '0 0 20px 0', color: '#1a1a1a', lineHeight:'1.1' },
  mobileText: { fontSize: '18px', color: '#666', lineHeight: '1.7' },
  mobileImageArea: { flex: 1, display: 'flex', justifyContent: 'flex-end' }, 
  mobileImg: { width: '100%', maxWidth: '400px', borderRadius: '30px', boxShadow:'0 20px 50px rgba(0,0,0,0.15)' },
  
  footer: { padding: '60px 10%', textAlign: 'center', borderTop: '1px solid #eee', backgroundColor:'#fff' },
  footerLinks: { marginBottom: '20px' },
  footerLinkItem: { cursor: 'pointer', color: '#555', fontSize: '16px', fontWeight: '600', margin:'0 15px', transition:'color 0.2s' },
  copyText: { fontSize: '14px', color: '#aaa', marginTop: '15px' }
};

export default Home;