import os
import re

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
                self.reader = easyocr.Reader(['en'])
                self.has_real_ocr = True
                print("EasyOCR initialized successfully in OCRProcessor!")
            except Exception as e:
                print(f"Failed to initialize EasyOCR: {e}. Running in fallback mode.")

    def extract_text(self, image_path: str) -> str:
        """
        Extracts text from the image file.
        """
        if not os.path.exists(image_path):
            return ""

        if self.has_real_ocr and self.reader:
            try:
                results = self.reader.readtext(image_path)
                text_list = [res[1] for res in results]
                return " ".join(text_list)
            except Exception as e:
                print(f"Error during EasyOCR text extraction: {e}")

        # Fallback parsing name of the file
        filename = os.path.basename(image_path)
        simulated_text = filename.replace("_", " ").replace("-", " ").split(".")[0]
        clean_text = " ".join([w for w in simulated_text.split() if len(w) > 3])
        return clean_text

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
