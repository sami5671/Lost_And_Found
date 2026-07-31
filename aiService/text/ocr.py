import os
import re
import cv2
import numpy as np
from PIL import Image

try:
    import easyocr
    HAS_EASYOCR = True
except ImportError:
    HAS_EASYOCR = False

class OCRProcessor:
    def __init__(self):
        self.reader = None
        self.has_real_ocr = False
        
        if HAS_EASYOCR:
            try:
                self.reader = easyocr.Reader(['en'], gpu=False)
                self.has_real_ocr = True
                print("EasyOCR initialized successfully in OCRProcessor!")
            except Exception as e:
                print(f"Failed to initialize EasyOCR: {e}. Running in fallback mode.")

    def extract_text(self, image_input) -> str:
        """
        Extracts text from the image file or array.
        """
        if not image_input:
            return ""

        img_path = image_input if isinstance(image_input, str) else None
        if img_path and not os.path.exists(img_path):
            return ""

        if self.has_real_ocr and self.reader:
            try:
                # Preprocess image into 3-channel RGB numpy array to prevent PyTorch/OpenCV channel/shape unpacking errors
                img_np = None
                if isinstance(image_input, str):
                    img = cv2.imread(image_input)
                    if img is not None:
                        if len(img.shape) == 2:
                            img_np = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
                        elif img.shape[2] == 4:
                            img_np = cv2.cvtColor(img, cv2.COLOR_BGRA2RGB)
                        elif img.shape[2] == 3:
                            img_np = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                    else:
                        with Image.open(image_input) as pil_img:
                            img_np = np.array(pil_img.convert("RGB"))
                elif isinstance(image_input, np.ndarray):
                    img_np = image_input

                target = img_np if img_np is not None else image_input

                # detail=0 returns text strings directly without bounding box tuple construction
                results = self.reader.readtext(target, detail=0)
                
                text_list = []
                for item in results:
                    if isinstance(item, str):
                        text_list.append(item)
                    elif isinstance(item, (list, tuple)):
                        if len(item) >= 2:
                            text_list.append(str(item[1]))
                        elif len(item) == 1:
                            text_list.append(str(item[0]))

                extracted = " ".join(text_list).strip()
                if extracted:
                    return extracted
            except Exception as e:
                print(f"Error during EasyOCR text extraction: {e}")

        # Fallback parsing name of the file
        if img_path:
            filename = os.path.basename(img_path)
            simulated_text = filename.replace("_", " ").replace("-", " ").split(".")[0]
            clean_text = " ".join([w for w in simulated_text.split() if len(w) > 3])
            return clean_text
        return ""

    def find_serial_numbers(self, text: str) -> list:
        """
        Find student ID pattern '221-15-XXX' or alphanumeric serial codes.
        """
        student_id_pattern = r'\b\d{3}-\d{2}-\d{3,5}\b'
        general_serial_pattern = r'\b[A-Z0-9]{6,15}\b'
        
        student_ids = re.findall(student_id_pattern, text, re.IGNORECASE)
        general_serials = re.findall(general_serial_pattern, text)
        
        serials = list(set(student_ids + [s for s in general_serials if not s.isdigit()]))
        return serials
