import os
import tempfile
from PIL import Image

class ObjectDetector:
    def __init__(self):
        self.yolo_model = None
        self.torch_model = None
        self.has_yolo = False
        self.has_torch = False
        
        # Try to load YOLO
        try:
            from ultralytics import YOLO
            # Load a lightweight YOLO model
            self.yolo_model = YOLO("yolov8n.pt")
            self.has_yolo = True
            print("YOLO detector loaded successfully!")
        except Exception as e:
            print(f"YOLO loading failed or not installed: {e}. Trying torchvision...")
            
            # Try torchvision Faster R-CNN as fallback
            try:
                import torchvision.models as models
                import torchvision.transforms as T
                import torch
                # Load a lightweight Faster R-CNN model
                self.torch_model = models.detection.fasterrcnn_resnet50_fpn(pretrained=True)
                self.torch_model.eval()
                self.has_torch = True
                self.transform = T.Compose([T.ToTensor()])
                print("torchvision Faster R-CNN loaded successfully!")
            except Exception as ex:
                print(f"torchvision loading failed: {ex}. Running detector in fallback mode.")

    def detect_and_crop(self, image_path: str) -> tuple:
        """
        Detects objects in the image. Crops the highest confidence object and saves it as a temp file.
        Returns (cropped_image_path, list_of_detected_labels)
        """
        if not os.path.exists(image_path):
            return image_path, []

        labels = []
        try:
            # 1. Try YOLO detection
            if self.has_yolo and self.yolo_model:
                results = self.yolo_model(image_path, verbose=False)
                if results and len(results) > 0:
                    result = results[0]
                    boxes = result.boxes
                    if boxes and len(boxes) > 0:
                        best_box = None
                        best_conf = -1.0
                        for box in boxes:
                            conf = float(box.conf[0])
                            if conf > best_conf:
                                best_conf = conf
                                best_box = box
                        
                        if best_box and best_conf > 0.3:
                            class_id = int(best_box.cls[0])
                            label = self.yolo_model.names[class_id]
                            labels.append(label)
                            
                            x1, y1, x2, y2 = map(int, best_box.xyxy[0])
                            
                            img = Image.open(image_path)
                            cropped_img = img.crop((x1, y1, x2, y2))
                            cropped_img = cropped_img.convert("RGB")
                            
                            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
                            cropped_img.save(temp_file.name)
                            temp_file.close()
                            
                            print(f"YOLO detected '{label}' with {best_conf:.2f} confidence and cropped image.")
                            return temp_file.name, labels

            # 2. Try torchvision Faster R-CNN detection
            if self.has_torch and self.torch_model:
                import torch
                img = Image.open(image_path).convert("RGB")
                img_tensor = self.transform(img).unsqueeze(0)
                with torch.no_grad():
                    prediction = self.torch_model(img_tensor)
                
                if prediction and len(prediction) > 0:
                    pred = prediction[0]
                    boxes = pred['boxes']
                    scores = pred['scores']
                    labels_indices = pred['labels']
                    
                    if len(boxes) > 0 and float(scores[0]) > 0.4:
                        x1, y1, x2, y2 = map(int, boxes[0])
                        
                        # COCO labels mapper
                        coco_names = {
                            1: 'person', 2: 'bicycle', 3: 'car', 4: 'motorcycle', 25: 'backpack',
                            27: 'umbrella', 28: 'handbag', 31: 'handbag', 33: 'suitcase', 
                            63: 'laptop', 64: 'mouse', 65: 'remote', 67: 'keyboard', 
                            73: 'book', 74: 'clock', 76: 'scissors', 77: 'teddy bear',
                            84: 'hair drier', 85: 'toothbrush', 86: 'phone'
                        }
                        label_idx = int(labels_indices[0])
                        label = coco_names.get(label_idx, f"object_{label_idx}")
                        labels.append(label)
                        
                        cropped_img = img.crop((x1, y1, x2, y2))
                        cropped_img = cropped_img.convert("RGB")
                        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
                        cropped_img.save(temp_file.name)
                        temp_file.close()
                        
                        print(f"torchvision detected '{label}' with {scores[0]:.2f} confidence and cropped image.")
                        return temp_file.name, labels

        except Exception as e:
            print(f"Error during object detection: {e}")

        return image_path, labels
