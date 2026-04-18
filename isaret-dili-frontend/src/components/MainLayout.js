import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = ({ children, showSidebar = true }) => {
  const userName = localStorage.getItem('userName') || "Öğrenci";
  
  // Varsayılan olarak sidebar açık olsun
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Menü butonuna basınca çalışacak fonksiyon
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f7ff' }}>
      
      {/* 1. Navbar: Toggle fonksiyonunu ve menü butonunun görünüp görünmeyeceğini gönderiyoruz */}
      <Navbar 
        userName={userName} 
        onToggleSidebar={toggleSidebar} 
        showMenuButton={showSidebar} // Eğer sidebar yoksa buton da olmasın
      />

      <div style={{ display: 'flex' }}>
        
        {/* 2. Sidebar: Açık/Kapalı bilgisini gönderiyoruz */}
        {showSidebar && <Sidebar isOpen={isSidebarOpen} />}

        {/* 3. İçerik Alanı: Sidebar açıksa sağa itiliyor, kapalıysa tam ekran oluyor */}
        <div style={{ 
            flex: 1, 
            marginLeft: (showSidebar && isSidebarOpen) ? '250px' : '0', 
            width: '100%',
            transition: 'margin-left 0.3s ease', // Yumuşak geçiş
            paddingTop: '20px'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;