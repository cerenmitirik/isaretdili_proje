import numpy as np
import json
import os

# Dosya ismini senin güncel dosyana göre ayarladım
encoder_path = 'label_encoder_v2.npy' 

if os.path.exists(encoder_path):
    try:
        # allow_pickle=True parametresi npy okurken önemlidir
        classes = np.load(encoder_path, allow_pickle=True)
        
        # Numpy array'i Python listesine çevir
        labels_list = classes.tolist()
        
        # labels.json olarak kaydet
        with open('labels.json', 'w', encoding='utf-8') as f:
            json.dump(labels_list, f, ensure_ascii=False)
            
        print(f"✅ BAŞARILI! 'labels.json' oluşturuldu. İçinde {len(labels_list)} adet sınıf var.")
        print("İlk 5 etiket:", labels_list[:5])
        print("⚠️ BU DOSYAYI REACT PROJENDEKİ 'public/model/' KLASÖRÜNE ATMAYI UNUTMA!")
        
    except Exception as e:
        print("Hata oluştu:", e)
else:
    print(f"❌ HATA: '{encoder_path}' dosyası bulunamadı. Dosya ismini kontrol et.")