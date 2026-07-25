import os
from PIL import Image

class ColorDetector:
    COLOR_PALETTE = {
        "black": (20, 20, 20),
        "white": (240, 240, 240),
        "grey": (128, 128, 128),
        "red": (220, 20, 60),
        "orange": (255, 140, 0),
        "yellow": (255, 215, 0),
        "green": (34, 139, 34),
        "blue": (0, 0, 205),
        "purple": (128, 0, 128),
        "pink": (255, 182, 193),
        "brown": (139, 69, 19)
    }

    @staticmethod
    def get_color_distribution(image_path: str) -> dict:
        """
        Extracts the dominant basic color distribution of an image.
        Returns a dict e.g. {"black": 0.82, "blue": 0.10, "grey": 0.08}
        """
        distribution = {color: 0.0 for color in ColorDetector.COLOR_PALETTE}
        if not os.path.exists(image_path):
            return distribution

        try:
            # Load and downsample image to 50x50 for performance
            img = Image.open(image_path).convert("RGB")
            img = img.resize((50, 50))
            pixels = list(img.getdata())
            
            total_pixels = len(pixels)
            for r, g, b in pixels:
                min_dist = float('inf')
                closest_color = "grey"
                
                for color_name, (pr, pg, pb) in ColorDetector.COLOR_PALETTE.items():
                    dist = (r - pr)**2 + (g - pg)**2 + (b - pb)**2
                    if dist < min_dist:
                        min_dist = dist
                        closest_color = color_name
                
                distribution[closest_color] += 1.0
                
            # Normalize to percentages
            for color_name in distribution:
                distribution[color_name] = round(distribution[color_name] / total_pixels, 3)

        except Exception as e:
            print(f"Error in color detection: {e}")
            
        return distribution

    @staticmethod
    def compute_color_similarity(dist1: dict, dist2: dict) -> float:
        """
        Computes similarity between two color distributions using histogram intersection.
        """
        if not dist1 or not dist2:
            return 0.0
            
        intersection = 0.0
        for color in ColorDetector.COLOR_PALETTE:
            intersection += min(dist1.get(color, 0.0), dist2.get(color, 0.0))
            
        return float(intersection)
