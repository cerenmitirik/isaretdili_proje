import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
import time
import os

# --- AYARLAR ---
MODEL_PATH = 'isaret_dili_modeli_v2.keras'  # V2 Modelini yüklüyoruz
LABEL_PATH = 'label_encoder_v2.npy'       # V2 Etiketlerini yüklüyoruz
CONFIDENCE_THRESHOLD = 0.75               # %75'ten emin değilse yazmasın

print("="*60)
print("🎥 KAMERA V2 BAŞLATILIYOR (2 EL + 3D)...")
print("="*60)

# 1. Dosya Kontrolü ve Yükleme
if not os.path.exists(MODEL_PATH) or not os.path.exists(LABEL_PATH):
    print(f"❌ HATA: '{MODEL_PATH}' veya '{LABEL_PATH}' bulunamadı!")
    print("   Lütfen önce '4_final_attention_v2.py' kodunu çalıştırıp modeli eğit.")
    exit()

try:
    print("⏳ Model yükleniyor...")
    model = tf.keras.models.load_model(MODEL_PATH)
    siniflar = np.load(LABEL_PATH, allow_pickle=True)
    print("✅ Model Hazır!")
except Exception as e:
    print(f"❌ Model yükleme hatası: {e}")
    exit()

# 2. MediaPipe Ayarları (2 EL TAKİBİ AÇIK!)
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,              # ARTIK 2 ELİ DE GÖRÜYORUZ
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)
mp_draw = mp.solutions.drawing_utils

# 3. Kamera Başlat
cap = cv2.VideoCapture(0)
p_time = 0

print("\n🚀 TEST BAŞLADI! Çıkmak için 'q' tuşuna bas.")

while True:
    success, img = cap.read()
    if not success: break

    # Ayna görüntüsü
    img = cv2.flip(img, 1)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands.process(img_rgb)
    
    input_data = [] # Modelin beklediği 126 sayıyı burada toplayacağız

    if results.multi_hand_landmarks:
        # Görsellik: Elleri çiz
        for hand_landmarks in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(img, hand_landmarks, mp_hands.HAND_CONNECTIONS)

        # --- KRİTİK NOKTA: VERİ HAZIRLAMA (Eğitimdeki mantığın aynısı) ---
        # MediaPipe bazen 1, bazen 2 el verir. Biz hep 2 el varmış gibi davranmalıyız.
        
        for i in range(2): # Her zaman 2 tur döner (El 1 ve El 2 için)
            if i < len(results.multi_hand_landmarks):
                # El varsa koordinatlarını al
                h = results.multi_hand_landmarks[i]
                
                # Normalizasyon (Bileğe göre merkezle)
                bx = h.landmark[0].x
                by = h.landmark[0].y
                bz = h.landmark[0].z
                
                for lm in h.landmark:
                    # X, Y ve Z (Derinlik) ekliyoruz
                    input_data.extend([lm.x - bx, lm.y - by, lm.z - bz])
            else:
                # El yoksa 0 ile doldur (Padding)
                # 21 nokta * 3 koordinat = 63 tane sıfır
                input_data.extend([0.0] * 63)

        # --- TAHMİN ---
        try:
            # Veriyi modele uygun şekle getir: (1, 126)
            final_input = np.array([input_data])
            
            prediction = model.predict(final_input, verbose=0)
            class_id = np.argmax(prediction)
            confidence = prediction[0][class_id]

            # Sonucu Ekrana Yaz
            if confidence > CONFIDENCE_THRESHOLD:
                label_text = f"{siniflar[class_id]} %{int(confidence*100)}"
                color = (0, 255, 0) # Yeşil
            else:
                label_text = "..."
                color = (0, 165, 255) # Turuncu

            # Yazıyı elin üstüne koy
            if results.multi_hand_landmarks:
                h, w, c = img.shape
                cx, cy = int(results.multi_hand_landmarks[0].landmark[9].x * w), int(results.multi_hand_landmarks[0].landmark[9].y * h)
                cv2.putText(img, label_text, (cx - 50, cy - 80), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, color, 3, cv2.LINE_AA)

        except Exception as e:
            print(f"Hata: {e}")

    # FPS Göstergesi
    c_time = time.time()
    fps = 1 / (c_time - p_time)
    p_time = c_time
    cv2.putText(img, f'FPS: {int(fps)}', (10, 30), cv2.FONT_HERSHEY_PLAIN, 2, (255, 0, 0), 2)

    cv2.imshow("V2 Test (2 El + 3D)", img)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()