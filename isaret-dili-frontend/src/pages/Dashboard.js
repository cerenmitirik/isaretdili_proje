import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, PlayCircle, ArrowRight, Activity, Zap, BookOpen, Library, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // LocalStorage'dan ID'yi alıyoruz
  const userId = localStorage.getItem('userId');
  // İsim backend'den gelene kadar geçici olarak localStorage'dan alınıyor
  const localName = localStorage.getItem('userName') || "Öğrenci";

  const quotes = [
    "Bugün harika işler başaracaksın.",
    "Her işaret yeni bir dünya.",
    "Pratik yapmak mükemmelleştirir."
  ];
  
  const dailyQuote = quotes[Math.floor(Math.random() * quotes.length)];

  useEffect(() => {
    if (!userId) {
        navigate('/login'); 
        return;
    }

    const fetchData = async () => {
      try {
        const result = await api.get(`/Dashboard/summary/${userId}`);
        setData(result.data);
      } catch (error) {
        console.error("Dashboard veri hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, navigate]);

  if (loading) return <div style={styles.loadingScreen}>Yükleniyor...</div>;

  const displayName = data?.userName || localName;

  return (
    <div style={styles.container}>
      {/* NAVBAR KALDIRILDI - MainLayout'tan geliyor */}

      <div style={styles.pageWrapper}>
        
        {/* KARŞILAMA */}
        <div style={styles.headerSection}>
            <h1 style={styles.greeting}>Merhaba, {displayName}! 👋</h1>
            <p style={styles.subGreeting}>{dailyQuote}</p>
        </div>

        <div style={styles.contentGrid}>
            
            {/* === SOL SÜTUN === */}
            <div style={styles.leftColumn}>
                
                {/* İstatistikler (GÜNCELLENDİ) */}
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <div style={styles.statIconBlue}><Clock size={24} color="#3498db" /></div>
                        <div>
                            {/* Etiket Günlük Olarak Değişti */}
                            <p style={styles.statLabel}>Günlük Süre</p>
                            {/* Backend'den gelen DailyMinutes */}
                            <h2 style={styles.statValue}>{data?.dailyMinutes || 0} dk</h2>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIconPurple}><Star size={24} color="#9b59b6" /></div>
                        <div>
                            {/* Etiket Günlük Olarak Değişti */}
                            <p style={styles.statLabel}>Günlük Puan</p>
                            {/* Backend'den gelen DailyScore */}
                            <h2 style={styles.statValue}>%{data?.dailyScore || 0}</h2>
                        </div>
                    </div>
                </div>

                {/* GÜNÜN DERSİ */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.sectionTitle}>Günün Dersi</h2>
                        <span style={styles.dateBadge}>Bugün</span>
                    </div>
                    
                    {data?.dailyLesson ? (
                        <div style={styles.videoContainer}>
                            <div style={styles.videoWrapper}>
                                <video controls style={styles.videoPlayer}>
                                    <source src={`http://localhost:5255${data.dailyLesson.videoUrl}`} type="video/mp4" />
                                </video>
                            </div>
                            <div style={styles.videoFooter}>
                                <div>
                                    <h3 style={styles.lessonTitle}>{data.dailyLesson.title}</h3>
                                    <p style={styles.lessonCat}>{data.dailyLesson.category}</p>
                                </div>
                                {/* SingleMode: true gönderiyoruz */}
                                <button 
                                    onClick={() => navigate(`/ders/${data.dailyLesson.id}`, { state: { singleMode: true } })} 
                                    style={styles.watchBtn}
                                >
                                    <PlayCircle size={20} /> Pratiğe Başla
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p style={{padding:'40px', textAlign:'center', color:'#888'}}>Öneri bulunamadı.</p>
                    )}
                </div>
            </div>

            {/* === SAĞ SÜTUN === */}
            <div style={styles.rightColumn}>

                {/* Hızlı Erişim */}
                <div style={styles.card}>
                    <div style={styles.cardHeaderSimple}>
                        <BookOpen size={22} color="#3498db" />
                        <h3 style={styles.cardTitle}>Hızlı Erişim</h3>
                    </div>
                    <div style={styles.quickAccessCol}>
                        <button style={styles.accessBtnPrimary} onClick={() => navigate('/dersler')}>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <Library size={18} /> Tüm Dersler
                            </div>
                            <ArrowRight size={18} />
                        </button>

                        <button style={styles.accessBtnSecondary} onClick={() => navigate('/rapor')}>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <TrendingUp size={18} /> Gelişim Raporu
                            </div>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* YENİ EKLENEN */}
                {data?.lastAddedLesson && (
                    <div style={styles.darkCard}>
                        <div style={styles.newBadge}>
                            <Zap size={14} fill="#fff" /> YENİ EKLENDİ
                        </div>
                        
                        {data.lastAddedLesson.videoUrl && (
                            <div style={styles.miniVideoWrapper}>
                                <video controls style={styles.videoPlayer}>
                                    <source src={`http://localhost:5255${data.lastAddedLesson.videoUrl}`} type="video/mp4" />
                                </video>
                            </div>
                        )}

                        <div style={styles.newContent}>
                            <div>
                                <h3 style={styles.newTitle}>{data.lastAddedLesson.title}</h3>
                                <p style={styles.newCat}>{data.lastAddedLesson.category}</p>
                            </div>
                            <button 
                                onClick={() => navigate(`/ders/${data.lastAddedLesson.id}`, { state: { singleMode: true } })} 
                                style={styles.whiteBtn}
                            >
                                Keşfet
                            </button>
                        </div>
                    </div>
                )}

                {/* Son Çalışılan */}
                <div style={styles.card}>
                    <div style={styles.cardHeaderSimple}>
                        <Activity size={22} color="#e67e22" />
                        <h3 style={styles.cardTitle}>Son Çalışılan</h3>
                    </div>
                    {data?.lastActivity ? (
                        <div style={styles.activityContent}>
                            <div style={styles.activityIcon}>✓</div>
                            <div>
                                <h4 style={styles.activityName}>{data.lastActivity.title}</h4>
                                <p style={styles.activityDate}>
                                    {new Date(data.lastActivity.date).toLocaleDateString('tr-TR')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.emptyState}><p>Henüz pratik yok.</p></div>
                    )}
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Inter, sans-serif', backgroundColor: '#f0f7ff', minHeight: '100vh', paddingBottom: '40px' },
  loadingScreen: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#555' },
  pageWrapper: { maxWidth: '1200px', width: '95%', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '30px' },
  headerSection: { marginBottom: '10px' },
  greeting: { fontSize: '32px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' },
  subGreeting: { fontSize: '16px', color: '#666', fontStyle: 'italic' },
  contentGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' },
  leftColumn: { display: 'flex', flexDirection: 'column', gap: '30px' },
  statsRow: { display: 'flex', gap: '20px' },
  statCard: { flex: 1, backgroundColor: '#fff', padding: '20px 25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #fff' },
  statIconBlue: { width: '45px', height: '45px', backgroundColor: '#e0efff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statIconPurple: { width: '45px', height: '45px', backgroundColor: '#f3e5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: '13px', color: '#888', fontWeight: '600', marginBottom: '2px' },
  statValue: { fontSize: '24px', fontWeight: '800', color: '#1a1a1a' },
  card: { backgroundColor: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #fff' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  cardHeaderSimple: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
  sectionTitle: { fontSize: '20px', fontWeight: '800', color: '#1a1a1a', margin: 0 },
  cardTitle: { fontSize: '18px', fontWeight: '800', color: '#1a1a1a', margin: 0 },
  dateBadge: { backgroundColor: '#e0efff', color: '#3498db', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  videoContainer: { display: 'flex', flexDirection: 'column', gap: '0' },
  videoWrapper: { width: '100%', height: '400px', backgroundColor: '#000', borderRadius: '16px 16px 0 0', overflow: 'hidden' },
  videoPlayer: { width: '100%', height: '100%', objectFit: 'contain' },
  videoFooter: { padding: '20px', backgroundColor: '#fdfdfd', borderRadius: '0 0 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', borderTop: 'none' },
  lessonTitle: { fontSize: '20px', fontWeight: '700', color: '#1a1a1a' },
  lessonCat: { fontSize: '14px', color: '#666', marginTop: '5px' },
  watchBtn: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
  rightColumn: { display: 'flex', flexDirection: 'column', gap: '25px' },
  quickAccessCol: { display: 'flex', flexDirection: 'column', gap: '15px' },
  accessBtnPrimary: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '15px 20px', borderRadius: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)' },
  accessBtnSecondary: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', color: '#333', border: '2px solid #eee', padding: '13px 18px', borderRadius: '16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  darkCard: { background: 'linear-gradient(135deg, #2c3e50, #34495e)', padding: '25px', borderRadius: '24px', color: '#fff', boxShadow: '0 10px 30px rgba(44, 62, 80, 0.25)', display: 'flex', flexDirection: 'column', gap: '15px' },
  newBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '5px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px', width: 'fit-content' },
  miniVideoWrapper: { width: '100%', height: '180px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' },
  newContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' },
  newTitle: { fontSize: '18px', fontWeight: '800', marginBottom: '2px' },
  newCat: { fontSize: '13px', opacity: 0.8 },
  whiteBtn: { backgroundColor: '#fff', color: '#2c3e50', border: 'none', padding: '8px 20px', borderRadius: '30px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  activityContent: { display: 'flex', alignItems: 'center', gap: '15px', padding: '5px' },
  activityIcon: { width: '45px', height: '45px', backgroundColor: '#eafaf1', color: '#2ecc71', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' },
  activityName: { fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' },
  activityDate: { fontSize: '13px', color: '#888' },
  emptyState: { textAlign: 'center', color: '#999', padding: '15px' }
};

export default Dashboard;