import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Report from './pages/Report';
import MainLayout from './components/MainLayout';
import Profile from './pages/Profile'; 
import AdminLessons from './pages/AdminLessons'; // 🔥 YENİ: Admin Sayfası Import Edildi

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />

        {/* DASHBOARD: Sidebar YOK */}
        <Route path="/dashboard" element={
          <MainLayout showSidebar={false}>
            <Dashboard />
          </MainLayout>
        } />
        
        {/* DİĞER SAYFALAR: Sidebar VAR */}
        <Route path="/dersler" element={
          <MainLayout showSidebar={true}>
            <Lessons />
          </MainLayout>
        } />

        <Route path="/ders/:id" element={
          <MainLayout showSidebar={true}>
            <LessonDetail />
          </MainLayout>
        } />

        <Route path="/rapor" element={
          <MainLayout showSidebar={true}>
            <Report />
          </MainLayout>
        } />

        {/* Profil Sayfası Rotası */}
        <Route path="/profil" element={
          <MainLayout showSidebar={true}>
            <Profile />
          </MainLayout>
        } />

        {/* 🔥 YENİ: Admin Ders Yönetimi Rotası */}
        <Route path="/admin/dersler" element={
          <MainLayout showSidebar={true}>
            <AdminLessons />
          </MainLayout>
        } />

      </Routes>
    </Router>
  );
}

export default App;