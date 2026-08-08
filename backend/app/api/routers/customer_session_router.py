
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_customer_session_service
from app.database import get_db
from app.schemas.customer_session import (
    CustomerSessionCreateRequest,
    CustomerSessionResponse,
    CustomerSessionUpdateRequest,
)
from app.services.customer_session_service import CustomerSessionService


router = APIRouter(prefix="/customer", tags=["customer-session"])


@router.post(
    "/session",
    response_model=CustomerSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a customer session",
    description=(
        "Create a new customer session before ordering food. "
        "The backend validates the table and ensures only one active "
        "session is allowed per table."
    ),
)
def create_customer_session(
    payload: CustomerSessionCreateRequest,
    db: Session = Depends(get_db),
    service: CustomerSessionService = Depends(get_customer_session_service),
) -> CustomerSessionResponse:
    customer_session = service.create_customer_session(
        name=payload.name,
        email=payload.email,
        number_of_people=payload.number_of_people,
        table_number=payload.table_number,
    )
    return CustomerSessionResponse.model_validate(customer_session)


@router.get(
    "/session/table/{table_number}",
    response_model=CustomerSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get active customer session for a table",
    description="Fetch the current ACTIVE customer session for a restaurant table.",
)
def get_active_customer_session_for_table(
    table_number: int,
    db: Session = Depends(get_db),
    service: CustomerSessionService = Depends(get_customer_session_service),
) -> CustomerSessionResponse:
    customer_session = service.get_active_customer_session_for_table(
        table_number
    )
    return CustomerSessionResponse.model_validate(customer_session)


@router.get(
    "/session/{id}",
    response_model=CustomerSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a customer session",
    description="Fetch the details of an existing customer session by its primary key id.",
)
def get_customer_session(
    id: int,
    db: Session = Depends(get_db),
    service: CustomerSessionService = Depends(get_customer_session_service),
) -> CustomerSessionResponse:
    customer_session = service.get_customer_session(id)
    return CustomerSessionResponse.model_validate(customer_session)


@router.put(
    "/session/{id}",
    response_model=CustomerSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a customer session",
    description=(
        "Update customer session details while the session remains ACTIVE. "
        "The module does not complete or delete sessions."
    ),
)
def update_customer_session(
    id: int,
    payload: CustomerSessionUpdateRequest,
    db: Session = Depends(get_db),
    service: CustomerSessionService = Depends(get_customer_session_service),
) -> CustomerSessionResponse:
    customer_session = service.update_customer_session(
        id,
        name=payload.name,
        email=payload.email,
        number_of_people=payload.number_of_people,
        table_number=payload.table_number,
    )
    return CustomerSessionResponse.model_validate(customer_session)

