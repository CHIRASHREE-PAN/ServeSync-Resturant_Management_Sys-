from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.database import get_db
from app.schemas.category import CategoryCreateRequest, CategoryResponse, CategoryUpdateRequest
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreateRequest,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
) -> CategoryResponse:
    return CategoryService(db).create_category(payload)


@router.get("", response_model=PaginatedResponse[CategoryResponse])
def list_categories(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> PaginatedResponse[CategoryResponse]:
    response = CategoryService(db).list_categories(page=page, page_size=page_size, search=search)
    return PaginatedResponse[CategoryResponse](**response)


@router.get("/{id}", response_model=CategoryResponse)
def get_category(id: int, db: Session = Depends(get_db)) -> CategoryResponse:
    return CategoryService(db).get_category(id)


@router.put("/{id}", response_model=CategoryResponse)
def update_category(
    id: int,
    payload: CategoryUpdateRequest,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
) -> CategoryResponse:
    return CategoryService(db).update_category(id, payload)


@router.delete("/{id}", response_model=MessageResponse)
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
) -> MessageResponse:
    return MessageResponse(**CategoryService(db).delete_category(id))
