import os
import numpy as np

try:
    from transformers import AutoProcessor, AutoModel, CLIPProcessor, CLIPModel
    from PIL import Image
    import torch
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False

class ImageEmbedder:
    def __init__(self):
        self.dinov2_processor = None
        self.dinov2_model = None
        self.siglip_processor = None
        self.siglip_model = None
        self.clip_processor = None
        self.clip_model = None
        
        self.active_model = None
        
        if HAS_TRANSFORMERS:
            # 1. Try loading DINOv2
            try:
                model_name = "facebook/dinov2-base"
                self.dinov2_processor = AutoProcessor.from_pretrained(model_name)
                self.dinov2_model = AutoModel.from_pretrained(model_name)
                self.active_model = "dinov2"
                print("DINOv2 image embedder loaded successfully!")
            except Exception as e:
                print(f"Failed to load DINOv2: {e}. Trying SigLIP...")
                
                # 2. Try loading SigLIP
                try:
                    model_name = "google/siglip-base-patch16-224"
                    self.siglip_processor = AutoProcessor.from_pretrained(model_name)
                    self.siglip_model = AutoModel.from_pretrained(model_name)
                    self.active_model = "siglip"
                    print("SigLIP image embedder loaded successfully!")
                except Exception as ex:
                    print(f"Failed to load SigLIP: {ex}. Trying CLIP...")
                    
                    # 3. Try loading CLIP
                    try:
                        model_name = "openai/clip-vit-base-patch32"
                        self.clip_processor = CLIPProcessor.from_pretrained(model_name)
                        self.clip_model = CLIPModel.from_pretrained(model_name)
                        self.active_model = "clip"
                        print("CLIP image embedder loaded successfully!")
                    except Exception as exc:
                        print(f"Failed to load CLIP: {exc}. Running image embedder in fallback simulation mode.")

    def get_image_embedding(self, image_path: str) -> list:
        if not os.path.exists(image_path):
            return self._simulate_image_embedding(image_path)
            
        if HAS_TRANSFORMERS and self.active_model:
            try:
                img = Image.open(image_path).convert("RGB")
                if self.active_model == "dinov2" and self.dinov2_model:
                    inputs = self.dinov2_processor(images=img, return_tensors="pt")
                    with torch.no_grad():
                        outputs = self.dinov2_model(**inputs)
                        embeddings = outputs.pooler_output
                        if embeddings is None:
                            embeddings = outputs.last_hidden_state.mean(dim=1)
                    embeddings = embeddings / embeddings.norm(p=2, dim=-1, keepdim=True)
                    return embeddings.numpy()[0].tolist()
                    
                elif self.active_model == "siglip" and self.siglip_model:
                    inputs = self.siglip_processor(images=img, return_tensors="pt")
                    with torch.no_grad():
                        outputs = self.siglip_model.get_image_features(**inputs)
                    outputs = outputs / outputs.norm(p=2, dim=-1, keepdim=True)
                    return outputs.numpy()[0].tolist()
                    
                elif self.active_model == "clip" and self.clip_model:
                    inputs = self.clip_processor(images=img, return_tensors="pt")
                    with torch.no_grad():
                        outputs = self.clip_model.get_image_features(**inputs)
                    outputs = outputs / outputs.norm(p=2, dim=-1, keepdim=True)
                    return outputs.numpy()[0].tolist()
            except Exception as e:
                print(f"Error extracting real image embedding ({self.active_model}): {e}")
                
        return self._simulate_image_embedding(image_path)

    def _simulate_image_embedding(self, image_path: str) -> list:
        embedding = np.zeros(512)
        try:
            if os.path.exists(image_path):
                file_size = os.path.getsize(image_path)
                basename = os.path.basename(image_path)
                seed = file_size + sum(ord(c) for c in basename)
                np.random.seed(seed)
            else:
                np.random.seed(42)
            embedding = np.random.randn(512)
        except Exception:
            np.random.seed(42)
            embedding = np.random.randn(512)
            
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        return embedding.tolist()
