import os
import cv2
import mediapipe as mp
import pandas as pd
import warnings

warnings.filterwarnings("ignore")

# --- AYARLAR ---
VERI_KLASORU = "TUM_VERI_SETI_LANDMARK_ICIN"
CSV_DOSYA_ADI = "isaret_dili_veriseti_v2.csv" # Dosya ismini değiştirdik

def veri_isleme_v2():
    print("="*60)
    print("🤖 MEDIAPIPE V2 (2 EL + 3D) İŞLEMİ BAŞLIYOR...")
    print("="*60)

    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=2,             # ARTIK 2 EL!
        min_detection_confidence=0.5
    )

    veri_listesi = []
    
    if not os.path.exists(VERI_KLASORU):
        print("HATA: Klasör bulunamadı.")
        return

    klasorler = os.listdir(VERI_KLASORU)
    
    for i, etiket in enumerate(klasorler):
        klasor_yolu = os.path.join(VERI_KLASORU, etiket)
        if not os.path.isdir(klasor_yolu): continue

        resimler = os.listdir(klasor_yolu)
        print(f"Processing: '{etiket}' ({len(resimler)} resim)...")

        for resim_adi in resimler:
            try:
                img = cv2.imread(os.path.join(klasor_yolu, resim_adi))
                if img is None: continue
                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                sonuc = hands.process(img_rgb)

                satir_verisi = [] # Toplam 126 sayı olacak (2 el * 21 nokta * 3 koordinat)

                if sonuc.multi_hand_landmarks:
                    # En fazla 2 el alıyoruz
                    for el_index in range(2):
                        if el_index < len(sonuc.multi_hand_landmarks):
                            # El var, koordinatları al
                            el_landmarks = sonuc.multi_hand_landmarks[el_index]
                            
                            # Normalizasyon için bilek noktası (Derinlik dahil)
                            bilek_x = el_landmarks.landmark[0].x
                            bilek_y = el_landmarks.landmark[0].y
                            bilek_z = el_landmarks.landmark[0].z

                            for lm in el_landmarks.landmark:
                                # X, Y ve Z (Derinlik) alıyoruz
                                satir_verisi.append(lm.x - bilek_x)
                                satir_verisi.append(lm.y - bilek_y)
                                satir_verisi.append(lm.z - bilek_z) 
                        else:
                            # İkinci el yoksa, 63 tane 0 ekle (Padding)
                            satir_verisi.extend([0.0] * 63)
                    
                    # Etiketi ekle
                    satir_verisi.append(etiket)
                    veri_listesi.append(satir_verisi)

            except Exception:
                continue

    print("\n💾 CSV KAYDEDİLİYOR...")
    
    # Sütun isimleri (h0_x0, h0_y0, h0_z0 ... h1_x20, h1_y20, h1_z20)
    sutunlar = []
    for el in range(2):
        for i in range(21):
            sutunlar.append(f"h{el}_x{i}")
            sutunlar.append(f"h{el}_y{i}")
            sutunlar.append(f"h{el}_z{i}")
    sutunlar.append("label")

    df = pd.DataFrame(veri_listesi, columns=sutunlar)
    df.to_csv(CSV_DOSYA_ADI, index=False)
    print(f"✅ BİTTİ! Dosya: {CSV_DOSYA_ADI}")

if __name__ == "__main__":
    veri_isleme_v2()