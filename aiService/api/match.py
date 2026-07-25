import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

# Import components
from image.detector import ObjectDetector
from image.embedding import ImageEmbedder
from image.color import ColorDetector
from text.ocr import OCRProcessor
from text.embedding import TextEmbedder
from metadata.scoring import ScoringPipeline
from services.image_processor import ImageProcessor

router = APIRouter()

# Instantiate handlers once at application startup
detector = ObjectDetector()
image_embedder = ImageEmbedder()
ocr_processor = OCRProcessor()
text_embedder = TextEmbedder()

class ItemModel(BaseModel):
    id: str
    title: str
    description: str
    category: str
    images: List[str] = []
    location: Optional[str] = None
    date: Optional[str] = None

class MatchRequest(BaseModel):
    target_item: ItemModel
    candidate_items: List[ItemModel]

class MatchResponseItem(BaseModel):
    candidate_id: str
    score: float

class MatchResponse(BaseModel):
    status: bool
    matches: List[MatchResponseItem]

def extract_features_hybrid(item: ItemModel) -> dict:
    item_dict = item.model_dump()
    
    title = item_dict.get("title", "")
    description = item_dict.get("description", "")
    category = item_dict.get("category", "")
    images = item_dict.get("images", [])
    
    # 1. Text description embedding
    combined_text = f"{title} {description} {category}"
    desc_embedding = text_embedder.get_text_embedding(combined_text)
    
    # 2. Image-related features
    image_embeddings = []
    visual_image_paths = []
    ocr_texts = []
    serials_found = []
    colors = []
    
    for url in images:
        local_path = ImageProcessor.download_image(url)
        if local_path and os.path.exists(local_path):
            try:
                # Detect and crop object
                cropped_path, labels = detector.detect_and_crop(local_path)
                
                # If a cropped path was generated and is different from the original image
                if cropped_path and cropped_path != local_path:
                    emb_path = cropped_path
                    visual_image_paths.append(cropped_path)
                    # We can clean up the original downloaded image since we have the cropped object image
                    ImageProcessor.cleanup_image(local_path)
                else:
                    emb_path = local_path
                    visual_image_paths.append(local_path)
                    # Do NOT cleanup local_path yet! SIFT/ORB keypoint matching needs it.
                
                # Image embedding (DINOv2/SigLIP/CLIP)
                img_emb = image_embedder.get_image_embedding(emb_path)
                if img_emb:
                    image_embeddings.append(img_emb)
                    
                # Color detection
                color_dist = ColorDetector.get_color_distribution(emb_path)
                colors.append(color_dist)
                
                # OCR extraction on cropped/original image
                extracted_ocr = ocr_processor.extract_text(emb_path)
                if extracted_ocr:
                    ocr_texts.append(extracted_ocr)
                    serials = ocr_processor.find_serial_numbers(extracted_ocr)
                    serials_found.extend(serials)
                    
            except Exception as e:
                print(f"Error extracting features from image {url}: {e}")
                # Clean up local path if error occurred
                ImageProcessor.cleanup_image(local_path)

    ocr_combined = " ".join(ocr_texts)
    
    return {
        "id": item_dict.get("id"),
        "title": title,
        "description": description,
        "category": category,
        "location": item_dict.get("location"),
        "date": item_dict.get("date"),
        "description_embedding": desc_embedding,
        "image_embeddings": image_embeddings,
        "visual_image_paths": visual_image_paths,
        "ocr_text": ocr_combined,
        "serials": list(set(serials_found)),
        "colors": colors
    }

def cleanup_visual_paths(features: dict):
    paths = features.get("visual_image_paths", [])
    for path in paths:
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except Exception as e:
                print(f"Error cleaning up visual path {path}: {e}")

@router.post("/match", response_model=MatchResponse)
async def match_endpoint(request: MatchRequest):
    try:
        # Extract features for target
        target_features = extract_features_hybrid(request.target_item)
        
        cand_features_list = []
        for cand in request.candidate_items:
            cand_features = extract_features_hybrid(cand)
            cand_features_list.append(cand_features)
            
        # Compute hybrid scores
        matches = []
        for cand_feat in cand_features_list:
            score = ScoringPipeline.compute_hybrid_score(target_features, cand_feat)
            matches.append(MatchResponseItem(candidate_id=cand_feat["id"], score=score))
            
        # Sort by score descending and return top 5
        matches.sort(key=lambda x: x.score, reverse=True)
        top_matches = matches[:5]
        
        # Cleanup temp cropped/original images on both sides now that matching has finished
        cleanup_visual_paths(target_features)
        for cand_feat in cand_features_list:
            cleanup_visual_paths(cand_feat)
            
        return MatchResponse(status=True, matches=top_matches)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
