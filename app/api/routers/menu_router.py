from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.database import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.menu import MenuItemCreateRequest, MenuItemResponse, MenuItemUpdateRequest
from app.services.menu_service import MenuService

router = APIRouter(prefix="/menu", tags=["menu"])


@router.post(
    "",
    response_model=MenuItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create menu item",
)
async def create_menu_item(
    payload: MenuItemCreateRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
    image: UploadFile | None = File(default=None),
) -> MenuItemResponse:
    menu_item = await MenuService(db).create_menu_item(payload, image)
    return menu_item


@router.get(
    "",
    response_model=PaginatedResponse[MenuItemResponse],
    status_code=status.HTTP_200_OK,
    summary="List menu items",
)
def list_menu_items(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None),
    category_id: int | None = Query(default=None, ge=1),
    chef_special: bool | None = Query(default=None),
    best_seller: bool | None = Query(default=None),
    sort_by: str = Query("name"),
    sort_dir: str = Query("asc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[MenuItemResponse]:
    response = MenuService(db).list_menu_items(
        page=page,
        page_size=page_size,
        search=search,
        category_id=category_id,
        chef_special=chef_special,
        best_seller=best_seller,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return PaginatedResponse[MenuItemResponse](
        items=response["items"],
        page=response["page"],
        page_size=response["page_size"],
        total_items=response["total_items"],
        total_pages=response["total_pages"],
    )


@router.get(
    "/search",
    response_model=list[MenuItemResponse],
    status_code=status.HTTP_200_OK,
    summary="Search menu items",
)
def search_menu_items(
    query: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
) -> list[MenuItemResponse]:
    return MenuService(db).search_menu_items(query)


@router.get(
    "/category/{category_id}",
    response_model=list[MenuItemResponse],
    status_code=status.HTTP_200_OK,
    summary="List menu items by category",
)
def get_menu_items_by_category(
    category_id: int,
    db: Session = Depends(get_db),
) -> list[MenuItemResponse]:
    return MenuService(db).get_menu_by_category(category_id)


@router.get(
    "/{id}",
    response_model=MenuItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Get menu item",
)
def get_menu_item(
    id: int,
    db: Session = Depends(get_db),
) -> MenuItemResponse:
    return MenuService(db).get_menu_item(id)


@router.put(
    "/{id}",
    response_model=MenuItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Update menu item",
)
async def update_menu_item(
    id: int,
    payload: MenuItemUpdateRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
    image: UploadFile | None = File(default=None),
) -> MenuItemResponse:
    return await MenuService(db).update_menu_item(id, payload, image)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete menu item",
)
def delete_menu_item(
    id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
) -> None:
    MenuService(db).delete_menu_item(id)
