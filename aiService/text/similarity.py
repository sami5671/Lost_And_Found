import numpy as np

class TextSimilarity:
    @staticmethod
    def cosine_similarity(v1: list, v2: list) -> float:
        if not v1 or not v2:
            return 0.0
        arr1 = np.array(v1)
        arr2 = np.array(v2)
        
        norm1 = np.linalg.norm(arr1)
        norm2 = np.linalg.norm(arr2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
            
        return float(np.dot(arr1, arr2) / (norm1 * norm2))
