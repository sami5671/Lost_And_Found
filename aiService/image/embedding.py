import os
import numpy as np

try:
    from transformers import AutoProcessor, AutoModel, AutoImageProcessor, ConvNextModel, CLIPProcessor, CLIPModel
    from PIL import Image
    import torch
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False

class ImageEmbedder:
    def __init__(self):
        self.convnext_processor = None
        self.convnext_model = None
        self.clip_processor = None
        self.clip_model = None
        self.siglip_processor = None
        self.siglip_model = None
        self.dinov2_processor = None
        self.dinov2_model = None
        
        self.active_model = None
        self.embedding_dim = 1024
        
        if HAS_TRANSFORMERS:
            # 1. Try loading OpenAI CLIP-Large (openai/clip-vit-large-patch14 - 768-dim highly discriminative vision model)
            try:
                model_name = "openai/clip-vit-large-patch14"
                self.clip_processor = CLIPProcessor.from_pretrained(model_name)
                self.clip_model = CLIPModel.from_pretrained(model_name)
                self.active_model = "clip"
                self.embedding_dim = getattr(self.clip_model.config, "projection_dim", 768)
                print(f"OpenAI CLIP-Large ({model_name}) image embedder loaded successfully! (dim: {self.embedding_dim})")
            except Exception as e_clip_l:
                print(f"Failed to load OpenAI CLIP-Large: {e_clip_l}. Trying Google SigLIP...")
                
                # 2. Try loading Google SigLIP
                try:
                    model_name = "google/siglip-base-patch16-224"
                    self.siglip_processor = AutoProcessor.from_pretrained(model_name)
                    self.siglip_model = AutoModel.from_pretrained(model_name)
                    self.active_model = "siglip"
                    self.embedding_dim = 768
                    print(f"Google SigLIP ({model_name}) image embedder loaded successfully! (dim: 768)")
                except Exception as e_siglip:
                    print(f"Failed to load Google SigLIP: {e_siglip}. Trying Meta DINOv2-Base...")
                    
                    # 3. Try loading Meta DINOv2-Base
                    try:
                        model_name = "facebook/dinov2-base"
                        self.dinov2_processor = AutoImageProcessor.from_pretrained(model_name)
                        self.dinov2_model = AutoModel.from_pretrained(model_name)
                        self.active_model = "dinov2"
                        self.embedding_dim = getattr(self.dinov2_model.config, "hidden_size", 768)
                        print(f"Meta DINOv2-Base ({model_name}) image embedder loaded successfully! (dim: {self.embedding_dim})")
                    except Exception as e_dinov2:
                        print(f"Failed to load Meta DINOv2: {e_dinov2}. Trying Meta ConvNeXt-Base...")
                        
                        # 4. Try loading Meta ConvNeXt-Base
                        try:
                            model_name = "facebook/convnext-base-224-22k"
                            self.convnext_processor = AutoImageProcessor.from_pretrained(model_name)
                            self.convnext_model = ConvNextModel.from_pretrained(model_name)
                            self.active_model = "convnext"
                            self.embedding_dim = getattr(self.convnext_model.config, "hidden_sizes", [1024])[-1]
                            print(f"Meta ConvNeXt-Base ({model_name}) image embedder loaded successfully! (dim: {self.embedding_dim})")
                        except Exception as e_convnext:
                            print(f"Failed to load vision models: {e_convnext}. Running in fallback simulation mode.")

    def get_image_embedding(self, image_path: str) -> list:
        if not os.path.exists(image_path):
            return self._simulate_image_embedding(image_path)
            
        if HAS_TRANSFORMERS and self.active_model:
            try:
                img = Image.open(image_path).convert("RGB")
                if self.active_model == "clip" and self.clip_model:
                    inputs = self.clip_processor(images=img, return_tensors="pt")
                    with torch.no_grad():
                        outputs = self.clip_model.get_image_features(**inputs)
                    outputs = outputs / outputs.norm(p=2, dim=-1, keepdim=True)
                    emb = outputs.numpy()[0].tolist()
                    print(f"OpenAI CLIP-Large extracted {len(emb)}-dim visual feature embedding.")
                    return emb

                elif self.active_model == "siglip" and self.siglip_model:
                    inputs = self.siglip_processor(images=img, return_tensors="pt")
                    with torch.no_grad():
                        outputs = self.siglip_model.get_image_features(**inputs)
                    outputs = outputs / outputs.norm(p=2, dim=-1, keepdim=True)
                    emb = outputs.numpy()[0].tolist()
                    print(f"Google SigLIP extracted {len(emb)}-dim visual feature embedding.")
                    return emb

                elif self.active_model == "dinov2" and self.dinov2_model:
                    inputs = self.dinov2_processor(images=img, return_tensors="pt")
                    with torch.no_grad():
                        outputs = self.dinov2_model(**inputs)
                        if hasattr(outputs, "pooler_output") and outputs.pooler_output is not None:
                            embeddings = outputs.pooler_output
                        elif hasattr(outputs, "last_hidden_state") and outputs.last_hidden_state is not None:
                            embeddings = outputs.last_hidden_state[:, 0, :]
                        else:
                            embeddings = outputs[0][:, 0, :]
                    embeddings = embeddings / embeddings.norm(p=2, dim=-1, keepdim=True)
                    emb = embeddings.numpy()[0].tolist()
                    print(f"Meta DINOv2-Base extracted {len(emb)}-dim visual feature embedding.")
                    return emb

                elif self.active_model == "convnext" and self.convnext_model:
                    inputs = self.convnext_processor(images=img, return_tensors="pt")
                    with torch.no_grad():
                        outputs = self.convnext_model(**inputs)
                        embeddings = outputs.pooler_output
                        if embeddings is None:
                            embeddings = outputs.last_hidden_state.mean(dim=[-2, -1])
                    embeddings = embeddings / embeddings.norm(p=2, dim=-1, keepdim=True)
                    emb = embeddings.numpy()[0].tolist()
                    print(f"Meta ConvNeXt-Base extracted {len(emb)}-dim visual feature embedding.")
                    return emb

            except Exception as e:
                print(f"Error extracting real image embedding ({self.active_model}): {e}")
                
        return self._simulate_image_embedding(image_path)

    def _simulate_image_embedding(self, image_path: str) -> list:
        embedding = np.zeros(512)
        try:
            if os.path.exists(image_path):
                import hashlib
                with open(image_path, "rb") as f:
                    file_bytes = f.read()
                hash_digest = hashlib.md5(file_bytes).hexdigest()
                seed = int(hash_digest[:8], 16)
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
