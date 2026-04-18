from roboflow import Roboflow

# --- BURAYA KENDİ API KEY'İNİ YAPIŞTIR ---
API_KEY = "HDcJvBhTaThlXUGewQDy"
# -----------------------------------------

rf = Roboflow(api_key=API_KEY)

print("="*60)
print(" VERİ SETLERİ DOĞRU FORMATTA (YOLOv8) İNDİRİLİYOR...")
print("="*60)

# İndirilecek Projeler
projects = [
    ("proje-qtjgs", "turk-isaret-dili", 1),
    ("isaret-dili", "isaret-dili", 1),
    ("proje-a38aj", "isaret-dili-ptods", 1),
    ("turk-isaret-dili-uygulamasi", "turk-isaret-dili-uygulamasi", 1)
]

for workspace, project_name, version in projects:
    try:
        print(f"\n⬇  İndiriliyor: {project_name}...")
        project = rf.workspace(workspace).project(project_name)
        
        # BURASI ÖNEMLİ: "yolov8" formatı seçiyoruz ki klasörler düzgün gelsin.
        dataset = project.version(version).download("yolov8") 
        
        print(f" Tamamlandı: {dataset.location}")
    except Exception as e:
        print(f" Hata oluştu ({project_name}): {e}")

print("\n" + "="*60)
print(" İNDİRME BİTTİ! Şimdi 2_duzenle.py kodunu çalıştırabilirsin.")
print("="*60)