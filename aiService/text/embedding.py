import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False

try:
    from transformers import AutoTokenizer, AutoModel
    import torch
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False

class TextEmbedder:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.transformer_model = None
        self.engine = None

        if HAS_SENTENCE_TRANSFORMERS:
            try:
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
                self.engine = "sentence_transformers"
                print("SentenceTransformers (all-MiniLM-L6-v2) loaded successfully!")
            except Exception as e:
                print(f"Failed to load SentenceTransformer: {e}")

        if not self.engine and HAS_TRANSFORMERS:
            try:
                model_name = "sentence-transformers/all-MiniLM-L6-v2"
                self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.transformer_model = AutoModel.from_pretrained(model_name)
                self.engine = "transformers"
                print("Transformers (all-MiniLM-L6-v2) loaded successfully!")
            except Exception as e:
                print(f"Failed to load Transformers MiniLM model: {e}")

    def get_text_embedding(self, text: str) -> list:
        if not text.strip():
            return [0.0] * 384
            
        if self.engine == "sentence_transformers" and self.model:
            try:
                embedding = self.model.encode(text, convert_to_numpy=True)
                norm = np.linalg.norm(embedding)
                if norm > 0:
                    embedding = embedding / norm
                return embedding.tolist()
            except Exception as e:
                print(f"Error extracting embedding via SentenceTransformers: {e}")

        elif self.engine == "transformers" and self.transformer_model and self.tokenizer:
            try:
                import torch
                inputs = self.tokenizer(text, padding=True, truncation=True, return_tensors="pt")
                with torch.no_grad():
                    outputs = self.transformer_model(**inputs)
                    attention_mask = inputs['attention_mask']
                    token_embeddings = outputs.last_hidden_state
                    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
                    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
                    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
                    embedding = sum_embeddings / sum_mask
                    
                embedding = embedding / embedding.norm(p=2, dim=-1, keepdim=True)
                return embedding.numpy()[0].tolist()
            except Exception as e:
                print(f"Error extracting embedding via Transformers: {e}")

        return self._simulate_text_embedding(text)

    def _simulate_text_embedding(self, text: str) -> list:
        words = text.lower().split()
        embedding = np.zeros(384)
        for i, word in enumerate(words):
            seed = sum(ord(c) for c in word)
            np.random.seed(seed)
            embedding += np.random.randn(384)
            
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        return embedding.tolist()
