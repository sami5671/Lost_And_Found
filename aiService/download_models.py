from transformers import AutoProcessor, AutoModel, AutoImageProcessor, ConvNextModel, CLIPProcessor, CLIPModel
from sentence_transformers import SentenceTransformer

print("Pre-downloading all-mpnet-base-v2 text embedding model...")
SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

print("Pre-downloading OpenAI CLIP-Large (openai/clip-vit-large-patch14) primary vision model...")
clip_name = "openai/clip-vit-large-patch14"
CLIPProcessor.from_pretrained(clip_name)
CLIPModel.from_pretrained(clip_name)

print("Pre-downloading Google SigLIP (google/siglip-base-patch16-224) vision model...")
siglip_name = "google/siglip-base-patch16-224"
AutoProcessor.from_pretrained(siglip_name)
AutoModel.from_pretrained(siglip_name)

print("Pre-downloading Meta DINOv2-Base (facebook/dinov2-base) image embedding model...")
dinov2_name = "facebook/dinov2-base"
AutoImageProcessor.from_pretrained(dinov2_name)
AutoModel.from_pretrained(dinov2_name)

print("Pre-downloading EasyOCR English models...")
try:
    import easyocr
    easyocr.Reader(['en'])
except Exception as e:
    print(f"EasyOCR download failed: {e}")

print("Pre-download complete!")
