import re

class LocationMatcher:
    CAMPUS_AREAS = [
        "ab4", "ab3", "ab2", "ab1", "library", "cafeteria", "playground", "auditorium",
        "lab", "mosque", "gate", "corridor", "hall", "reception", "office", "garden"
    ]

    @staticmethod
    def compare_locations(loc1: str, loc2: str) -> float:
        if not loc1 or not loc2:
            return 0.5

        l1 = loc1.strip().lower()
        l2 = loc2.strip().lower()

        if l1 == l2:
            return 1.0

        shared_areas = []
        for area in LocationMatcher.CAMPUS_AREAS:
            pattern = r'\b' + re.escape(area) + r'\b'
            if re.search(pattern, l1) and re.search(pattern, l2):
                shared_areas.append(area)

        if shared_areas:
            return 1.0

        if l1 in l2 or l2 in l1:
            return 0.8

        w1 = set(re.findall(r'\b\w{2,}\b', l1))
        w2 = set(re.findall(r'\b\w{2,}\b', l2))
        
        if not w1 or not w2:
            return 0.0
            
        intersection = w1.intersection(w2)
        union = w1.union(w2)
        
        score = len(intersection) / len(union)
        return float(min(1.0, score))
