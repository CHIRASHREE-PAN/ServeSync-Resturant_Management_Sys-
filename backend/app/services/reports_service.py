import logging
from calendar import month_name
from datetime import date, datetime, timedelta
from pathlib import Path

from fastapi import HTTPException, status
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.repositories.reports_repository import ReportsRepository

logger = logging.getLogger("restaurant_management.reports")
PROJECT_ROOT = Path(__file__).resolve().parents[2]
REPORT_DIRECTORY = PROJECT_ROOT / "uploads" / "reports"


class ReportsService:
    def __init__(self, db: Session):
        self.repo = ReportsRepository(db)

    def daily(self, report_date: date) -> dict:
        return self._build_report(report_date, report_date, include_sessions=True, report_date=report_date)

    def monthly(self, year: int, month: int) -> dict:
        start, end = date(year, month, 1), self._month_end(year, month)
        data = self._build_report(start, end)
        return {"month": month_name[month], "year": year, "total_orders": data["orders"], "completed_orders": data["completed_orders"], **{key: data[key] for key in ("revenue", "bills_generated", "bills_paid", "average_order_value", "top_category", "feedback_count", "average_rating")}, "top_item": data["most_ordered_item"]}

    def yearly(self, year: int) -> dict:
        try:
            start, end = date(year, 1, 1), date(year, 12, 31)
            report = self._build_report(start, end)
            sales = self.repo.monthly_sales(year)
        except SQLAlchemyError as exc:
            raise self._database_error("retrieve yearly report", exc)
        return {"year": year, "total_revenue": report["revenue"], "total_orders": report["orders"], "average_rating": report["average_rating"], "monthly_sales": [{"month": month_name[month], "revenue": self._money(sales.get(month, (0, 0))[0]), "orders": sales.get(month, (0, 0))[1]} for month in range(1, 13)]}

    def date_range(self, start: date, end: date) -> dict:
        data = self._build_report(start, end, include_sessions=True)
        return {"from_date": start, "to_date": end, "orders": data["orders"], "revenue": data["revenue"], "paid_bills": data["bills_paid"], "average_rating": data["average_rating"], "most_ordered_item": data["most_ordered_item"], "top_category": data["top_category"], "average_order_value": data["average_order_value"], "customer_sessions": data["customer_sessions"]}

    def chart_revenue(self, year: int) -> dict:
        try:
            sales = self.repo.monthly_sales(year)
        except SQLAlchemyError as exc:
            raise self._database_error("retrieve revenue chart", exc)
        return {"labels": [month_name[index][:3] for index in range(1, 13)], "values": [self._money(sales.get(index, (0, 0))[0]) for index in range(1, 13)]}

    def chart_top_items(self, year: int) -> dict:
        return self._top_chart(year, self.repo.top_items, "top-items chart")

    def chart_top_categories(self, year: int) -> dict:
        return self._top_chart(year, self.repo.top_categories, "top-categories chart")

    def chart_order_status(self, year: int) -> dict:
        labels = [("ORDER_RECEIVED", "Order Received"), ("PREPARING", "Preparing"), ("READY_TO_SERVE", "Ready To Serve"), ("SERVED", "Served")]
        try:
            counts = self.repo.order_status_counts(year)
        except SQLAlchemyError as exc:
            raise self._database_error("retrieve order-status chart", exc)
        return {"labels": [label for _, label in labels], "values": [counts.get(key, 0) for key, _ in labels]}

    def chart_ratings(self, year: int) -> dict:
        try:
            counts = self.repo.rating_counts(year)
        except SQLAlchemyError as exc:
            raise self._database_error("retrieve ratings chart", exc)
        return {"labels": [f"{rating} Star" for rating in range(1, 6)], "values": [counts.get(rating, 0) for rating in range(1, 6)]}

    def monthly_pdf(self, year: int, month: int) -> dict:
        report, start, end = self._monthly_export_data(year, month)
        output = REPORT_DIRECTORY / f"{month_name[month]}_{year}_Report.pdf"
        try:
            REPORT_DIRECTORY.mkdir(parents=True, exist_ok=True)
            styles = getSampleStyleSheet()
            content = [Paragraph("Restaurant Management System", styles["Title"]), Paragraph("[Restaurant Logo]", styles["Normal"]), Spacer(1, 6 * mm), Paragraph(f"Monthly Performance Report — {month_name[month]} {year}", styles["Heading2"])]
            summary = [["Metric", "Value"], ["Revenue", f"₹{report['revenue']:.2f}"], ["Paid bills", str(report["bills_paid"])], ["Orders", str(report["total_orders"])], ["Average order value", f"₹{report['average_order_value']:.2f}"], ["Average rating", str(report["average_rating"] if report["average_rating"] is not None else "No feedback")], ["Feedback count", str(report["feedback_count"])]]
            table = Table(summary, colWidths=[75 * mm, 75 * mm])
            table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7B1E1E")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), 0.5, colors.grey), ("PADDING", (0, 0), (-1, -1), 6)]))
            content += [Spacer(1, 5 * mm), table, Spacer(1, 5 * mm), Paragraph("Top Selling Items", styles["Heading3"]), Paragraph(self._ranked_text(self.repo.top_items(start, end, 5)), styles["Normal"]), Paragraph("Top Categories", styles["Heading3"]), Paragraph(self._ranked_text(self.repo.top_categories(start, end, 5)), styles["Normal"]), Spacer(1, 5 * mm), Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"])]
            SimpleDocTemplate(str(output), pagesize=A4, rightMargin=20 * mm, leftMargin=20 * mm).build(content)
        except Exception as exc:
            logger.exception("reports.monthly_pdf_failed year=%s month=%s", year, month)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to generate monthly PDF report.") from exc
        return {"pdf_path": output.relative_to(PROJECT_ROOT).as_posix()}

    def monthly_excel(self, year: int, month: int) -> dict:
        report, start, end = self._monthly_export_data(year, month)
        output = REPORT_DIRECTORY / f"{month_name[month]}_{year}_Report.xlsx"
        try:
            from openpyxl import Workbook
            from openpyxl.styles import Font
            REPORT_DIRECTORY.mkdir(parents=True, exist_ok=True)
            workbook = Workbook()
            sheet = workbook.active
            sheet.title = "Monthly Report"
            rows = [("Restaurant Management System", ""), ("Monthly Report", f"{month_name[month]} {year}"), ("Revenue", report["revenue"]), ("Orders", report["total_orders"]), ("Paid Bills", report["bills_paid"]), ("Average Order Value", report["average_order_value"]), ("Average Rating", report["average_rating"]), ("Feedback Count", report["feedback_count"]), ("Top Selling Items", self._ranked_text(self.repo.top_items(start, end, 5))), ("Top Categories", self._ranked_text(self.repo.top_categories(start, end, 5))), ("Generated Date", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))]
            for row in rows: sheet.append(row)
            sheet["A1"].font = Font(bold=True, size=14); sheet.column_dimensions["A"].width = 24; sheet.column_dimensions["B"].width = 60
            workbook.save(output)
        except Exception as exc:
            logger.exception("reports.monthly_excel_failed year=%s month=%s", year, month)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to generate monthly Excel report.") from exc
        return {"excel_path": output.relative_to(PROJECT_ROOT).as_posix()}

    def _build_report(self, start: date, end: date, include_sessions: bool = False, report_date: date | None = None) -> dict:
        try:
            orders, bills, feedback = self.repo.order_summary(start, end), self.repo.bill_summary(start, end), self.repo.feedback_summary(start, end)
            top_item, top_category = self.repo.top_items(start, end), self.repo.top_categories(start, end)
            sessions = self.repo.session_summary(start, end) if include_sessions else {}
        except SQLAlchemyError as exc:
            raise self._database_error("retrieve report", exc)
        return {"date": report_date, **orders, **bills, **feedback, **sessions, "average_order_value": self._money(bills["revenue"] / bills["bills_paid"]) if bills["bills_paid"] else 0.0, "most_ordered_item": top_item[0][0] if top_item else None, "top_category": top_category[0][0] if top_category else None, "average_rating": round(float(feedback["average_rating"]), 2) if feedback["average_rating"] is not None else None}

    def _monthly_export_data(self, year: int, month: int) -> tuple[dict, date, date]:
        start, end = date(year, month, 1), self._month_end(year, month)
        return self.monthly(year, month), start, end

    def _top_chart(self, year: int, method, label: str) -> dict:
        try:
            rows = method(date(year, 1, 1), date(year, 12, 31), 5)
        except SQLAlchemyError as exc:
            raise self._database_error(f"retrieve {label}", exc)
        return {"labels": [row[0] for row in rows], "values": [row[1] for row in rows]}

    @staticmethod
    def _month_end(year: int, month: int) -> date:
        return date(year + 1, 1, 1) - timedelta(days=1) if month == 12 else date(year, month + 1, 1) - timedelta(days=1)

    @staticmethod
    def _money(value) -> float: return round(float(value or 0), 2)

    @staticmethod
    def _ranked_text(rows: list[tuple[str, int]]) -> str: return ", ".join(f"{name} ({quantity})" for name, quantity in rows) or "No data"

    @staticmethod
    def _database_error(operation: str, exc: Exception) -> HTTPException:
        logger.exception("reports.database_error operation=%s", operation)
        return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unable to {operation} due to a database error.")
