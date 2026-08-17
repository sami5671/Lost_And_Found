import re
from datetime import datetime
from metadata.brand import BrandMatcher
from metadata.category import CategoryMatcher
from metadata.location import LocationMatcher
from image.similarity import ImageSimilarity
from image.feature_matching import FeatureMatcher
from image.color import ColorDetector
from text.similarity import TextSimilarity

def parse_date(date_str):
    if not date_str:
        return None
    try:
        date_str_clean = date_str.replace("Z", "").split("+")[0]
        return datetime.fromisoformat(date_str_clean)
    except Exception:
        try:
            return datetime.strptime(date_str_clean.split("T")[0], "%Y-%m-%d")
        except Exception:
            return None

def compare_dates(date_str1, date_str2):
    d1 = parse_date(date_str1)
    d2 = parse_date(date_str2)
    if not d1 or not d2:
        return 0.5

    diff_days = abs((d1 - d2).days)
    if diff_days <= 1:
        return 1.0
    elif diff_days <= 3:
        return 0.8
    elif diff_days <= 7:
        return 0.5
    elif diff_days <= 14:
        return 0.2
    return 0.0

class ScoringPipeline:
    @staticmethod
    def compute_hybrid_score(target: dict, candidate: dict) -> float:
        # 1. Serial number / Student ID / unique code check
        student_id_pattern = r'\b\d{3}-\d{2}-\d{3,5}\b'
        t_serials = set(target.get("serials", []))
        c_serials = set(candidate.get("serials", []))
        
        t_full_text = f"{target.get('title', '')} {target.get('description', '')} {target.get('ocr_text', '')}"
        c_full_text = f"{candidate.get('title', '')} {candidate.get('description', '')} {candidate.get('ocr_text', '')}"
        
        t_serials.update(re.findall(student_id_pattern, t_full_text, re.IGNORECASE))
        c_serials.update(re.findall(student_id_pattern, c_full_text, re.IGNORECASE))
        
        if t_serials and c_serials:
            common = t_serials.intersection(c_serials)
            if common:
                return 0.99

        weights = {
            "image_embedding": 0.35,
            "ocr_text": 0.20,
            "description_embedding": 0.15,
            "category": 0.10,
            "brand": 0.10,
            "color": 0.05,
            "date": 0.03,
            "location": 0.02
        }
        
        scores = {}
        
        # Category (10%)
        scores["category"] = CategoryMatcher.compare_categories(target.get("category"), candidate.get("category"))
        
        # Brand (10%)
        target_brand = BrandMatcher.extract_brand(f"{target.get('title', '')} {target.get('description', '')}")
        candidate_brand = BrandMatcher.extract_brand(f"{candidate.get('title', '')} {candidate.get('description', '')}")
        scores["brand"] = BrandMatcher.compare_brands(target_brand, candidate_brand)
        
        # Location (2%)
        scores["location"] = LocationMatcher.compare_locations(target.get("location"), candidate.get("location"))
        
        # Date (3%)
        scores["date"] = compare_dates(target.get("date"), candidate.get("date"))
        
        # Description & Title text similarity (15%)
        target_desc_emb = target.get("description_embedding")
        candidate_desc_emb = candidate.get("description_embedding")
        
        t_title_words = set(re.findall(r'\b\w{2,}\b', target.get('title', '').lower()))
        c_title_words = set(re.findall(r'\b\w{2,}\b', candidate.get('title', '').lower()))
        title_jaccard = len(t_title_words.intersection(c_title_words)) / len(t_title_words.union(c_title_words)) if (t_title_words and c_title_words) else 0.0

        t_words = set(re.findall(r'\b\w{2,}\b', f"{target.get('title', '')} {target.get('description', '')}".lower()))
        c_words = set(re.findall(r'\b\w{2,}\b', f"{candidate.get('title', '')} {candidate.get('description', '')}".lower()))
        
        jaccard_sim = 0.0
        if t_words or c_words:
            intersection = t_words.intersection(c_words)
            union = t_words.union(c_words)
            jaccard_sim = len(intersection) / len(union) if union else 0.0
            
        text_sim_composite = 0.60 * jaccard_sim + 0.40 * title_jaccard
        if target_desc_emb and candidate_desc_emb:
            emb_sim = TextSimilarity.cosine_similarity(target_desc_emb, candidate_desc_emb)
            scores["description_embedding"] = 0.65 * emb_sim + 0.35 * text_sim_composite
        else:
            scores["description_embedding"] = text_sim_composite

        # Image-related features (if images exist on both sides)
        has_images = False
        has_ocr_data = False
        target_img_embs = target.get("image_embeddings", [])
        candidate_img_embs = candidate.get("image_embeddings", [])
        
        if target_img_embs and candidate_img_embs:
            has_images = True
            
            img_similarity = 0.0
            feature_similarity = 0.0
            
            for t_emb in target_img_embs:
                for c_emb in candidate_img_embs:
                    sim = ImageSimilarity.cosine_similarity(t_emb, c_emb)
                    if sim > img_similarity:
                        img_similarity = sim

            # Calibrate cosine similarity for sharp discrimination using exponential power contrast
            calibrated_img_sim = float(max(0.0, img_similarity) ** 3.5)
                        
            # Feature matching using visual image paths (either cropped or original kept alive)
            t_paths = target.get("visual_image_paths", [])
            c_paths = candidate.get("visual_image_paths", [])
            if t_paths and c_paths:
                for t_path in t_paths:
                    for c_path in c_paths:
                        f_sim = FeatureMatcher().compute_local_feature_score(t_path, c_path)
                        if f_sim > feature_similarity:
                            feature_similarity = f_sim
                            
            if feature_similarity > 0.0:
                scores["image_embedding"] = 0.8 * calibrated_img_sim + 0.2 * feature_similarity
            else:
                scores["image_embedding"] = calibrated_img_sim
                
            # OCR Text (20%)
            t_ocr = target.get("ocr_text", "")
            c_ocr = candidate.get("ocr_text", "")
            t_ocr_words = set(t_ocr.lower().split())
            c_ocr_words = set(c_ocr.lower().split())
            if t_ocr_words or c_ocr_words:
                has_ocr_data = True
                intersection = t_ocr_words.intersection(c_ocr_words)
                union = t_ocr_words.union(c_ocr_words)
                scores["ocr_text"] = len(intersection) / len(union) if union else 0.0
            else:
                scores["ocr_text"] = 0.0
                
            # Color matching (5%)
            t_colors = target.get("colors", [])
            c_colors = candidate.get("colors", [])
            color_similarity = 0.0
            if t_colors and c_colors:
                for tc in t_colors:
                    for cc in c_colors:
                        sim = ColorDetector.compute_color_similarity(tc, cc)
                        if sim > color_similarity:
                            color_similarity = sim
            scores["color"] = color_similarity

        # Filter active weights so missing OCR text or missing images do not penalize matching score
        active_weights = {}
        total_active_weight = 0.0
        for key, weight in weights.items():
            if not has_images and key in ["image_embedding", "ocr_text", "color"]:
                continue
            if key == "ocr_text" and not has_ocr_data:
                continue
            active_weights[key] = weight
            total_active_weight += weight
            
        # Compute final weighted score
        final_score = 0.0
        for key, weight in active_weights.items():
            norm_weight = weight / total_active_weight
            final_score += scores.get(key, 0.0) * norm_weight
            
        # Smooth Category Scaling
        if scores["category"] >= 0.9:
            final_score = final_score * 1.05
        elif scores["category"] < 0.5:
            final_score = final_score * 0.95

        return float(max(0.0, min(1.0, final_score)))
