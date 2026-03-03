from abc import ABC, abstractmethod
from typing import BinaryIO


class StorageBackend(ABC):
    @abstractmethod
    def upload(self, file_obj: BinaryIO, key: str, content_type: str | None = None) -> str:
        raise NotImplementedError

    @abstractmethod
    def get_url(self, key: str) -> str:
        raise NotImplementedError

    @abstractmethod
    def open(self, key: str) -> bytes:
        """Return the full object contents as bytes."""
        raise NotImplementedError

    @abstractmethod
    def delete(self, key: str) -> None:
        raise NotImplementedError

