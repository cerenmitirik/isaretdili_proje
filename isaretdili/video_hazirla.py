import os
from moviepy import VideoFileClip 

# Senin kontrol ettiğin tam yollar:
kaynak = r"C:\Users\ceren\isaretdili\TURK-ISARET-DILI-UYGULAMASI-1\DERS_VIDEOLARI_HAM"
hedef = r"C:\Users\ceren\isaretdili\TURK-ISARET-DILI-UYGULAMASI-1\DERS_VIDEOLARI_MP4"

if not os.path.exists(hedef):
    os.makedirs(hedef)
    print(f"Hedef klasör oluşturuldu: {hedef}")

if not os.path.exists(kaynak):
    # Eğer yol yine bulunamazsa, Python'a o an nerede olduğunu sorduralım
    print(f"HATA: Kaynak yolu bulunamadı: {kaynak}")
    print(f"Şu anki çalışma dizini: {os.getcwd()}")
else:
    dosyalar = [f for f in os.listdir(kaynak) if f.endswith(".gif")]
    print(f"Bulunan GIF sayısı: {len(dosyalar)}")

    for dosya in dosyalar:
        try:
            print(f"Dönüştürülüyor: {dosya}")
            input_p = os.path.join(kaynak, dosya)
            output_p = os.path.join(hedef, dosya.replace(".gif", ".mp4"))
            
            with VideoFileClip(input_p) as clip:
                clip.write_videofile(output_p, codec="libx264", audio=False)
        except Exception as e:
            print(f"Hata ({dosya}): {e}")

print("\n✅ BİTTİ!")