import os

try:
    import cv2
    import numpy as np
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

class FeatureMatcher:
    def __init__(self):
        self.akaze = None
        self.sift = None
        self.orb = None
        
        if HAS_OPENCV:
            try:
                self.akaze = cv2.AKAZE_create()
                self.sift = cv2.SIFT_create()
                self.orb = cv2.ORB_create()
            except Exception as e:
                print(f"Failed to initialize OpenCV detectors: {e}")

    def compute_local_feature_score(self, img_path1: str, img_path2: str) -> float:
        """
        Computes local texture similarity score using AKAZE, SIFT, or ORB.
        Returns a float between 0.0 and 1.0.
        """
        if not HAS_OPENCV or not os.path.exists(img_path1) or not os.path.exists(img_path2):
            return 0.0

        try:
            # Load images in grayscale
            img1 = cv2.imread(img_path1, cv2.IMREAD_GRAYSCALE)
            img2 = cv2.imread(img_path2, cv2.IMREAD_GRAYSCALE)
            
            if img1 is None or img2 is None:
                return 0.0

            # Try AKAZE first
            score = self._match_with_detector(self.akaze, img1, img2, norm_type=cv2.NORM_HAMMING)
            if score > 0.05:
                return score
                
            # Try SIFT
            score = self._match_with_detector(self.sift, img1, img2, norm_type=cv2.NORM_L2)
            if score > 0.05:
                return score

            # Try ORB as final option
            score = self._match_with_detector(self.orb, img1, img2, norm_type=cv2.NORM_HAMMING)
            return score

        except Exception as e:
            print(f"Error in feature matching: {e}")
            return 0.0

    def _match_with_detector(self, detector, img1, img2, norm_type) -> float:
        if detector is None:
            return 0.0

        try:
            kp1, des1 = detector.detectAndCompute(img1, None)
            kp2, des2 = detector.detectAndCompute(img2, None)

            if des1 is None or des2 is None or len(kp1) < 5 or len(kp2) < 5:
                return 0.0

            bf = cv2.BFMatcher(norm_type)
            
            if norm_type == cv2.NORM_L2:
                matches = bf.knnMatch(des1, des2, k=2)
                good_matches = []
                for m, n in matches:
                    if m.distance < 0.75 * n.distance:
                        good_matches.append(m)
            else:
                matches = bf.knnMatch(des1, des2, k=2)
                good_matches = []
                for m_n in matches:
                    if len(m_n) == 2:
                        m, n = m_n
                        if m.distance < 0.8 * n.distance:
                            good_matches.append(m)
                    elif len(m_n) == 1:
                        good_matches.append(m_n[0])

            total_kps = min(len(kp1), len(kp2))
            if total_kps == 0:
                return 0.0
                
            score = len(good_matches) / total_kps
            return float(min(1.0, score))

        except Exception as e:
            return 0.0
