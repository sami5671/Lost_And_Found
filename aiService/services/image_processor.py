import os
import requests
import tempfile

DOWNLOAD_CACHE = {}

class ImageProcessor:
    @staticmethod
    def download_image(url: str) -> str:
        if not url or not isinstance(url, str):
            return None
            
        if os.path.exists(url):
            return url
            
        if url in DOWNLOAD_CACHE and os.path.exists(DOWNLOAD_CACHE[url]):
            return DOWNLOAD_CACHE[url]
            
        try:
            if not url.startswith("http://") and not url.startswith("https://"):
                return None
                
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                suffix = "." + url.split(".")[-1]
                if len(suffix) > 5 or "/" in suffix:
                    suffix = ".jpg"
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
                temp_file.write(response.content)
                temp_file.close()
                DOWNLOAD_CACHE[url] = temp_file.name
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
