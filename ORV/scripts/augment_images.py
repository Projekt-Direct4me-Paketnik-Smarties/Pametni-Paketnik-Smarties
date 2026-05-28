import os
import cv2 as cv
import numpy as np

# slike, ki so že obdelane na 224x224
INPUT_DIR = "dataset/processed/all"

# augmentirane slike
OUTPUT_DIR = "dataset/augmented"

# ustvarimo izhodno mapo, če še ne obstaja
os.makedirs(OUTPUT_DIR, exist_ok=True)


def rotate_image(img, angle):
   # Slika se zavrti za podan kot.
    h, w = img.shape[:2]
    center = (w // 2, h // 2)

    matrix = cv.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv.warpAffine(img, matrix, (w, h))

    return rotated


def change_brightness(img, value):
    # spremeni svetlost slike
    hsv = cv.cvtColor(img, cv.COLOR_BGR2HSV)
    h, s, v = cv.split(hsv)

    v = v.astype(np.int16)
    v = np.clip(v + value, 0, 255)
    v = v.astype(np.uint8)

    final_hsv = cv.merge((h, s, v))
    result = cv.cvtColor(final_hsv, cv.COLOR_HSV2BGR)

    return result


def blur_image(img):
    # sliko rahlo blura
    return cv.GaussianBlur(img, (5, 5), 0)


# gremo čez vse razrede: pomaranca, jabolko, banana, ozadje
for class_name in os.listdir(INPUT_DIR):
    class_path = os.path.join(INPUT_DIR, class_name)

    if not os.path.isdir(class_path):
        continue

    output_class_dir = os.path.join(OUTPUT_DIR, class_name)
    os.makedirs(output_class_dir, exist_ok=True)

    for file_name in os.listdir(class_path):
        input_path = os.path.join(class_path, file_name)

        img = cv.imread(input_path)

        if img is None:
            print(f"Slike ni mogoče prebrati: {input_path}")
            continue

        name, ext = os.path.splitext(file_name)

        # Shranimo tudi originalno obdelano sliko
        cv.imwrite(os.path.join(output_class_dir, f"{name}_original{ext}"), img)

        # Augmentirane verzije
        cv.imwrite(os.path.join(output_class_dir, f"{name}_rot_plus{ext}"), rotate_image(img, 10))
        cv.imwrite(os.path.join(output_class_dir, f"{name}_rot_minus{ext}"), rotate_image(img, -10))
        cv.imwrite(os.path.join(output_class_dir, f"{name}_bright{ext}"), change_brightness(img, 35))
        cv.imwrite(os.path.join(output_class_dir, f"{name}_dark{ext}"), change_brightness(img, -35))
        cv.imwrite(os.path.join(output_class_dir, f"{name}_blur{ext}"), blur_image(img))

        print(f"Augmentirano: {file_name}")

print("Augmentacija slik je končana.")