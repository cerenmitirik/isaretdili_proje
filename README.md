# 🤟 Türk İşaret Dili (TİD) Tanıma ve Eğitim Platformu

Bu proje, işitme engelli bireylerin eğitim süreçlerini desteklemek amacıyla geliştirilmiş, **derin öğrenme** tabanlı gerçek zamanlı bir işaret dili tanıma sistemidir. Proje; veri toplama, model eğitimi, backend servisleri ve kullanıcı arayüzü olmak üzere uçtan uca bir mühendislik çözümü sunar.

---

### 🧠 1. Yapay Zeka ve Model Mimarisi (`isaretdili/`)
Model, el hareketlerinin karmaşık yapısını çözümlemek için modern bilgisayarlı görü tekniklerini kullanır:

* **Öznitelik Çıkarımı:** MediaPipe kütüphanesi ile her iki elden toplam 42 eklem noktası (Landmark) 3 boyutlu ($x, y, z$) koordinat düzleminde takip edilir (Toplam 126 veri girişi).
* **Attention (Dikkat) Mekanizması:** Model mimarisinde kullanılan **MultiHeadAttention** katmanı, el hareketlerindeki kritik noktaları önceliklendirerek tanıma doğruluğunu artırır.
* **Hibrit Mimari:** `BatchNormalization` ve `Dropout` katmanlarıyla desteklenen derin sinir ağı, aşırı öğrenmeyi (**overfitting**) engelleyerek yüksek genelleme kapasitesi sunar.
* **Hiperparametre Optimizasyonu:** 5 farklı model deneyi (Derin Ağ, Geniş Ağ, Hassas vb.) gerçekleştirilmiş ve en iyi sonuç veren konfigürasyon sisteme entegre edilmiştir.

---

### ⚙️ 2. Backend Teknolojileri (`IsaretDili_Web_Backend/`)
* **Mimari:** ASP.NET Core Web API kullanılarak geliştirilmiş, ölçeklenebilir bir yapıdadır.
* **Veri Yönetimi:** Entity Framework Core ile kullanıcı ilerlemeleri ve performans verileri yönetilir.

---

### 💻 3. Frontend ve Kullanıcı Deneyimi (`isaret-dili-frontend/`)
* **Teknoloji:** React.js ile geliştirilmiş interaktif arayüz.
* **Gerçek Zamanlı Test:** Tarayıcı üzerinde kamera verisiyle çalışabilen interaktif yapı.

---

### 🛠️ Kurulum
1. `pip install -r requirements.txt` (Model tarafı için).
2. `python 5_test_v2.py` komutu ile kamerayı başlatın.
