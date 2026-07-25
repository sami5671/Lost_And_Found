import os
import requests
import tempfile

class ImageProcessor:
    @staticmethod
    def download_image(url: str) -> str:
        if os.path.exists(url):
            return url
            
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                suffix = "." + url.split(".")[-1]
                if len(suffix) > 5 or "/" in suffix:
                    suffix = ".jpg"
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
                temp_file.write(response.content)
                temp_file.close()
                return temp_file.name
        except Exception as e:
            print(f"Error downloading image from {url}: {e}")
            
        return None

    @staticmethod
    def cleanup_image(path: str):
        if path and os.path.exists(path) and ("tmp" in path or "temp" in path.lower()):
            try:
                os.remove(path)
            except Exception as e:
                print(f"Error deleting temp image file {path}: {e}")
