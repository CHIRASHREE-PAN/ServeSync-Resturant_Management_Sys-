from fastapi import HTTPException, status


class AppError(Exception):
    """Base application error."""


class UserNotFoundError(AppError):
    def __init__(self, message: str = "User not found"):
        self.message = message
        super().__init__(message)


class InactiveAccountError(AppError):
    def __init__(self, message: str = "Inactive account"):
        self.message = message
        super().__init__(message)


class InvalidOtpError(AppError):
    def __init__(self, message: str = "Invalid OTP"):
        self.message = message
        super().__init__(message)


class ExpiredOtpError(AppError):
    def __init__(self, message: str = "Expired OTP"):
        self.message = message
        super().__init__(message)


class OtpAlreadyUsedError(AppError):
    def __init__(self, message: str = "OTP already used"):
        self.message = message
        super().__init__(message)


class DuplicateEmailError(AppError):
    def __init__(self, message: str = "Duplicate email"):
        self.message = message
        super().__init__(message)


class TableNotFoundError(AppError):
    def __init__(self, message: str = "Table not found"):
        self.message = message
        super().__init__(message)


class TableSessionConflictError(AppError):
    def __init__(self, message: str = "Active customer session already exists for the selected table"):
        self.message = message
        super().__init__(message)


class CustomerSessionNotFoundError(AppError):
    def __init__(self, message: str = "Customer session not found"):
        self.message = message
        super().__init__(message)


class InvalidCustomerSessionStateError(AppError):
    def __init__(self, message: str = "Invalid customer session state"):
        self.message = message
        super().__init__(message)


class WaiterCallNotFoundError(AppError):
    def __init__(self, message: str = "Waiter call not found"):
        self.message = message
        super().__init__(message)


class WaiterCallConflictError(AppError):
    def __init__(self, message: str = "An OPEN waiter call already exists for this customer session"):
        self.message = message
        super().__init__(message)


class MenuItemNotFoundError(AppError):
    def __init__(self, message: str = "Menu item not found"):
        self.message = message
        super().__init__(message)


class MenuItemConflictError(AppError):
    def __init__(self, message: str = "Menu item conflict"):
        self.message = message
        super().__init__(message)


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Unauthorized"):
        self.message = message
        super().__init__(message)


class ForbiddenError(AppError):
    def __init__(self, message: str = "Forbidden"):
        self.message = message
        super().__init__(message)


class DatabaseOperationError(AppError):
    def __init__(self, message: str = "Database failure"):
        self.message = message
        super().__init__(message)


class SmtpDeliveryError(AppError):
    def __init__(self, message: str = "SMTP failure"):
        self.message = message
        super().__init__(message)


class AuthTokenError(AppError):
    def __init__(self, message: str = "Invalid or expired JWT"):
        self.message = message
        super().__init__(message)


HTTP_STATUS_MAP = {
    UserNotFoundError: status.HTTP_404_NOT_FOUND,
    InactiveAccountError: status.HTTP_403_FORBIDDEN,
    InvalidOtpError: status.HTTP_400_BAD_REQUEST,
    ExpiredOtpError: status.HTTP_400_BAD_REQUEST,
    OtpAlreadyUsedError: status.HTTP_400_BAD_REQUEST,
    DuplicateEmailError: status.HTTP_409_CONFLICT,
    TableNotFoundError: status.HTTP_404_NOT_FOUND,
    TableSessionConflictError: status.HTTP_409_CONFLICT,
    CustomerSessionNotFoundError: status.HTTP_404_NOT_FOUND,
    InvalidCustomerSessionStateError: status.HTTP_400_BAD_REQUEST,
    WaiterCallNotFoundError: status.HTTP_404_NOT_FOUND,
    WaiterCallConflictError: status.HTTP_409_CONFLICT,
    MenuItemNotFoundError: status.HTTP_404_NOT_FOUND,
    MenuItemConflictError: status.HTTP_409_CONFLICT,
    UnauthorizedError: status.HTTP_401_UNAUTHORIZED,
    ForbiddenError: status.HTTP_403_FORBIDDEN,
    DatabaseOperationError: status.HTTP_500_INTERNAL_SERVER_ERROR,
    SmtpDeliveryError: status.HTTP_500_INTERNAL_SERVER_ERROR,
    AuthTokenError: status.HTTP_401_UNAUTHORIZED,
}


def get_http_exception(error: AppError) -> HTTPException:
    status_code = HTTP_STATUS_MAP.get(type(error), status.HTTP_500_INTERNAL_SERVER_ERROR)
    return HTTPException(status_code=status_code, detail=error.message)
