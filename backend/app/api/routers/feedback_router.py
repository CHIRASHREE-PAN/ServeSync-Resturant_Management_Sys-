from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.database import get_db
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.feedback import FeedbackCreateRequest, FeedbackCreateResponse, FeedbackDetailResponse
from app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post(
    "",
    response_model=FeedbackCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit customer feedback",
    description="Public endpoint. Feedback is accepted only once for a COMPLETED customer session with a paid bill.",
)
def create_feedback(payload: FeedbackCreateRequest, db: Session = Depends(get_db)) -> FeedbackCreateResponse:
    return FeedbackService(db).create_feedback(payload)


@router.get(
    "",
    response_model=PaginatedResponse[FeedbackDetailResponse],
    summary="List feedback",
    description="Admin-only endpoint. Returns feedback newest first and optionally filters by star rating.",
)
def list_feedback(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    rating: int | None = Query(default=None, ge=1, le=5),
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
) -> PaginatedResponse[FeedbackDetailResponse]:
    response = FeedbackService(db).list_feedback(page=page, page_size=page_size, rating=rating)
    return PaginatedResponse[FeedbackDetailResponse](**response)


@router.get(
    "/{feedback_id}",
    response_model=FeedbackDetailResponse,
    summary="Get feedback",
    description="Admin-only endpoint that returns one feedback submission and its customer/session details.",
)
def get_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
) -> FeedbackDetailResponse:
    return FeedbackService(db).get_feedback(feedback_id)


@router.delete(
    "/{feedback_id}",
    response_model=MessageResponse,
    summary="Delete feedback",
    description="Admin-only endpoint that permanently deletes a feedback submission.",
)
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
) -> MessageResponse:
    return MessageResponse(**FeedbackService(db).delete_feedback(feedback_id))