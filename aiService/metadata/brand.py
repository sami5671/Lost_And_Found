import re

class BrandMatcher:
    BRANDS = {
        "apple", "iphone", "ipad", "macbook", "dell", "samsung", "galaxy", "lenovo", "hp", 
        "asus", "acer", "sony", "microsoft", "adidas", "nike", "puma", "reebok", 
        "casio", "rolex", "canon", "nikon", "xiaomi", "redmi", "oneplus", "oppo", 
        "vivo", "realme", "huawei", "lg", "toshiba", "panasonic", "bose", "jbl", 
        "sennheiser", "beats", "anker", "sandisk", "transcend", "wd", 
        "seagate", "gucci", "prada", "louis vuitton", "chanel", "hermes"
    }

    @staticmethod
    def extract_brand(text: str) -> str:
        if not text:
            return None
        text_lower = text.lower()
        
        # Special check for Apple products
        if "iphone" in text_lower or "ipad" in text_lower or "macbook" in text_lower or "apple watch" in text_lower:
            return "apple"
            
        for brand in BrandMatcher.BRANDS:
            pattern = r'\b' + re.escape(brand) + r'\b'
            if re.search(pattern, text_lower):
                return brand
        return None

    @staticmethod
    def compare_brands(brand1: str, brand2: str) -> float:
        """
        Compares two extracted brands.
        Returns:
          1.0 if brands are identical.
          0.0 if brands are different.
          0.8 if both are unspecified.
          0.5 if one is unspecified.
        """
        if not brand1 and not brand2:
            return 0.8
        if not brand1 or not brand2:
            return 0.5
        if brand1 == brand2:
            return 1.0
        return 0.0
