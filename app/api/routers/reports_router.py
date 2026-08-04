import logging
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.database import get_db
from app.schemas.reports import (
    ChartResponse, DailyReportResponse, DateRangeReportResponse, FileReportResponse,
    MonthlyReportResponse, YearlyReportResponse,
)
from app.services.reports_service import ReportsService

logger = logging.getLogger("restaurant_management.reports")
router = APIRouter(prefix="/admin", tags=["reports"])
ERROR_RESPONSES = {401: {"description": "Missing or invalid JWT."}, 403: {"description": "Admin role required."}, 422: {"description": "Invalid report parameters."}, 500: {"description": "Database or report-generation failure."}}


def _service(db: Session) -> ReportsService:
    return ReportsService(db)


def _validate_date(value: date) -> date:
    if value > date.today():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Future dates are not allowed.")
    return value


def _validate_year(year: int) -> int:
    if year < 2000 or year > date.today().year:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Year must be between 2000 and the current year.")
    return year


def _validate_month(year: int, month: int) -> tuple[int, int]:
    _validate_year(year)
    if not 1 <= month <= 12:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Month must be between 1 and 12.")
    if (year, month) > (date.today().year, date.today().month):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Future months are not allowed.")
    return year, month


@router.get("/reports/daily", response_model=DailyReportResponse, summary="Get daily report", description="Admin-only daily operational and revenue report for a non-future date.", responses=ERROR_RESPONSES)
def daily_report(report_date: date = Query(..., alias="date"), db: Session = Depends(get_db), _: object = Depends(require_admin)) -> DailyReportResponse:
    report_date = _validate_date(report_date); logger.info("reports.daily date=%s", report_date)
    return DailyReportResponse(**_service(db).daily(report_date))


@router.get("/reports/monthly", response_model=MonthlyReportResponse, summary="Get monthly report", description="Admin-only monthly sales, billing, customer-feedback, and item/category report.", responses=ERROR_RESPONSES)
def monthly_report(year: int = Query(...), month: int = Query(...), db: Session = Depends(get_db), _: object = Depends(require_admin)) -> MonthlyReportResponse:
    year, month = _validate_month(year, month); logger.info("reports.monthly year=%s month=%s", year, month)
    return MonthlyReportResponse(**_service(db).monthly(year, month))


@router.get("/reports/yearly", response_model=YearlyReportResponse, summary="Get yearly report", description="Admin-only annual report with a complete month-by-month paid-sales series.", responses=ERROR_RESPONSES)
def yearly_report(year: int = Query(...), db: Session = Depends(get_db), _: object = Depends(require_admin)) -> YearlyReportResponse:
    year = _validate_year(year); logger.info("reports.yearly year=%s", year)
    return YearlyReportResponse(**_service(db).yearly(year))


@router.get("/reports", response_model=DateRangeReportResponse, summary="Get report for a date range", description="Admin-only aggregate report from the inclusive `from` date through the inclusive `to` date.", responses=ERROR_RESPONSES)
def date_range_report(from_date: date = Query(..., alias="from"), to_date: date = Query(..., alias="to"), db: Session = Depends(get_db), _: object = Depends(require_admin)) -> DateRangeReportResponse:
    from_date, to_date = _validate_date(from_date), _validate_date(to_date)
    if from_date > to_date: raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="The 'from' date must not be after the 'to' date.")
    logger.info("reports.range from=%s to=%s", from_date, to_date)
    return DateRangeReportResponse(**_service(db).date_range(from_date, to_date))


@router.get("/reports/monthly/pdf", response_model=FileReportResponse, summary="Generate monthly PDF report", description="Admin-only ReportLab export stored in `uploads/reports/`.", responses=ERROR_RESPONSES)
def monthly_pdf(year: int = Query(...), month: int = Query(...), db: Session = Depends(get_db), _: object = Depends(require_admin)) -> FileReportResponse:
    year, month = _validate_month(year, month); logger.info("reports.monthly_pdf year=%s month=%s", year, month)
    return FileReportResponse(**_service(db).monthly_pdf(year, month))


@router.get("/reports/monthly/excel", response_model=FileReportResponse, summary="Generate monthly Excel report", description="Admin-only openpyxl export stored in `uploads/reports/`.", responses=ERROR_RESPONSES)
def monthly_excel(year: int = Query(...), month: int = Query(...), db: Session = Depends(get_db), _: object = Depends(require_admin)) -> FileReportResponse:
    year, month = _validate_month(year, month); logger.info("reports.monthly_excel year=%s month=%s", year, month)
    return FileReportResponse(**_service(db).monthly_excel(year, month))


@router.get("/charts/revenue", response_model=ChartResponse, summary="Get revenue chart data", description="Admin-only monthly paid-revenue series for the requested year.", responses=ERROR_RESPONSES)
def revenue_chart(year: int = Query(default_factory=lambda: date.today().year), db: Session = Depends(get_db), _: object = Depends(require_admin)) -> ChartResponse:
    year = _validate_year(year); logger.info("charts.revenue year=%s", year)
    return ChartResponse(**_service(db).chart_revenue(year))


@router.get("/charts/top-items", response_model=ChartResponse, summary="Get top-items chart data", description="Admin-only top five ordered items for the requested year.", responses=ERROR_RESPONSES)
def top_items_chart(year: int = Query(default_factory=lambda: date.today().year), db: Session = Depends(get_db), _: object = Depends(require_admin)) -> ChartResponse:
    year = _validate_year(year); logger.info("charts.top_items year=%s", year)
    return ChartResponse(**_service(db).chart_top_items(year))


@router.get("/charts/top-categories", response_model=ChartResponse, summary="Get top-categories chart data", description="Admin-only top five ordered categories for the requested year.", responses=ERROR_RESPONSES)
def top_categories_chart(year: int = Query(default_factory=lambda: date.today().year), db: Session = Depends(get_db), _: object = Depends(require_admin)) -> ChartResponse:
    year = _validate_year(year); logger.info("charts.top_categories year=%s", year)
    return ChartResponse(**_service(db).chart_top_categories(year))


@router.get("/charts/order-status", response_model=ChartResponse, summary="Get order-status chart data", description="Admin-only order-status counts for the requested year.", responses=ERROR_RESPONSES)
def order_status_chart(year: int = Query(default_factory=lambda: date.today().year), db: Session = Depends(get_db), _: object = Depends(require_admin)) -> ChartResponse:
    year = _validate_year(year); logger.info("charts.order_status year=%s", year)
    return ChartResponse(**_service(db).chart_order_status(year))


@router.get("/charts/ratings", response_model=ChartResponse, summary="Get ratings chart data", description="Admin-only 1–5 star feedback distribution for the requested year.", responses=ERROR_RESPONSES)
def ratings_chart(year: int = Query(default_factory=lambda: date.today().year), db: Session = Depends(get_db), _: object = Depends(require_admin)) -> ChartResponse:
    year = _validate_year(year); logger.info("charts.ratings year=%s", year)
    return ChartResponse(**_service(db).chart_ratings(year))
