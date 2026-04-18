import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Trash2, Plus, Video, X, PlayCircle, Loader2, CheckCircle, XCircle, Edit2, Cpu, AlertTriangle } from 'lucide-react';

const AdminLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Düzenleme Modu
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Harfler',
    videoFile: null,
    isActive: true,
    modelLabel: '' 
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Lessons');
      setLessons(res.data);
    } catch (err) {
      console.error("Dersler çekilemedi", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Bu dersi kalıcı olarak silmek istediğine emin misin?")) {
        try {
            await api.delete(`/Lessons/delete/${id}`);
            setLessons(lessons.filter(l => l.id !== id));
        } catch (err) {
            alert("Silme işlemi başarısız oldu.");
        }
    }
  };

  const handleEditClick = (lesson) => {
      setEditMode(true);
      setSelectedId(lesson.id);
      setFormData({
          title: lesson.title,
          category: lesson.category,
          isActive: lesson.isActive,
          modelLabel: lesson.modelLabel || '', 
          videoFile: null
      });
      setShowModal(true);
  };

  const handleAddClick = () => {
      setEditMode(false);
      setSelectedId(null);
      setFormData({ 
          title: '', 
          category: 'Harfler', 
          isActive: true, 
          modelLabel: '', 
          videoFile: null 
      });
      setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(!editMode && !formData.videoFile) return alert("Lütfen bir video dosyası seçin.");

    setSubmitting(true);
    
    const data = new FormData();
    data.append('Title', formData.title);
    data.append('Category', formData.category);
    data.append('IsActive', formData.isActive);
    
    // Boşsa boş gider (AI Pasif olur), doluysa dolu gider (AI Aktif olur)
    data.append('ModelLabel', formData.modelLabel ? formData.modelLabel.trim() : "");

    if(formData.videoFile) {
        data.append('VideoFile', formData.videoFile);
    }

    try {
        if (editMode) {
            await api.put(`/Lessons/update/${selectedId}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Ders güncellendi!");
        } else {
            await api.post('/Lessons/add', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Ders eklendi!");
        }
        
        setShowModal(false);
        fetchLessons(); 
    } catch (err) {
        console.error(err);
        alert("İşlem başarısız.");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
        <div style={styles.header}>
            <div>
                <h1 style={styles.title}>Ders Yönetimi</h1>
                <p style={styles.subtitle}>İçerikleri ve yapay zeka entegrasyonunu yönetin.</p>
            </div>
            <button onClick={handleAddClick} style={styles.addBtn}>
                <Plus size={20} /> Yeni Ders Ekle
            </button>
        </div>

        <div style={styles.listCard}>
            {loading ? (
                <div style={{padding:'40px', textAlign:'center', color:'#666'}}>Yükleniyor...</div>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, width:'50px'}}>ID</th>
                            <th style={styles.th}>Başlık</th>
                            <th style={styles.th}>Kategori</th>
                            <th style={styles.th}>AI Modu</th>
                            <th style={styles.th}>Yayın</th>
                            <th style={styles.th}>Video</th>
                            <th style={{...styles.th, textAlign:'right'}}>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessons.map(lesson => (
                            <tr key={lesson.id} style={styles.tr}>
                                <td style={styles.td}>#{lesson.id}</td>
                                <td style={{...styles.td, fontWeight:'600', color:'#2c3e50'}}>{lesson.title}</td>
                                <td style={styles.td}>
                                    <span style={lesson.category === 'Harfler' ? styles.badgeBlue : styles.badgeGreen}>
                                        {lesson.category}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    {lesson.modelLabel ? (
                                        <div style={styles.aiBadgeActive}>
                                            <Cpu size={14}/> <span>Model: <b>{lesson.modelLabel}</b></span>
                                        </div>
                                    ) : (
                                        <div style={styles.aiBadgePassive}>
                                            <span>AI Yok</span>
                                        </div>
                                    )}
                                </td>
                                <td style={styles.td}>
                                    {lesson.isActive ? (
                                        <span style={{...styles.statusBadge, color: '#2ecc71', backgroundColor: '#eafaf1'}}>
                                            <CheckCircle size={14} /> Yayında
                                        </span>
                                    ) : (
                                        <span style={{...styles.statusBadge, color: '#e74c3c', backgroundColor: '#fee2e2'}}>
                                            <XCircle size={14} /> Gizli
                                        </span>
                                    )}
                                </td>
                                <td style={styles.td}>
                                    {lesson.videoUrl ? (
                                        <a href={`http://localhost:5255${lesson.videoUrl}`} target="_blank" rel="noreferrer" style={styles.videoLink}>
                                            <PlayCircle size={16} /> İzle
                                        </a>
                                    ) : (
                                        <span style={{color:'#ccc', fontSize:'12px'}}>Yok</span>
                                    )}
                                </td>
                                <td style={{...styles.td, textAlign:'right'}}>
                                    <div style={{display:'flex', justifyContent:'flex-end', gap:'8px'}}>
                                        <button onClick={() => handleEditClick(lesson)} style={styles.editBtn} title="Düzenle">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(lesson.id)} style={styles.deleteBtn} title="Sil">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

        {/* MODAL */}
        {showModal && (
            <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                    <div style={styles.modalHeader}>
                        <h3 style={{margin:0, fontSize:'20px', fontWeight:'700', color:'#2c3e50'}}>
                            {editMode ? "Dersi Düzenle" : "Yeni Ders Ekle"}
                        </h3>
                        <button onClick={() => setShowModal(false)} style={styles.closeBtn}><X size={24}/></button>
                    </div>
                    
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {/* 1. SATIR: Başlık ve Kategori */}
                        <div style={styles.row}>
                            <div style={{...styles.formGroup, flex:1}}>
                                <label style={styles.label}>Ders Başlığı</label>
                                <input 
                                    type="text" 
                                    style={styles.input}
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                    placeholder="Örn: A Harfi"
                                />
                            </div>
                            <div style={{...styles.formGroup, width:'180px'}}>
                                <label style={styles.label}>Kategori</label>
                                <select 
                                    style={styles.select}
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="Harfler">Harfler</option>
                                    <option value="Kelimeler">Kelimeler</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.divider}></div>

                        {/* 2. SATIR: YAPAY ZEKA AYARLARI (SADECE INPUT) */}
                        <div style={styles.aiSection}>
                             <label style={styles.label}>
                                Yapay Zeka Etiketi (Opsiyonel)
                             </label>
                             <input 
                                type="text" 
                                style={styles.input}
                                value={formData.modelLabel}
                                onChange={(e) => setFormData({...formData, modelLabel: e.target.value})}
                                placeholder="Örn: A (Boş bırakırsanız sadece video modu açılır)"
                            />
                            
                            {/* UYARI KUTUSU */}
                            <div style={styles.warningBox}>
                                <AlertTriangle size={16} color="#e67e22" style={{minWidth:'16px'}}/>
                                <p style={styles.warningText}>
                                    <b>Dikkat:</b> Buraya gireceğiniz isim, projenizdeki <code>labels.json</code> dosyasıyla <b>BİREBİR</b> aynı olmalıdır. Eğitilmemiş bir model ismini buraya yazarsanız sistem çalışmaz. Sadece video izletmek istiyorsanız boş bırakın.
                                </p>
                            </div>
                        </div>

                        <div style={styles.divider}></div>

                        {/* 3. SATIR: YAYIN DURUMU */}
                        <div style={{...styles.formGroup, flexDirection:'row', alignItems:'center', gap:'10px'}}>
                            <input 
                                type="checkbox"
                                id="activeCheck"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                style={{width:'20px', height:'20px', cursor:'pointer'}}
                            />
                            <label htmlFor="activeCheck" style={{...styles.label, cursor:'pointer', margin:0, fontSize:'14px'}}>
                                Dersi Kullanıcılara Göster (Aktif)
                            </label>
                        </div>

                        {/* 4. SATIR: VİDEO */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Video Dosyası (MP4)</label>
                            <div style={styles.fileInputWrapper}>
                                <Video size={24} color="#3498db" />
                                <div style={{textAlign:'center'}}>
                                    <label htmlFor="videoUpload" style={styles.uploadLabel}>
                                        {formData.videoFile ? formData.videoFile.name : (editMode ? "Değiştirmek için video seçin" : "Video Seçin")}
                                    </label>
                                    <input 
                                        id="videoUpload"
                                        type="file" 
                                        accept="video/mp4" 
                                        onChange={(e) => setFormData({...formData, videoFile: e.target.files[0]})}
                                        style={{display:'none'}}
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} style={styles.submitBtn}>
                            {submitting ? <><Loader2 className="animate-spin" size={18}/> İşleniyor...</> : (editMode ? "Değişiklikleri Kaydet" : "Dersi Oluştur")}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

const styles = {
  container: { padding: '40px', maxWidth:'1200px', margin:'0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 5px 0' },
  subtitle: { color: '#666', margin: 0 },
  addBtn: { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)', transition:'0.2s' },
  listCard: { backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden', border:'1px solid #f0f0f0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '15px 20px', fontSize: '13px', color: '#888', fontWeight: '700', textTransform:'uppercase', borderBottom:'1px solid #f0f0f0', backgroundColor:'#fafafa' },
  tr: { borderBottom: '1px solid #f7f9fc' },
  td: { padding: '15px 20px', verticalAlign:'middle', fontSize:'14px' },
  
  badgeBlue: { backgroundColor: '#e0efff', color: '#3498db', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  badgeGreen: { backgroundColor: '#eafaf1', color: '#2ecc71', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  
  aiBadgeActive: { display:'inline-flex', alignItems:'center', gap:'6px', backgroundColor:'#f3e5f5', color:'#9b59b6', padding:'6px 12px', borderRadius:'8px', fontSize:'12px', border:'1px solid #e1bee7' },
  aiBadgePassive: { display:'inline-flex', alignItems:'center', gap:'6px', backgroundColor:'#f5f5f5', color:'#999', padding:'6px 12px', borderRadius:'8px', fontSize:'12px', border:'1px solid #eee' },

  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
  videoLink: { display:'inline-flex', alignItems:'center', gap:'5px', color: '#3498db', textDecoration: 'none', fontWeight: '600', fontSize:'13px', backgroundColor:'#f5f7fa', padding:'6px 12px', borderRadius:'8px' },
  deleteBtn: { backgroundColor: '#fee2e2', color: '#e74c3c', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition:'0.2s' },
  editBtn: { backgroundColor: '#e0efff', color: '#3498db', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition:'0.2s' },
  
  // Modal (Genişletildi)
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter:'blur(4px)' },
  modalContent: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', width: '600px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight:'95vh', overflowY:'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color:'#888', padding:'5px' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  row: { display:'flex', gap:'20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize:'14px', fontWeight:'700', color:'#2c3e50' },
  input: { padding:'14px', borderRadius:'10px', border:'1px solid #ddd', fontSize:'15px', outline:'none', transition:'0.2s' },
  select: { padding:'14px', borderRadius:'10px', border:'1px solid #ddd', fontSize:'15px', outline:'none', backgroundColor:'#fff', cursor:'pointer' },
  
  divider: { height:'1px', backgroundColor:'#eee', margin:'10px 0' },

  // AI Section (Sadeleştirildi ve Uyarı Eklendi)
  aiSection: { backgroundColor:'#fffbf0', padding:'20px', borderRadius:'12px', border:'1px solid #fae5b0' },
  warningBox: { display:'flex', gap:'10px', marginTop:'10px', fontSize:'13px', color:'#d35400', lineHeight:'1.4' },
  warningText: { margin:0 },

  fileInputWrapper: { border: '2px dashed #3498db', padding: '25px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign:'center', backgroundColor:'#f0f7ff', cursor:'pointer', transition:'0.2s' },
  uploadLabel: { fontSize:'14px', color:'#3498db', fontWeight:'600', cursor:'pointer', textDecoration:'underline' },
  submitBtn: { backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginTop:'10px', boxShadow:'0 4px 15px rgba(46, 204, 113, 0.3)' }
};

export default AdminLessons;