import os
import shutil
import random

# Vhodna mapa - uporabimo augmentirane slike
INPUT_DIR = "dataset/augmented"

# Izhodna mapa
OUTPUT_DIR = "dataset/final"

# Razmerje za delitev podatkov
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

# Da bo delitev vedno enaka ob vsakem zagonu
random.seed(42)


def create_dir(path):
    # Ustvari mapo, če še ne obstaja.
    os.makedirs(path, exist_ok=True)


# Ustvarimo glavne mape train, val in test
for split in ["train", "val", "test"]:
    create_dir(os.path.join(OUTPUT_DIR, split))


# Gremo čez vse razrede: pomaranca, jabolko, banana, ozadje
for class_name in os.listdir(INPUT_DIR):
    class_path = os.path.join(INPUT_DIR, class_name)

    if not os.path.isdir(class_path):
        continue

    # Preberemo vse slike iz trenutnega razreda
    images = os.listdir(class_path)

    # Premešamo slike, da delitev ni vedno po istem vrstnem redu
    random.shuffle(images)

    total = len(images)

    train_count = int(total * TRAIN_RATIO)
    val_count = int(total * VAL_RATIO)

    train_images = images[:train_count]
    val_images = images[train_count:train_count + val_count]
    test_images = images[train_count + val_count:]

    # Ustvarimo mape za trenutni razred znotraj train/val/test
    for split in ["train", "val", "test"]:
        create_dir(os.path.join(OUTPUT_DIR, split, class_name))

    # Kopiranje slik v train
    for image_name in train_images:
        src = os.path.join(class_path, image_name)
        dst = os.path.join(OUTPUT_DIR, "train", class_name, image_name)
        shutil.copy2(src, dst)

    # Kopiranje slik v val
    for image_name in val_images:
        src = os.path.join(class_path, image_name)
        dst = os.path.join(OUTPUT_DIR, "val", class_name, image_name)
        shutil.copy2(src, dst)

    # Kopiranje slik v test
    for image_name in test_images:
        src = os.path.join(class_path, image_name)
        dst = os.path.join(OUTPUT_DIR, "test", class_name, image_name)
        shutil.copy2(src, dst)

    print(f"Razred: {class_name}")
    print(f"  Skupaj: {total}")
    print(f"  Train: {len(train_images)}")
    print(f"  Val: {len(val_images)}")
    print(f"  Test: {len(test_images)}")


print("Delitev podatkov je končana.")