"""
TÜRK İŞARET DİLİ - V2 FİNAL EĞİTİM (5 DENEYLİ - FULL VERSİYON)
Amaç: A ve H gibi benzer işaretleri ayırmak için farklı mimarileri yarıştırmak.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
import os

# Görsel ayarları
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

# --- AYARLAR ---
CSV_DOSYA = "isaret_dili_veriseti_v2.csv"
MODEL_KAYIT_ADI = "isaret_dili_modeli_v2.keras"
# ---------------

print("="*80)
print("🧠 V2 MODEL EĞİTİMİ (5 FARKLI DENEY İLE EN İYİSİNİ BULMA)")
print("="*80)

# 1. VERİ YÜKLEME
if not os.path.exists(CSV_DOSYA):
    print(f"❌ HATA: {CSV_DOSYA} bulunamadı!")
    exit(1)

df = pd.read_csv(CSV_DOSYA)
le = LabelEncoder()
y = le.fit_transform(df['label'])
X = df.drop('label', axis=1).values
num_classes = len(le.classes_)

print(f"✅ Veri Hazır: {X.shape[0]} örnek")

# 2. SPLIT
X_train_val, X_test, y_train_val, y_test = train_test_split(X, y, test_size=0.15, random_state=42, stratify=y)
X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.15, random_state=42, stratify=y_train_val)

# 3. AUGMENTATION
def augment_data(X, y, augmentation_factor=2):
    X_aug, y_aug = [], []
    for i in range(len(X)):
        X_aug.append(X[i])
        y_aug.append(y[i])
        for _ in range(augmentation_factor - 1):
            x_sample = X[i].copy()
            noise = np.random.normal(0, 0.01, x_sample.shape)
            scale = np.random.uniform(0.95, 1.05)
            x_sample = (x_sample + noise) * scale
            X_aug.append(x_sample)
            y_aug.append(y[i])
    return np.array(X_aug), np.array(y_aug)

print("🔄 Data Augmentation uygulanıyor...")
X_train_aug, y_train_aug = augment_data(X_train, y_train)

# Class Weights
class_weights_values = compute_class_weight('balanced', classes=np.unique(y_train_aug), y=y_train_aug)
class_weights = {i: w for i, w in enumerate(class_weights_values)}

# 4. MODEL MİMARİSİ
def build_attention_model_v2(input_shape, num_classes, dropout=0.4, units=[128, 64]):
    inputs = layers.Input(shape=input_shape)
    
    # 126 veriyi -> 42 nokta x 3 boyut (x,y,z) yap
    x = layers.Reshape((42, 3))(inputs)

    # Attention (Dikkat)
    attention_output = layers.MultiHeadAttention(num_heads=4, key_dim=3)(x, x)
    x = layers.Add()([x, attention_output])
    x = layers.LayerNormalization()(x)

    x = layers.Flatten()(x)

    for unit in units:
        x = layers.Dense(unit, activation='relu')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(dropout)(x)

    outputs = layers.Dense(num_classes, activation='softmax')(x)
    return models.Model(inputs=inputs, outputs=outputs)

# 5. HİPERPARAMETRE DENEMELERİ (5 ADET)
# A ve H karışıklığını çözmek için daha "Derin" ve "Geniş" modeller ekledim.
configs = [
    {'name': '1. Standart',    'batch': 32, 'lr': 0.001,  'drop': 0.3, 'units': [128, 64]},
    {'name': '2. Derin Ağ',    'batch': 32, 'lr': 0.001,  'drop': 0.4, 'units': [256, 128, 64]}, # Daha derin
    {'name': '3. Hassas',      'batch': 64, 'lr': 0.0005, 'drop': 0.3, 'units': [128, 64]},      # Daha yavaş öğrenen
    {'name': '4. Yüksek Drop', 'batch': 32, 'lr': 0.001,  'drop': 0.5, 'units': [256, 128]},     # Ezber bozucu
    {'name': '5. Geniş Ağ',    'batch': 32, 'lr': 0.001,  'drop': 0.3, 'units': [512, 256, 128]} # Kapasitesi yüksek
]

best_val_acc = 0
best_model = None
best_config = None
best_history = None
results = []

print(f"\n🔬 {len(configs)} FARKLI DENEY BAŞLATILIYOR...")

for idx, conf in enumerate(configs):
    print(f"\n--- Deney {idx+1}: {conf['name']} ---")
    
    model = build_attention_model_v2((126,), num_classes, conf['drop'], conf['units'])
    
    model.compile(optimizer=keras.optimizers.Adam(conf['lr']),
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])
    
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=8, restore_best_weights=True, verbose=0),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=4, verbose=0)
    ]
    
    history = model.fit(
        X_train_aug, y_train_aug,
        validation_data=(X_val, y_val),
        epochs=40,
        batch_size=conf['batch'],
        class_weight=class_weights,
        callbacks=callbacks,
        verbose=0
    )
    
    val_acc = max(history.history['val_accuracy'])
    print(f"   ✅ Sonuç: %{val_acc*100:.2f} Doğruluk")
    results.append({'config': conf['name'], 'val_acc': val_acc})
    
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        best_model = model
        best_config = conf
        best_history = history
        print("   🏆 YENİ LİDER!")

# 6. RAPORLAMA
print(f"\n{'='*80}")
print(f"🥇 KAZANAN MODEL: {best_config['name']} (Acc: %{best_val_acc*100:.2f})")
print("="*80)

# Grafik 1: Deney Sonuçları
plt.figure(figsize=(10, 5))
plt.bar([r['config'] for r in results], [r['val_acc'] for r in results], color='purple')
plt.title("5 Farklı Modelin Karşılaştırması")
plt.ylabel("Doğruluk")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('deney_sonuclari_v2.png')

# Grafik 2: Eğitim Başarısı (Kazanan Model)
plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
plt.plot(best_history.history['accuracy'], label='Train')
plt.plot(best_history.history['val_accuracy'], label='Val')
plt.title("Başarı Grafiği")
plt.legend()
plt.subplot(1, 2, 2)
plt.plot(best_history.history['loss'], label='Train')
plt.plot(best_history.history['val_loss'], label='Val')
plt.title("Kayıp Grafiği")
plt.legend()
plt.savefig('egitim_grafigi_v2.png')

# Kaydet
best_model.save(MODEL_KAYIT_ADI)
np.save('label_encoder_v2.npy', le.classes_)

print("\n✅ TÜM DOSYALAR KAYDEDİLDİ!")
print(f"   - Model: {MODEL_KAYIT_ADI}")
print(f"   - Grafikler: egitim_grafigi_v2.png, deney_sonuclari_v2.png")