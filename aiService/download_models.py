from transformers import AutoProcessor, AutoModel
from sentence_transformers import SentenceTransformer

print("Pre-downloading all-MiniLM-L6-v2 text embedding model...")
SentenceTransformer("all-MiniLM-L6-v2")

print("Pre-downloading dinov2-base image embedding model...")
model_name = "facebook/dinov2-base"
AutoProcessor.from_pretrained(model_name)
AutoModel.from_pretrained(model_name)

print("Pre-downloading EasyOCR English models...")
try:
    import easyocr
    easyocr.Reader(['en'])
except Exception as e:
    print(f"EasyOCR download failed: {e}")

print("Pre-download complete!")
