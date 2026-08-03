from math import isfinite
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.exc import IntegrityError

from app.repositories.menu_repository import MenuRepository
from app.schemas.menu import MenuItemListResponse, MenuItemResponse


class MenuService:
    def __init__(self, db):
        self.db = db
        self.repo = MenuRepository(db)

    def _validate_menu_payload(
        self,
        *,
        category_id: int,
        name: str,
        price: float,
        calories: int | None,
        cook_time: int | None,
        exclude_id: int | None = None,
    ) -> None:
        if not name or not name.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Menu name is required.")

        if category_id <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category id.")

        if not isfinite(float(price)) or price <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Price must be greater than zero.")

        if calories is not None and calories < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Calories cannot be negative.")

        if cook_time is not None and cook_time <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cook time must be greater than zero.")

        category = self.repo.get_category_by_id(category_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

        existing = self.repo.get_menu_by_name(name)
        if existing and existing.id != exclude_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Menu item with this name already exists.")

    async def _validate_image_file(self, image: UploadFile | None) -> str | None:
        if image is None:
            return None

        extension = Path(image.filename or "").suffix.lower()
        allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
        allowed_types = {"image/jpeg", "image/png", "image/webp"}
        if extension not in allowed_extensions or image.content_type not in allowed_types:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPG, PNG, and WEBP images are allowed.")

        raw_bytes = await image.read()
        if len(raw_bytes) > 5 * 1024 * 1024:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image size must be less than or equal to 5MB.")

        if not self._has_valid_image_signature(raw_bytes, extension):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is not a valid image.")

        upload_dir = Path("uploads/menu")
        upload_dir.mkdir(parents=True, exist_ok=True)
        destination = upload_dir / f"{uuid4().hex}{extension}"

        destination.write_bytes(raw_bytes)
        return destination.as_posix()

    @staticmethod
    def _has_valid_image_signature(raw_bytes: bytes, extension: str) -> bool:
        if extension in {".jpg", ".jpeg"}:
            return raw_bytes.startswith(b"\xff\xd8\xff")
        if extension == ".png":
            return raw_bytes.startswith(b"\x89PNG\r\n\x1a\n")
        if extension == ".webp":
            return len(raw_bytes) >= 12 and raw_bytes[:4] == b"RIFF" and raw_bytes[8:12] == b"WEBP"
        return False

    async def create_menu_item(self, payload, image: UploadFile | None = None) -> MenuItemResponse:
        self._validate_menu_payload(
            category_id=payload.category_id,
            name=payload.name,
            price=payload.price,
            calories=payload.calories,
            cook_time=payload.cook_time,
        )
        image_path = await self._validate_image_file(image)
        try:
            menu_item = self.repo.create_menu_item(
                category_id=payload.category_id,
                name=payload.name.strip(),
                description=payload.description,
                price=payload.price,
                image=image_path,
                calories=payload.calories,
                cook_time=payload.cook_time,
                availability=payload.availability,
                chef_special=payload.chef_special,
                best_seller=payload.best_seller,
            )
        except IntegrityError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Menu item with this name already exists.") from exc
        return MenuItemResponse.model_validate(menu_item)

    def get_menu_item(self, menu_id: int) -> MenuItemResponse:
        menu_item = self.repo.get_menu_by_id(menu_id)
        if not menu_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found.")
        return MenuItemResponse.model_validate(menu_item)

    def list_menu_items(
        self,
        *,
        page: int,
        page_size: int,
        search: str | None,
        category_id: int | None,
        chef_special: bool | None,
        best_seller: bool | None,
        sort_by: str,
        sort_dir: str,
    ) -> dict:
        if page < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Page must be greater than zero.")
        if page_size < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Page size must be greater than zero.")

        items, total_items = self.repo.list_menu_items(
            page=page,
            page_size=page_size,
            search=search,
            category_id=category_id,
            chef_special=chef_special,
            best_seller=best_seller,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )
        total_pages = (total_items + page_size - 1) // page_size if total_items else 0
        return {
            "items": [MenuItemListResponse.model_validate(item) for item in items],
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
        }

    def search_menu_items(self, query: str) -> list[MenuItemResponse]:
        if not query.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Search query is required.")
        items = self.repo.search_menu_items(query)
        return [MenuItemResponse.model_validate(item) for item in items]

    def get_menu_by_category(self, category_id: int) -> list[MenuItemResponse]:
        if category_id <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category id.")
        category = self.repo.get_category_by_id(category_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
        items = self.repo.list_menu_items_by_category(category_id)
        return [MenuItemResponse.model_validate(item) for item in items]

    async def update_menu_item(self, menu_id: int, payload, image: UploadFile | None = None) -> MenuItemResponse:
        menu_item = self.repo.get_menu_by_id(menu_id)
        if not menu_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found.")

        name = payload.name.strip() if payload.name is not None else menu_item.name
        category_id = payload.category_id if payload.category_id is not None else menu_item.category_id
        price = payload.price if payload.price is not None else menu_item.price
        calories = payload.calories if payload.calories is not None else menu_item.calories
        cook_time = payload.cook_time if payload.cook_time is not None else menu_item.cook_time

        self._validate_menu_payload(
            category_id=category_id,
            name=name,
            price=price,
            calories=calories,
            cook_time=cook_time,
            exclude_id=menu_id,
        )

        image_path = await self._validate_image_file(image)
        update_data = {
            "category_id": category_id,
            "name": name,
            "description": payload.description if payload.description is not None else menu_item.description,
            "price": price,
            "image": image_path or menu_item.image,
            "calories": calories,
            "cook_time": cook_time,
            "availability": payload.availability if payload.availability is not None else menu_item.availability,
            "chef_special": payload.chef_special if payload.chef_special is not None else menu_item.chef_special,
            "best_seller": payload.best_seller if payload.best_seller is not None else menu_item.best_seller,
        }
        try:
            updated_item = self.repo.update_menu_item(menu_item, **update_data)
        except IntegrityError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Menu item with this name already exists.") from exc
        return MenuItemResponse.model_validate(updated_item)

    def delete_menu_item(self, menu_id: int) -> dict:
        menu_item = self.repo.get_menu_by_id(menu_id)
        if not menu_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found.")
        try:
            self.repo.delete_menu_item(menu_item)
        except IntegrityError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Menu item cannot be deleted because it is referenced by an order.",
            ) from exc
        return {"message": "Menu item deleted successfully."}
