import os
import sys
import types
import json
import numpy as np

# --- 1. KRİTİK AYARLAR ---
# Bu ayar, Windows'ta veya bazı sürümlerde çıkan kütüphane hatalarını engeller
mock_module = types.ModuleType("tensorflow_decision_forests")
mock_module.keras = types.ModuleType("keras")
sys.modules["tensorflow_decision_forests"] = mock_module

import tensorflow as tf
from tensorflow import keras
import tensorflowjs as tfjs

# Dosya ismin ekran görüntüsündeki ile AYNI olmalı:
INPUT_MODEL_PATH = 'isaret_dili_modeli_v2.keras' 
OUTPUT_DIR = 'tfjs_model_final' # Yeni oluşacak klasörün adı

print("="*60)
print(f"🚀 İŞLEM BAŞLIYOR: {INPUT_MODEL_PATH}")
print("="*60)

# Dosya kontrolü
if not os.path.exists(INPUT_MODEL_PATH):
    print(f"❌ HATA: '{INPUT_MODEL_PATH}' bulunamadı! Dosya adını kontrol et.")
    exit()

# --- 2. MODELİ YÜKLE VE PARÇALA ---
print("⏳ Orijinal model yükleniyor...")
old_model = keras.models.load_model(INPUT_MODEL_PATH)
config = old_model.get_config()
weights = old_model.get_weights()
input_dim = old_model.input_shape[-1] # Genelde 126 veya 63

print(f"   📊 Giriş Boyutu (Input Shape): {input_dim}")
print("🔨 React uyumlu yeni mimari kuruluyor...")

# --- 3. YENİDEN İNŞA (REBUILD) ---
# Keras 3 formatından kurtulmak için modeli elle baştan oluşturuyoruz
new_model = keras.Sequential()

# Katmanları tek tek ekle
for i, layer_config in enumerate(config['layers']):
    layer_type = layer_config['class_name']
    layer_cfg = layer_config['config']
    
    # InputLayer'ı atla, Dense ve diğerlerini ekle
    if layer_type == 'Dense':
        # İlk Dense katmanına input_shape verilmeli
        if i == 0 or (i==1 and config['layers'][0]['class_name'] == 'InputLayer'):
            new_model.add(keras.layers.Dense(
                units=layer_cfg['units'],
                activation=layer_cfg.get('activation'),
                input_shape=(input_dim,)
            ))
        else:
            new_model.add(keras.layers.Dense(
                units=layer_cfg['units'],
                activation=layer_cfg.get('activation')
            ))
    elif layer_type == 'Dropout':
        new_model.add(keras.layers.Dropout(rate=layer_cfg['rate']))
    elif layer_type == 'BatchNormalization':
        new_model.add(keras.layers.BatchNormalization())

# Modeli derle
new_model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# --- 4. AĞIRLIKLARI AKTAR ---
print("⚖️ Ağırlıklar aktarılıyor...")
try:
    new_model.set_weights(weights)
    print("✅ Ağırlıklar başarıyla kopyalandı.")
except Exception as e:
    print(f"❌ Ağırlık aktarma hatası: {e}")
    exit()

# --- 5. TFJS OLARAK KAYDET ---
# Eski klasörü temizle
if os.path.exists(OUTPUT_DIR):
    import shutil
    shutil.rmtree(OUTPUT_DIR)

print(f"⚙️ {OUTPUT_DIR} klasörüne dönüştürülüyor...")

# En temiz dönüşüm yöntemi
tfjs.converters.save_keras_model(new_model, OUTPUT_DIR)

print("\n" + "="*60)
print("✅ İŞLEM TAMAMLANDI!")
print(f"📂 Yeni dosyaların burada: {os.path.abspath(OUTPUT_DIR)}")
print("👉 ŞİMDİ: Bu klasörün içindekileri kopyalayıp React projenin 'public/model/' klasörüne yapıştır.")
print("="*60)