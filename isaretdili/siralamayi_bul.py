import numpy as np

# Label dosyanın olduğu yol
LABEL_PATH = 'label_encoder_v2.npy' 

try:
    siniflar = np.load(LABEL_PATH, allow_pickle=True)
    print("="*50)
    print("✅ İŞTE DOĞRU SIRALAMA (Bunu React'e Kopyala):")
    print("="*50)
    
    # React formatında yazdıralım
    print("const LABELS = [", end="")
    for i, label in enumerate(siniflar):
        print(f"'{label}'", end="")
        if i < len(siniflar) - 1:
            print(", ", end="")
    print("];")
    
    print("\n" + "="*50)
    
except Exception as e:
    print(f"Hata: {e}")