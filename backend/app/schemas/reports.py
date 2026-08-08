from datetime import date

from pydantic import BaseModel


class DailyReportResponse(BaseModel):
    date: date
    orders: int
    revenue: float
    bills_generated: int
    bills_paid: int
    active_sessions: int
    completed_sessions: int
    average_order_value: float
    most_ordered_item: str | None
    top_category: str | None
    feedback_count: int
    average_rating: float | None


class MonthlyReportResponse(BaseModel):
    month: str
    year: int
    total_orders: int
    completed_orders: int
    revenue: float
    bills_generated: int
    bills_paid: int
    average_order_value: float
    top_item: str | None
    top_category: str | None
    feedback_count: int
    average_rating: float | None


class MonthlySalesItem(BaseModel):
    month: str
    revenue: float
    orders: int


class YearlyReportResponse(BaseModel):
    year: int
    total_revenue: float
    total_orders: int
    average_rating: float | None
    monthly_sales: list[MonthlySalesItem]


class DateRangeReportResponse(BaseModel):
    from_date: date
    to_date: date
    orders: int
    revenue: float
    paid_bills: int
    average_rating: float | None
    most_ordered_item: str | None
    top_category: str | None
    average_order_value: float
    customer_sessions: int


class FileReportResponse(BaseModel):
    pdf_path: str | None = None
    excel_path: str | None = None


class ChartResponse(BaseModel):
    labels: list[str]
<<<<<<< HEAD:backend/app/schemas/reports.py
    values: list[float | int]
=======
    values: list[float | int]
>>>>>>> 463124af02341a26f11446ceb35802d78cace07e:app/schemas/reports.py
