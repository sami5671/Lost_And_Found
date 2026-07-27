class CategoryMatcher:
    CATEGORY_GROUPS = {
        "electronics": {"electronics", "gadget", "gadgets", "phone", "mobile", "laptop", "computer", "device", "headphone", "charger"},
        "documents": {"documents", "document", "cards", "card", "id", "passport", "certificate", "license"},
        "books": {"books", "book", "stationery", "notebook", "pen"},
        "bags": {"bags", "bag", "wallets", "wallet", "purse", "backpack", "pouch"},
        "clothing": {"clothing", "clothes", "wear", "jacket", "shirt", "pant", "shoe", "umbrella", "accessories", "watch"}
    }

    @staticmethod
    def compare_categories(cat1: str, cat2: str) -> float:
        if not cat1 or not cat2:
            return 0.6
            
        c1 = cat1.strip().lower()
        c2 = cat2.strip().lower()
        
        if c1 == c2 or c1 in c2 or c2 in c1:
            return 1.0
            
        # Check group membership
        g1 = None
        g2 = None
        for group, keywords in CategoryMatcher.CATEGORY_GROUPS.items():
            if any(kw in c1 for kw in keywords):
                g1 = group
            if any(kw in c2 for kw in keywords):
                g2 = group

        if g1 and g2 and g1 == g2:
            return 1.0

        if "other" in c1 or "other" in c2:
            return 0.7
            
        return 0.5

