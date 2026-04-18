import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../services/api';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, Video, VideoOff, ChevronLeft, ChevronRight, CheckCircle, Cpu } from 'lucide-react'; // Cpu ikonu eklendi
import { Hands } from '@mediapipe/hands';
import * as tf from '@tensorflow/tfjs';

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  const isSingleMode = location.state?.singleMode || false;

  const [currentLesson, setCurrentLesson] = useState(null);
  const [labels, setLabels] = useState([]); 
  const [neighborIds, setNeighborIds] = useState({ prev: null, next: null });
  const [loading, setLoading] = useState(true);
  
  // Kamera & Model
  const [model, setModel] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [feedback, setFeedback] = useState("Kamerayı başlat...");
  const [currentScore, setCurrentScore] = useState(0);
  const [status, setStatus] = useState('idle'); 

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const requestRef = useRef(null);
  const sessionStartTimeRef = useRef(null); 
  const isProcessingRef = useRef(false);

  // Stream Ref (Kapanma garantisi için)
  const streamRef = useRef(null);

  // --- 1. VERİLERİ ÇEK ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setCurrentLesson(null); 

      try {
        const labelRes = await fetch('/model/labels.json');
        const labelData = await labelRes.json();
        setLabels(labelData);

        const response = await api.get(`/Lessons/${id}`);
        setCurrentLesson(response.data);

        if (!isSingleMode) {
            const allRes = await api.get('/Lessons');
            // Admin tarafında ders filtrelemesi değiştiği için burayı basitleştiriyoruz, 
            // sadece ID sırasına göre önceki/sonraki bulsun yeterli.
            const allLessons = allRes.data.sort((a, b) => a.id - b.id);
            
            const currentIndex = allLessons.findIndex(l => l.id === parseInt(id));
            setNeighborIds({
                prev: currentIndex > 0 ? allLessons[currentIndex - 1].id : null,
                next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null
            });
        }
      } catch (error) { console.error("Veri hatası:", error); } 
      finally { setLoading(false); }
    };

    stopSystem(); 
    fetchData();

    return () => stopSystem();
  }, [id, isSingleMode]);

  // --- 2. MODELİ YÜKLE ---
  useEffect(() => {
    const loadModel = async () => {
        try {
            await tf.ready();
            const modelUrl = `${window.location.origin}/model/model.json`;
            const loadedModel = await tf.loadGraphModel(modelUrl);
            setModel(loadedModel);
        } catch (err) { console.error("Model yüklenemedi", err); }
    };
    loadModel();
  }, []);

  // --- SİSTEMİ DURDUR ---
  const stopSystem = useCallback(() => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (handsRef.current) try { handsRef.current.close(); } catch(e) {}
    
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    
    setIsCameraActive(false);
    setStatus('idle');
    isProcessingRef.current = false;
    setCurrentScore(0);
    setFeedback("Kamerayı başlat...");
  }, []);

  const toggleCamera = async () => {
      if (isCameraActive) stopSystem();
      else startCamera();
  };

  // --- TAHMİN MANTIĞI ---
  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    if (results.image) ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (model && results.multiHandLandmarks.length > 0 && labels.length > 0) {
        if (isProcessingRef.current || status === 'success') return;

        const inputData = [];
        const lm = results.multiHandLandmarks[0];
        const bx = lm[0].x, by = lm[0].y, bz = lm[0].z;
        lm.forEach(p => {
             inputData.push((p.x - bx) * -1);
             inputData.push(p.y - by);
             inputData.push(p.z - bz);
        });
        while(inputData.length < 126) inputData.push(0);

        const inputTensor = tf.tensor2d([inputData]);
        const prediction = model.execute(inputTensor);
        const values = prediction.dataSync();
        const maxVal = Math.max(...values);
        const classIndex = values.indexOf(maxVal);
        const detectedLabel = labels[classIndex];
        const accuracy = Math.floor(maxVal * 100);

        // 🔥 GÜNCELLEME: Eşleştirme artık Ders Başlığına göre değil,
        // Admin panelinden girilen "modelLabel" alanına göre yapılıyor.
        const targetLabel = currentLesson?.modelLabel; // Veritabanından gelen etiket (Örn: "A")
        
        // Etiket var mı ve eşleşiyor mu?
        const isMatch = targetLabel && detectedLabel === targetLabel;

        if (maxVal > 0.60 && isMatch) {
            setCurrentScore(accuracy);
            if (accuracy > 85) {
                handleSuccess(accuracy);
            } else {
                setFeedback(`Biraz daha düzelt... (%${accuracy})`);
            }
        } else {
            setCurrentScore(0);
            setFeedback(maxVal > 0.7 ? "Yanlış Hareket" : "Algılanıyor...");
        }

        inputTensor.dispose();
        prediction.dispose();
    }
  }, [model, currentLesson, labels, status]);

  const handleSuccess = async (score) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setStatus('success');
    setFeedback("MÜKEMMEL! KAYDEDİLİYOR... 💾");

    const now = Date.now();
    const startTime = sessionStartTimeRef.current || now;
    let duration = Math.floor((now - startTime) / 1000);
    if (duration < 1) duration = 1;

    const userId = localStorage.getItem('userId');

    try {
        await api.post('/Practice/add-session', {
            userId: parseInt(userId),
            lessonId: currentLesson.id,
            workType: currentLesson.title, 
            durationSeconds: duration,
            score: score
        });
    } catch (err) { console.error("Kayıt hatası:", err); }

    setTimeout(() => {
        setFeedback("Tekrar yapabilirsin! Hazır ol...");
        setStatus('idle');
        setCurrentScore(0);
        sessionStartTimeRef.current = Date.now(); 
        isProcessingRef.current = false;
    }, 3000);
  };

  const startCamera = async () => {
    sessionStartTimeRef.current = Date.now(); 
    setIsCameraActive(true);
    const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
    hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    hands.onResults(onResults);
    handsRef.current = hands;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play();
                const loop = async () => {
                    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
                    if (handsRef.current) await handsRef.current.send({ image: videoRef.current });
                    requestRef.current = requestAnimationFrame(loop);
                };
                loop();
            };
        }
    } catch (err) {
        setIsCameraActive(false);
        setFeedback("Kamera izni verilmedi.");
    }
  };

  if (loading) return <div style={styles.loading}>Yükleniyor...</div>;

  // 🔥 YENİ: Dersin AI desteği olup olmadığını kontrol et
  const isAiSupported = currentLesson && currentLesson.modelLabel && currentLesson.modelLabel.length > 0;

  return (
    <div style={styles.container}>
      
      <div style={styles.pageWrapper}>
        <div style={styles.header}>
            {!isSingleMode ? (
                <button onClick={() => navigate('/dersler')} style={styles.backBtn}>
                    <ArrowLeft size={20} /> Dersler
                </button>
            ) : ( <div style={{width:100}}></div> )}

            <div style={styles.titleSection}>
                <h1 style={styles.lessonTitle}>{currentLesson?.title}</h1>
                <p style={styles.lessonSubtitle}>Bu işareti yapmak için videoyu izle ve tekrarla.</p>
            </div>
            
            <div style={{width: 100}}></div>
        </div>

        <div style={styles.mainLayout}>
            
            {/* SOL BUTON */}
            <div style={styles.navSideBtnContainer}>
                {!isSingleMode && (
                    <button 
                        disabled={!neighborIds.prev} 
                        onClick={() => navigate(`/ders/${neighborIds.prev}`)} 
                        style={{...styles.navSideBtn, opacity: neighborIds.prev ? 1 : 0.3}}
                    >
                        <ChevronLeft size={40} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* ORTA: KARTLAR */}
            <div style={styles.grid}>
                {/* Sol Kart: Video */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardIconBox}><Video size={24} color="#3498db"/></div>
                        <h3 style={styles.cardTitle}>Eğitim Videosu</h3>
                    </div>
                    
                    <div style={styles.videoWrapper}>
                        {currentLesson?.videoUrl ? (
                            <video key={currentLesson.id} controls autoPlay loop style={styles.videoPlayer}>
                                <source src={`http://localhost:5255${currentLesson.videoUrl}`} type="video/mp4" />
                            </video>
                        ) : (
                            <div style={{color:'white'}}>Video yükleniyor...</div>
                        )}
                    </div>
                </div>

                {/* Sağ Kart: Kamera */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardIconBox}>
                            <Camera size={24} color={isAiSupported ? "#e67e22" : "#95a5a6"}/>
                        </div>
                        <h3 style={styles.cardTitle}>Senin Sıran</h3>
                        {isAiSupported && <span style={styles.aiBadge}>AI Destekli</span>}
                        {status === 'success' && <span style={styles.badgeSuccess}>Kaydedildi ✅</span>}
                    </div>

                    <div style={styles.cameraContainer}>
                        {/* 🔥 KOŞULLU GÖSTERİM: Eğer AI Destekliyse Kamerayı Göster, Değilse Uyarı Göster */}
                        {isAiSupported ? (
                            <>
                                {!isCameraActive ? (
                                    <div style={styles.cameraOverlay}>
                                        <p style={{marginBottom: 20, color:'#bbb'}}>Başlamak için kamerayı aç.</p>
                                        <button onClick={toggleCamera} style={styles.btnPrimary}>
                                            <Camera size={20}/> Kamerayı Başlat
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <video ref={videoRef} style={{display:'none'}} playsInline muted />
                                        <canvas ref={canvasRef} style={styles.canvas} width={640} height={480} />
                                        
                                        <div style={status === 'success' ? styles.feedbackSuccess : styles.feedbackNormal}>
                                            {status === 'success' && <CheckCircle size={28} style={{marginRight:10}}/>}
                                            {feedback}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            /* AI DESTEĞİ YOKSA GÖSTERİLECEK ALAN */
                            <div style={styles.noAiState}>
                                <Cpu size={48} color="#bdc3c7" />
                                <h4 style={{margin:'10px 0 5px', color:'#7f8c8d'}}>Otomatik Doğrulama Kapalı</h4>
                                <p style={{fontSize:'14px', color:'#95a5a6', textAlign:'center', maxWidth:'80%'}}>
                                    Bu ders için yapay zeka kontrolü aktif edilmemiştir. Lütfen videoyu izleyerek çalışın.
                                </p>
                            </div>
                        )}
                    </div>

                    <div style={styles.cameraFooter}>
                        {isAiSupported && isCameraActive ? (
                            <button onClick={toggleCamera} style={styles.btnDanger}>
                                <VideoOff size={18}/> Kamerayı Kapat
                            </button>
                        ) : ( <div></div> )}

                        {isAiSupported && isCameraActive && (
                            <div style={styles.scoreDisplay}>
                                <span style={styles.scoreLabel}>Doğruluk:</span>
                                <span style={{
                                    ...styles.scoreValue, 
                                    color: currentScore > 80 ? '#2ecc71' : '#3498db'
                                }}>%{currentScore}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SAĞ BUTON */}
            <div style={styles.navSideBtnContainer}>
                {!isSingleMode && (
                    <button 
                        disabled={!neighborIds.next} 
                        onClick={() => navigate(`/ders/${neighborIds.next}`)} 
                        style={{...styles.navSideBtn, opacity: neighborIds.next ? 1 : 0.3}}
                    >
                        <ChevronRight size={40} strokeWidth={2.5} />
                    </button>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Inter, sans-serif', backgroundColor: '#f0f7ff', minHeight: '100vh' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#555' },
  pageWrapper: { maxWidth: '1400px', width: '95%', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  backBtn: { display:'flex', alignItems:'center', gap:8, padding:'10px 20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius:'12px', cursor:'pointer', fontWeight:'600', color:'#555', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  
  titleSection: { textAlign: 'center' },
  lessonTitle: { fontSize: '36px', fontWeight: '800', color: '#1a1a1a', marginBottom: '5px' },
  lessonSubtitle: { fontSize: '16px', color: '#666' },

  mainLayout: { display: 'flex', alignItems: 'center', gap: '30px' },
  
  grid: { flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },

  navSideBtnContainer: { width: '80px', display: 'flex', justifyContent: 'center' },
  
  navSideBtn: { 
    width: '70px', 
    height: '70px', 
    borderRadius: '50%', 
    backgroundColor: '#fff', 
    border: '3px solid #3498db', 
    color: '#1d5a8c', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer', 
    boxShadow: '0 8px 20px rgba(52, 152, 219, 0.25)', 
    transition: '0.2s' 
  },

  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #fff', display: 'flex', flexDirection: 'column', gap: '20px' },
  
  cardHeader: { display: 'flex', alignItems: 'center', gap: '15px' },
  cardIconBox: { width: '45px', height: '45px', backgroundColor: '#e0efff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: '20px', fontWeight: '700', color: '#1a1a1a', margin: 0 },
  badgeSuccess: { marginLeft: 'auto', backgroundColor: '#d4edda', color: '#155724', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  
  // 🔥 YENİ STİL
  aiBadge: { marginLeft: 'auto', fontSize: '11px', backgroundColor: '#eafaf1', color: '#2ecc71', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' },

  videoWrapper: { width: '100%', height: '480px', backgroundColor: '#000', borderRadius: '20px', overflow: 'hidden', display:'flex', alignItems:'center', justifyContent:'center' },
  videoPlayer: { width: '100%', height: '100%', objectFit: 'contain' },

  cameraContainer: { position:'relative', width: '100%', height: '480px', backgroundColor: '#1a1a1a', borderRadius: '20px', overflow: 'hidden', display:'flex', alignItems:'center', justifyContent:'center' },
  cameraOverlay: { textAlign:'center', color:'white', display:'flex', flexDirection:'column', alignItems:'center', gap:'15px' },
  
  // 🔥 YENİ STİL: AI Yoksa Gösterilecek Kutu
  noAiState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width:'100%', backgroundColor: '#f8f9fa', color: '#333' },

  canvas: { width:'100%', height:'100%', objectFit:'cover' },
  
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', transition:'0.2s' },
  btnDanger: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', color: '#e74c3c', border: '1px solid #e74c3c', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },

  feedbackNormal: { position:'absolute', bottom:30, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.7)', color:'white', padding:'12px 24px', borderRadius: '30px', display:'flex', alignItems:'center', fontWeight:'bold', fontSize:'16px', backdropFilter:'blur(5px)' },
  feedbackSuccess: { position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'rgba(46, 204, 113, 0.95)', color:'white', padding:'40px', borderRadius:20, display:'flex', flexDirection:'column', alignItems:'center', fontSize:24, fontWeight:'bold', textAlign:'center', boxShadow:'0 10px 40px rgba(0,0,0,0.3)', zIndex: 10 },

  cameraFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', height: '40px' },
  scoreDisplay: { display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' },
  scoreLabel: { fontSize: '16px', color: '#666', fontWeight: '600' },
  scoreValue: { fontSize: '32px', fontWeight: '800' }
};

export default LessonDetail;