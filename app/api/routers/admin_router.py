from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.database import get_db
from app.schemas.admin import StaffCreateRequest, StaffResponse, StaffUpdateRequest
from app.schemas.common import PaginatedResponse
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/users", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
def create_staff(
    payload: StaffCreateRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
) -> StaffResponse:
    staff = AdminService(db).create_staff(name=payload.name, email=payload.email, role=payload.role)
    return StaffResponse.model_validate(staff)


@router.get("/users", response_model=PaginatedResponse[StaffResponse], status_code=status.HTTP_200_OK)
def list_staff(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None),
    role: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
) -> PaginatedResponse[StaffResponse]:
    items, total_items = AdminService(db).list_staff(page=page, page_size=page_size, search=search, role=role)
    total_pages = (total_items + page_size - 1) // page_size if total_items else 0
    return PaginatedResponse[StaffResponse](
        items=[StaffResponse.model_validate(item) for item in items],
        page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
    )


@router.get("/users/{staff_id}", response_model=StaffResponse, status_code=status.HTTP_200_OK)
def get_staff(staff_id: int, db: Session = Depends(get_db), _: dict = Depends(require_admin)) -> StaffResponse:
    staff = AdminService(db).get_staff(staff_id)
    return StaffResponse.model_validate(staff)


@router.put("/users/{staff_id}", response_model=StaffResponse, status_code=status.HTTP_200_OK)
def update_staff(
    staff_id: int,
    payload: StaffUpdateRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
) -> StaffResponse:
    staff = AdminService(db).update_staff(
        staff_id,
        name=payload.name,
        email=payload.email,
        role=payload.role,
        is_active=payload.is_active,
    )
    return StaffResponse.model_validate(staff)


@router.delete("/users/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff(staff_id: int, db: Session = Depends(get_db), _: dict = Depends(require_admin)) -> None:
    AdminService(db).delete_staff(staff_id)
