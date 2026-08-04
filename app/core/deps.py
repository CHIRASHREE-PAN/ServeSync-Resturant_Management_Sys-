from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import bearer_scheme, create_access_token, decode_access_token, get_bearer_token
from app.database import get_db
from app.models import User
from app.repositories.user_repository import UserRepository
from app.services.customer_session_service import CustomerSessionService
from app.services.waiter_call_service import WaiterCallService


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    token = get_bearer_token(credentials)
    payload = decode_access_token(token)
    try:
        user_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError) as exc:
        raise UnauthorizedError("Invalid JWT") from exc
    user = UserRepository(db).get_user_by_id(user_id)
    if user is None:
        raise UnauthorizedError("Invalid JWT")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive account")
    return user


def require_admin(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    if current_user.role != "admin":
        raise ForbiddenError("Only admin can access this endpoint")
    return current_user


def require_kitchen(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    if current_user.role.upper() != "KITCHEN":
        raise ForbiddenError("Only kitchen users can access this endpoint")
    return current_user


def require_waiter(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    if current_user.role.upper() != "WAITER":
        raise ForbiddenError("Only waiter users can access this endpoint")
    return current_user


def require_role(*roles: str):
    allowed_roles = {role.upper() for role in roles}

    def dependency(current_user: Annotated[User, Depends(get_current_user)]) -> User:
        if current_user.role.upper() not in allowed_roles:
            raise ForbiddenError("Insufficient privileges")
        return current_user

    return dependency


def get_customer_session_service(db: Annotated[Session, Depends(get_db)]) -> CustomerSessionService:
    return CustomerSessionService(db)


def get_waiter_call_service(db: Annotated[Session, Depends(get_db)]) -> WaiterCallService:
    return WaiterCallService(db)
