import logging

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import Feedback
from app.repositories.feedback_repository import FeedbackRepository
from app.schemas.feedback import FeedbackCreateRequest, FeedbackCreateResponse, FeedbackDetailResponse

logger = logging.getLogger("restaurant_management.feedback")


class FeedbackService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = FeedbackRepository(db)

    def create_feedback(self, payload: FeedbackCreateRequest) -> FeedbackCreateResponse:
        try:
            customer_session = self.repo.get_session(payload.session_id)
            if customer_session is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer session not found.")
            if customer_session.status != "COMPLETED":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Feedback can only be submitted for a COMPLETED customer session.",
                )
            bill = self.repo.get_bill_by_session_id(payload.session_id)
            if bill is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found.")
            if not bill.is_paid:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Feedback can only be submitted after the bill is paid.",
                )
            if self.repo.get_by_session_id(payload.session_id) is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Feedback has already been submitted for this customer session.",
                )

            feedback = self.repo.create(
                session_id=payload.session_id,
                rating=payload.rating,
                comment=payload.comment,
            )
            return FeedbackCreateResponse.model_validate(feedback)
        except HTTPException:
            self.db.rollback()
            raise
        except IntegrityError as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Feedback has already been submitted for this customer session.",
            ) from exc
        except SQLAlchemyError as exc:
            self.db.rollback()
            logger.exception("Unable to create feedback for customer session %s", payload.session_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to create feedback due to a database error.",
            ) from exc

    def list_feedback(self, *, page: int, page_size: int, rating: int | None) -> dict:
        try:
            feedback_items, total_items = self.repo.list_feedback(
                page=page, page_size=page_size, rating=rating
            )
        except SQLAlchemyError as exc:
            logger.exception("Unable to list feedback")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to retrieve feedback due to a database error.",
            ) from exc
        return {
            "items": [self._to_detail_response(item) for item in feedback_items],
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": (total_items + page_size - 1) // page_size if total_items else 0,
        }

    def get_feedback(self, feedback_id: int) -> FeedbackDetailResponse:
        try:
            feedback = self.repo.get_by_id(feedback_id)
        except SQLAlchemyError as exc:
            logger.exception("Unable to retrieve feedback %s", feedback_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to retrieve feedback due to a database error.",
            ) from exc
        if feedback is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found.")
        return self._to_detail_response(feedback)

    def delete_feedback(self, feedback_id: int) -> dict:
        feedback = self.get_feedback_entity(feedback_id)
        try:
            self.repo.delete(feedback)
        except SQLAlchemyError as exc:
            self.db.rollback()
            logger.exception("Unable to delete feedback %s", feedback_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to delete feedback due to a database error.",
            ) from exc
        return {"message": "Feedback deleted successfully."}

    def get_feedback_entity(self, feedback_id: int) -> Feedback:
        try:
            feedback = self.repo.get_by_id(feedback_id)
        except SQLAlchemyError as exc:
            logger.exception("Unable to retrieve feedback %s", feedback_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to retrieve feedback due to a database error.",
            ) from exc
        if feedback is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found.")
        return feedback

    @staticmethod
    def _to_detail_response(feedback: Feedback) -> FeedbackDetailResponse:
        customer_session = feedback.session
        return FeedbackDetailResponse(
            id=feedback.id,
            session_id=feedback.session_id,
            customer_name=customer_session.name,
            customer_email=customer_session.email,
            table_number=customer_session.table.table_number,
            rating=feedback.rating,
            comment=feedback.comment,
            submitted_at=feedback.created_at,
        )
