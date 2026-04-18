import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Activity, Clock, Trophy, CalendarDays, TrendingUp, History, 
  BarChart2, BookOpen, Timer, CheckCircle2 
} from 'lucide-react';

const Report = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weeklyRes = await api.get(`/Practice/weekly-stats/${userId}`);
        setWeeklyData(formatWeeklyData(weeklyRes.data));

        const historyRes = await api.get(`/Practice/history/${userId}`);
        setHistoryData(historyRes.data);

      } catch (error) {
        console.error("Veri hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const formatWeeklyData = (backendData) => {
    const daysOrder = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const template = daysOrder.map(day => ({ name: day, süre: 0, puan: 0 }));

    const dayMap = {
      'Monday': 'Pzt', 'Tuesday': 'Sal', 'Wednesday': 'Çar', 
      'Thursday': 'Per', 'Friday': 'Cum', 'Saturday': 'Cmt', 'Sunday': 'Paz'
    };

    backendData.forEach(item => {
      const trName = dayMap[item.day];
      const index = daysOrder.indexOf(trName);
      if (index !== -1) {
        template[index].süre = item.totalMinutes;
        template[index].puan = item.averageScore;
      }
    });

    return template;
  };

  if (loading) return <div style={styles.loading}>Rapor Hazırlanıyor...</div>;

  return (
    <div style={styles.container}>
      {/* NAVBAR KALDIRILDI - MainLayout'tan geliyor */}
      
      <div style={styles.pageWrapper}>
        
        {/* --- BAŞLIK ALANI --- */}
        <div style={styles.header}>
            <div style={styles.titleRow}>
                <div style={styles.mainIconBox}>
                    <TrendingUp size={32} color="#3498db" />
                </div>
                <div>
                    <h1 style={styles.title}>Gelişim Raporu</h1>
                    <p style={styles.subtitle}>Haftalık performansını ve ilerlemeni buradan takip et.</p>
                </div>
            </div>
        </div>

        {/* --- İSTATİSTİK KARTLARI (3 Adet - Durum Kaldırıldı) --- */}
        <div style={styles.statsGrid}>
            
            {/* Kart 1: Haftalık Süre */}
            <div style={styles.statCard}>
                <div style={{...styles.iconBox, background:'#e0efff', color:'#3498db'}}>
                    <Clock size={24} />
                </div>
                <div>
                    <p style={styles.statLabel}>Haftalık Süre</p>
                    <h3 style={styles.statValue}>{historyData?.weeklyMinutes || 0} dk</h3>
                </div>
            </div>

            {/* Kart 2: Haftalık Ortalama Puan */}
            <div style={styles.statCard}>
                <div style={{...styles.iconBox, background:'#fff3cd', color:'#f1c40f'}}>
                    <Trophy size={24} />
                </div>
                <div>
                    <p style={styles.statLabel}>Haftalık Puan</p>
                    <h3 style={styles.statValue}>%{historyData?.weeklyScore || 0}</h3>
                </div>
            </div>

            {/* Kart 3: Haftalık Pratik Sayısı */}
            <div style={styles.statCard}>
                <div style={{...styles.iconBox, background:'#f3e5f5', color:'#9b59b6'}}>
                    <Activity size={24} />
                </div>
                <div>
                    <p style={styles.statLabel}>Haftalık Pratik</p>
                    <h3 style={styles.statValue}>{historyData?.weeklySessions || 0}</h3>
                </div>
            </div>
        </div>

        <div style={styles.mainGrid}>
            
            {/* --- GRAFİK ALANI --- */}
            <div style={styles.chartCard}>
                <div style={styles.cardHeader}>
                    <div style={styles.cardTitleRow}>
                        <BarChart2 size={20} color="#3498db"/>
                        <h3>Haftalık Çalışma (Dakika)</h3>
                    </div>
                </div>
                <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData} margin={{top:20, right:30, left:0, bottom:0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{fontSize:12, fill:'#888'}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize:12, fill:'#888'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                cursor={{fill: '#f4f6f8'}}
                                contentStyle={{borderRadius:12, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}
                            />
                            <Bar dataKey="süre" radius={[6, 6, 0, 0]} barSize={40}>
                                {weeklyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.süre > 0 ? '#3498db' : '#e0e0e0'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- GEÇMİŞ TABLOSU --- */}
            <div style={styles.tableCard}>
                <div style={styles.cardHeader}>
                    <div style={styles.cardTitleRow}>
                        <History size={20} color="#e67e22"/>
                        <h3>Son Çalışmalar</h3>
                    </div>
                </div>
                
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>DERS</th>
                                <th style={styles.th}>TARİH</th>
                                <th style={styles.th}>PUAN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyData?.history?.map((item) => (
                                <tr key={item.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={styles.rowFlex}>
                                            <div style={styles.miniIconBox}>
                                                <BookOpen size={14} color="#555"/>
                                            </div>
                                            <div>
                                                <div style={styles.lessonName}>{item.lessonTitle}</div>
                                                <div style={styles.subTextFlex}>
                                                    <Timer size={10} /> {item.durationSeconds} sn
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.rowFlex}>
                                            <CalendarDays size={14} color="#888"/>
                                            <span style={styles.dateText}>
                                                {new Date(item.date).toLocaleDateString('tr-TR', {day:'numeric', month:'short'})}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.scoreBadge,
                                            backgroundColor: item.score >= 90 ? '#d4edda' : item.score >= 70 ? '#fff3cd' : '#f8d7da',
                                            color: item.score >= 90 ? '#155724' : item.score >= 70 ? '#856404' : '#721c24'
                                        }}>
                                            %{item.score}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!historyData?.history || historyData.history.length === 0) && (
                        <p style={styles.emptyText}>Henüz pratik geçmişi yok.</p>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Inter, sans-serif', backgroundColor: '#f0f7ff', minHeight: '100vh' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color:'#666', fontSize:'18px' },
  pageWrapper: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  
  header: { marginBottom: '30px' },
  titleRow: { display:'flex', alignItems:'center', gap:'15px' },
  mainIconBox: { width:'50px', height:'50px', backgroundColor:'#fff', borderRadius:'15px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 10px rgba(0,0,0,0.05)' },
  title: { fontSize: '28px', fontWeight: '800', color: '#1a1a1a', margin:0, lineHeight:'1.2' },
  subtitle: { color: '#666', fontSize: '15px', margin:0 },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '20px', border:'1px solid #fff' },
  iconBox: { width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: '13px', color: '#888', fontWeight: '600', marginBottom:'4px' },
  statValue: { fontSize: '24px', fontWeight: '800', color: '#2c3e50' },

  mainGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems:'start' },
  chartCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border:'1px solid #fff', height:'450px' },
  tableCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border:'1px solid #fff', minHeight:'450px', display:'flex', flexDirection:'column' },
  
  cardHeader: { marginBottom: '25px', borderBottom:'1px solid #f0f0f0', paddingBottom:'15px' },
  cardTitleRow: { display:'flex', alignItems:'center', gap:'10px', fontSize:'18px', fontWeight:'700', color:'#1a1a1a' },
  
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px', fontSize: '11px', color: '#999', fontWeight: '700', textTransform:'uppercase', letterSpacing:'0.5px' },
  tr: { borderBottom: '1px solid #f7f9fc' },
  td: { padding: '15px 10px', verticalAlign:'middle' },
  
  rowFlex: { display:'flex', alignItems:'center', gap:'10px' },
  miniIconBox: { width:'24px', height:'24px', backgroundColor:'#f8f9fa', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center' },
  
  lessonName: { fontWeight:'700', color:'#2c3e50', fontSize:'14px' },
  subTextFlex: { display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#888', marginTop:'2px' },
  dateText: { fontSize:'13px', fontWeight:'600', color:'#555' },
  
  scoreBadge: { padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', display:'inline-block' },
  emptyText: { textAlign:'center', color:'#999', padding:'40px', fontSize:'14px' },
  
  '@media (max-width: 768px)': { mainGrid: { gridTemplateColumns: '1fr' } }
};

export default Report;