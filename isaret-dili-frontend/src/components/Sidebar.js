import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, TrendingUp, LogOut, PlusCircle } from 'lucide-react'; // PlusCircle Eklendi

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔥 GÜNCELLEME: Rol Kontrolü
  const userRole = localStorage.getItem('userRole');

  // Varsayılan Menü
  let menuItems = [
    { name: 'Ana Sayfa', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Dersler', path: '/dersler', icon: <BookOpen size={20} /> },
    { name: 'Gelişim Raporu', path: '/rapor', icon: <TrendingUp size={20} /> },
  ];

  // 🔥 ADMIN MENÜSÜ EKLEME
  if (userRole === 'Admin') {
    menuItems.push({ name: 'Ders Yönetimi', path: '/admin/dersler', icon: <PlusCircle size={20} /> });
  }

  return (
    <div style={{
        ...styles.sidebar,
        width: isOpen ? '250px' : '0px', 
        opacity: isOpen ? 1 : 0,
        padding: isOpen ? '20px 0' : '0' 
    }}>
      <div style={{...styles.menuList, display: isOpen ? 'flex' : 'none'}}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dersler' && location.pathname.includes('/ders/'));
          
          return (
            <div 
              key={item.path} 
              onClick={() => navigate(item.path)}
              style={{
                ...styles.menuItem,
                backgroundColor: isActive ? '#e0efff' : 'transparent',
                color: isActive ? '#3498db' : '#666',
                borderRight: isActive ? '3px solid #3498db' : '3px solid transparent'
              }}
            >
              {item.icon}
              <span style={{...styles.menuText, whiteSpace:'nowrap'}}>{item.name}</span>
            </div>
          );
        })}
      </div>

      <div style={{...styles.footer, display: isOpen ? 'block' : 'none'}}>
        <button onClick={() => { localStorage.clear(); navigate('/'); }} style={styles.logoutBtn}>
            <LogOut size={18} /> Çıkış Yap
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: { 
    backgroundColor: '#fff', 
    borderRight: '1px solid #eee', 
    height: 'calc(100vh - 80px)', 
    position: 'fixed', 
    top: '80px', 
    left: 0, 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    zIndex: 900, 
    transition: 'all 0.3s ease', 
    overflow: 'hidden' 
  },
  menuList: { flexDirection: 'column', gap: '5px' },
  menuItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 25px', cursor: 'pointer', transition: '0.2s', fontSize: '15px', fontWeight: '500' },
  menuText: { fontWeight: '600' },
  footer: { padding: '20px' },
  logoutBtn: { display:'flex', alignItems:'center', gap:10, border:'none', background:'transparent', color:'#e74c3c', cursor:'pointer', fontWeight:'600', padding:'10px', width:'100%' }
};

export default Sidebar;