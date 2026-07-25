class CategoryMatcher:
    @staticmethod
    def compare_categories(cat1: str, cat2: str) -> float:
        if not cat1 or not cat2:
            return 0.0
            
        c1 = cat1.strip().lower()
        c2 = cat2.strip().lower()
        
        if c1 == c2:
            return 1.0
            
        if "other" in c1 or "other" in c2:
            return 0.3
            
        return 0.0
