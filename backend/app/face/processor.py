from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from typing import List

import face_recognition
import numpy as np
from PIL import Image


@dataclass
class DetectedFace:
    embedding: List[float]
    bbox: dict


def _load_image(image_bytes: bytes) -> np.ndarray:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    return np.array(image)


def extract_face_embeddings(image_bytes: bytes) -> List[DetectedFace]:
    image = _load_image(image_bytes)
    locations = face_recognition.face_locations(image)
    if not locations:
        return []

    encodings = face_recognition.face_encodings(image, known_face_locations=locations)
    faces: List[DetectedFace] = []

    for loc, enc in zip(locations, encodings):
        top, right, bottom, left = loc
        faces.append(
            DetectedFace(
                embedding=list(map(float, enc)),
                bbox={"top": top, "right": right, "bottom": bottom, "left": left},
            )
        )

    return faces


def extract_single_embedding(image_bytes: bytes) -> List[float] | None:
    faces = extract_face_embeddings(image_bytes)
    if not faces:
        return None
    return faces[0].embedding

