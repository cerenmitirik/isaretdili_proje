import os
import shutil
import yaml

# --- AYARLAR ---
# Verilerin toplanacağı YENİ klasör
HEDEF_KLASOR = "TUM_VERI_SETI_LANDMARK_ICIN"

# İndirilen klasör isimleri (Senin terminal çıktına göre güncelledim)
INDIRILEN_KLASORLER = [
    "TÜRK-İŞARET-DİLİ-1",
    "Isaret-Dili-1",
    "TURK-ISARET-DILI-UYGULAMASI-1"
]
# ---------------

def klasorleri_duzenle():
    if not os.path.exists(HEDEF_KLASOR):
        os.makedirs(HEDEF_KLASOR)
    
    toplam_resim = 0
    
    print("="*50)
    print(" KLASÖRLER DÜZENLENİYOR...")
    print("="*50)

    for klasor_adi in INDIRILEN_KLASORLER:
        # Klasör var mı kontrol et
        if not os.path.exists(klasor_adi):
            print(f"  Bulunamadı (Atlanıyor): {klasor_adi}")
            continue
            
        print(f"Processing: {klasor_adi}...")
        
        # data.yaml dosyasından sınıf isimlerini (anne, baba vb.) öğren
        yaml_path = os.path.join(klasor_adi, "data.yaml")
        try:
            with open(yaml_path, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
                sinif_isimleri = data['names'] # Sınıf listesi
        except Exception as e:
            print(f" YAML hatası ({klasor_adi}): {e}")
            continue

        # Train, Test ve Valid klasörlerini gez
        for alt_klasor in ['train', 'valid', 'test']:
            resim_yolu = os.path.join(klasor_adi, alt_klasor, 'images')
            etiket_yolu = os.path.join(klasor_adi, alt_klasor, 'labels')
            
            if not os.path.exists(resim_yolu): continue

            # Resimleri tek tek al
            for resim_dosyasi in os.listdir(resim_yolu):
                if not resim_dosyasi.endswith(('.jpg', '.jpeg', '.png')): continue
                
                # Bu resmin etiket dosyasını (.txt) bul
                dosya_adi_kok = os.path.splitext(resim_dosyasi)[0]
                txt_dosyasi = os.path.join(etiket_yolu, dosya_adi_kok + ".txt")
                
                if os.path.exists(txt_dosyasi):
                    # Txt'yi oku ve hangi kelime olduğunu bul
                    with open(txt_dosyasi, 'r') as f:
                        satirlar = f.readlines()
                        if len(satirlar) > 0:
                            # İlk satırdaki ilk sayı sınıf ID'sidir
                            sinif_id = int(satirlar[0].split()[0])
                            
                            # ID'yi kelimeye çevir
                            if isinstance(sinif_isimleri, list):
                                # Listeyse direkt indeksten al
                                if sinif_id < len(sinif_isimleri):
                                    kelime = sinif_isimleri[sinif_id]
                                else:
                                    continue
                            elif isinstance(sinif_isimleri, dict):
                                # Sözlükse key'den al
                                kelime = sinif_isimleri.get(sinif_id)
                                if not kelime: kelime = sinif_isimleri.get(str(sinif_id))
                            
                            if kelime:
                                # Hedef klasörü hazırla (TUM_VERI_SETI/anne)
                                hedef_yol = os.path.join(HEDEF_KLASOR, kelime)
                                os.makedirs(hedef_yol, exist_ok=True)
                                
                                # Resmi kopyala
                                yeni_isim = f"{klasor_adi}_{alt_klasor}_{resim_dosyasi}"
                                shutil.copy(
                                    os.path.join(resim_yolu, resim_dosyasi),
                                    os.path.join(hedef_yol, yeni_isim)
                                )
                                toplam_resim += 1

    print("\n" + "="*50)
    print(f" İŞLEM BİTTİ!")
    print(f" Toplam {toplam_resim} adet resim sınıflandırıldı.")
    print(f" Veriler şurada hazır: {HEDEF_KLASOR}/")
    print("="*50)

if __name__ == "__main__":
    klasorleri_duzenle()