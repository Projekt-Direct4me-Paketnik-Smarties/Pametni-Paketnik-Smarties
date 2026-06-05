import os
import cv2 as cv
import numpy as np

# Mapa z originalnimi slikami
RAW_DIR = "dataset/raw"

# Mapa, kamor bomo shranili obdelane slike
PROCESSED_DIR = "dataset/processed/all"

# Končna velikost slike
IMG_SIZE = 224


def resize_with_padding(img, size=224):
    """
    Funkcija spremeni velikost slike na size x size,
    ampak ohrani razmerje stranic.

    Če je slika npr. zelo široka ali zelo visoka,
    je ne raztegne, ampak doda črne robove.
    """

    # Pridobimo višino in širino originalne slike
    h, w = img.shape[:2]

    # Izračunamo faktor pomanjšave/povečave
    # Večja stranica slike bo postala dolga 'size'
    scale = size / max(h, w)

    # Nova širina in višina po ohranitvi razmerja
    new_w = int(w * scale)
    new_h = int(h * scale)

    # Spremenimo velikost slike
    resized = cv.resize(img, (new_w, new_h))

    # Ustvarimo črno sliko velikosti size x size
    output = np.zeros((size, size, 3), dtype=np.uint8)

    # Izračunamo, kam moramo postaviti sliko,
    # da bo na sredini črnega ozadja
    x_offset = (size - new_w) // 2
    y_offset = (size - new_h) // 2

    # Prilepimo pomanjšano/povečano sliko na sredino
    output[y_offset:y_offset + new_h, x_offset:x_offset + new_w] = resized

    return output


# Ustvarimo glavno processed mapo, če še ne obstaja
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Gremo čez vse razrede v dataset/raw
# Primer: pomaranca, jabolko, banana, ozadje
for class_name in os.listdir(RAW_DIR):
    class_path = os.path.join(RAW_DIR, class_name)

    # Če slučajno ni mapa, preskočimo
    if not os.path.isdir(class_path):
        continue

    # Za vsak razred ustvarimo svojo mapo v processed/all
    output_class_dir = os.path.join(PROCESSED_DIR, class_name)
    os.makedirs(output_class_dir, exist_ok=True)

    # Gremo čez vse slike v trenutnem razredu
    for file_name in os.listdir(class_path):
        input_path = os.path.join(class_path, file_name)

        # Preberemo sliko
        img = cv.imread(input_path)

        # Če slike ne more prebrati, jo preskočimo
        if img is None:
            print(f"Slike ni mogoče prebrati: {input_path}")
            continue

        # Spremenimo velikost slike brez raztegovanja
        img = resize_with_padding(img, IMG_SIZE)

        # Pot, kamor se shrani obdelana slika
        output_path = os.path.join(output_class_dir, file_name)

        # Shranimo sliko
        cv.imwrite(output_path, img)

        print(f"Shranjeno: {output_path}")

print("Predobdelava slik je končana.")