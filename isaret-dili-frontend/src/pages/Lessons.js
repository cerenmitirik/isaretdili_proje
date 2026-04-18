import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';

const Lessons = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Harfler");

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await api.get('/Lessons'); 
        setLessons(response.data);
      } catch (error) {
        console.error("Dersler çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  const safeLessons = lessons || [];
  const filteredLessons = safeLessons.filter(l => {
      const cat = l.category || l.Category;
      return cat === activeTab;
  });

  if (loading) return <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}>Yükleniyor...</div>;

  return (
    <div style={styles.container}>
      {/* NAVBAR KALDIRILDI - MainLayout'tan geliyor */}

      <main style={styles.mainContent}>
        <div style={styles.header}>
            <h1 style={styles.title}>Dersler</h1>
            <p style={styles.subtitle}>İşaret dili öğrenme yolculuğuna kaldığın yerden devam et.</p>
        </div>

        <div style={styles.tabContainer}>
            <button style={activeTab === "Harfler" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("Harfler")}>Harfler</button>
            <button style={activeTab === "Kelimeler" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("Kelimeler")}>Kelimeler</button>
        </div>

        <div style={styles.grid}>
            {filteredLessons.length > 0 ? (
                filteredLessons.map((lesson) => {
                    const title = lesson.title || lesson.Title || "İsimsiz";
                    const firstChar = title.charAt(0);
                    return (
                        <div key={lesson.id || lesson.Id} style={styles.card}>
                            <div style={styles.cardLeft}>
                                <div style={styles.iconBox}>
                                    <span style={styles.letterIcon}>{firstChar}</span>
                                </div>
                                <div>
                                    <h3 style={styles.cardTitle}>{title}</h3>
                                    <p style={styles.cardSub}>Başlangıç Seviyesi</p>
                                </div>
                            </div>
                            <button onClick={() => navigate(`/ders/${lesson.id || lesson.Id}`)} style={styles.startBtn}>
                                <PlayCircle size={18} /> Başla
                            </button>
                        </div>
                    );
                })
            ) : (
                <div style={{textAlign:'center', color:'#888', padding:'40px'}}>Bu kategoride henüz ders yok.</div>
            )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Inter, sans-serif', backgroundColor: '#f0f7ff', minHeight: '100vh' },
  mainContent: { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' },
  header: { marginBottom: '30px' },
  title: { fontSize: '32px', fontWeight: '800', color: '#1a1a1a', marginBottom: '5px' },
  subtitle: { color: '#666', fontSize: '16px' },
  tabContainer: { display: 'flex', gap: '10px', marginBottom: '30px', backgroundColor: '#fff', padding: '5px', borderRadius: '12px', width: 'fit-content', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
  tab: { padding: '10px 30px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '8px', fontSize: '15px', fontWeight: '600', color: '#666', transition: '0.2s' },
  activeTab: { padding: '10px 30px', border: 'none', backgroundColor: '#3498db', cursor: 'pointer', borderRadius: '8px', fontSize: '15px', fontWeight: '600', color: '#fff', boxShadow: '0 2px 5px rgba(52, 152, 219, 0.3)' },
  grid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'transform 0.2s' },
  cardLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
  iconBox: { width: '50px', height: '50px', backgroundColor: '#e0efff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3498db', fontWeight: 'bold', fontSize: '24px' },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  cardSub: { fontSize: '13px', color: '#888', marginTop: '2px' },
  startBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', color: '#3498db', border: '1px solid #3498db', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: '0.2s' },
  letterIcon: { textTransform: 'uppercase' }
};

export default Lessons;