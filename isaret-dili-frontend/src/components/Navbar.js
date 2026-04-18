import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hand, Search, LogOut, Menu } from 'lucide-react'; 
import api from '../services/api';

const Navbar = ({ userName, onToggleSidebar, showMenuButton }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    navigate('/'); // Ana sayfaya git
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const response = await api.get('/Lessons');
      const allLessons = response.data;
      const term = searchTerm.toLowerCase().trim();

      let targetLesson = allLessons.find(l => l.title.toLowerCase() === term);
      if (!targetLesson) {
        targetLesson = allLessons.find(l => l.title.toLowerCase().startsWith(term + " "));
        if (!targetLesson) {
            targetLesson = allLessons.find(l => l.title.toLowerCase().startsWith(term));
        }
      }

      if (targetLesson) {
        navigate(`/ders/${targetLesson.id}`, { state: { singleMode: true } });
      } else {
        navigate('/dersler');
      }
      setSearchTerm("");

    } catch (error) {
      console.error("Arama hatası:", error);
      navigate('/dersler');
    }
  };

  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <div style={styles.navbar}>
      <div style={styles.leftSection}>
        {showMenuButton && (
            <button onClick={onToggleSidebar} style={styles.menuBtn}>
                <Menu size={24} color="#555" />
            </button>
        )}

        <div style={styles.logoRow} onClick={() => navigate('/dashboard')}>
            <Hand size={32} color="#3498db" fill="#3498db" />
            <span style={styles.logoText}>İşaretle</span>
        </div>
      </div>

      <form onSubmit={handleSearch} style={styles.searchContainer}>
        <Search size={20} color="#555" />
        <input 
            type="text" 
            placeholder="Ders ara... (Örn: A, Anne)" 
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      <div style={styles.rightSection}>
        
        {/* 🔥 DÜZELTME BURADA: onClick EKLENDİ */}
        <button 
            onClick={() => navigate('/profil')} 
            style={styles.avatarBtn} 
            title="Profilim"
        >
            <span style={styles.avatarText}>{initial}</span>
        </button>

        <button onClick={handleLogout} style={styles.logoutBtn} title="Çıkış Yap">
           <LogOut size={24} color="#e74c3c" />
        </button>
      </div>
    </div>
  );
};

const styles = {
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', backgroundColor: '#fff', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 1000, height: '80px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' },
  
  leftSection: { display: 'flex', alignItems: 'center', gap: '20px' },
  menuBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' },
  
  logoRow: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  logoText: { fontWeight: '800', fontSize: '26px', color: '#1a1a1a', fontFamily: 'Inter, sans-serif' },
  
  searchContainer: { display: 'flex', alignItems: 'center', backgroundColor: '#f5f7fa', padding: '12px 20px', borderRadius: '50px', width: '35%', gap: '15px', border: '1px solid #eee' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px', color: '#333' },
  
  rightSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  avatarBtn: { width: '45px', height: '45px', backgroundColor: '#3498db', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #e0efff', cursor: 'pointer' },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: '18px' },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'background 0.2s' }
};

export default Navbar;