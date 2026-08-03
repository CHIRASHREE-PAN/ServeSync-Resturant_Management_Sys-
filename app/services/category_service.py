from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreateRequest, CategoryResponse, CategoryUpdateRequest


class CategoryService:
    def __init__(self, db):
        self.repo = CategoryRepository(db)

    def _validate_name(self, name: str, *, exclude_id: int | None = None) -> str:
        normalized_name = name.strip() if name else ""
        if not normalized_name:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category name is required.")

        existing = self.repo.get_by_name(normalized_name)
        if existing is not None and existing.id != exclude_id:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name already exists.")
        return normalized_name

    def create_category(self, payload: CategoryCreateRequest) -> CategoryResponse:
        name = self._validate_name(payload.name)
        try:
            category = self.repo.create(name=name, description=payload.description)
        except IntegrityError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name already exists.") from exc
        return CategoryResponse.model_validate(category)

    def list_categories(self, *, page: int, page_size: int, search: str | None) -> dict:
        items, total_items = self.repo.list_categories(page=page, page_size=page_size, search=search)
        return {
            "items": [CategoryResponse.model_validate(item) for item in items],
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": (total_items + page_size - 1) // page_size if total_items else 0,
        }

    def get_category(self, category_id: int) -> CategoryResponse:
        category = self.repo.get_by_id(category_id)
        if category is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
        return CategoryResponse.model_validate(category)

    def update_category(self, category_id: int, payload: CategoryUpdateRequest) -> CategoryResponse:
        category = self.repo.get_by_id(category_id)
        if category is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

        update_values = payload.model_dump(exclude_unset=True)
        if "name" in update_values:
            update_values["name"] = self._validate_name(update_values["name"], exclude_id=category_id)

        if not update_values:
            return CategoryResponse.model_validate(category)

        try:
            updated_category = self.repo.update(category, **update_values)
        except IntegrityError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name already exists.") from exc
        return CategoryResponse.model_validate(updated_category)

    def delete_category(self, category_id: int) -> dict:
        category = self.repo.get_by_id(category_id)
        if category is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
        if self.repo.has_menu_items(category_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Category cannot be deleted because it is referenced by menu items.",
            )
        try:
            self.repo.delete(category)
        except IntegrityError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Category cannot be deleted because it is referenced by menu items.",
            ) from exc
        return {"message": "Category deleted successfully."}
