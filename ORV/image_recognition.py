import cv2 as cv
from pathlib import Path
import os
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads/')

def image(image_path)->bool:
    slika = cv.imread(image_path)
    if slika is None:
        return False
    else:
        return True

#cv.imshow('Gray', slika)
#cv.waitKey(0)
#cv.destroyAllWindows()