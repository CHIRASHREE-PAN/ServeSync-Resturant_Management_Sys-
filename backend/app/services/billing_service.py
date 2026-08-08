import logging
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

from fastapi import HTTPException, status
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.exceptions import SmtpDeliveryError
from app.models import Bill, CustomerSession
from app.repositories.billing_repository import BillingRepository
from app.schemas.billing import BillResponse, BilledOrderItemResponse
from app.services.email_service import EmailService

logger = logging.getLogger("restaurant_management.billing")

TAX_RATE = Decimal("0.025")
MONEY_QUANTUM = Decimal("0.01")
PROJECT_ROOT = Path(__file__).resolve().parents[2]
INVOICE_DIRECTORY = PROJECT_ROOT / "uploads" / "invoices"


class BillingService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BillingRepository(db)

    def request_bill(self, session_id: int) -> BillResponse:
        invoice_path: Path | None = None
        try:
            customer_session = self.repo.get_session_for_update(session_id)
            if customer_session is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer session not found.")
            if customer_session.status != "ACTIVE":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Bills can only be requested for an ACTIVE customer session.",
                )
            if not customer_session.orders:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No orders found for this customer session.")
            if self.repo.get_bill_by_session_id(session_id) is not None:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A bill already exists for this customer session.")

            subtotal, cgst, sgst, total_tax, grand_total = self._calculate_totals(customer_session)
            bill = self.repo.create_bill(
                session_id=session_id,
                subtotal=subtotal,
                tax=total_tax,
                total=grand_total,
            )
            invoice_path = self._generate_invoice(
                bill=bill,
                customer_session=customer_session,
                subtotal=subtotal,
                cgst=cgst,
                sgst=sgst,
                total_tax=total_tax,
                grand_total=grand_total,
            )
            bill.pdf_path = invoice_path.relative_to(PROJECT_ROOT).as_posix()

            try:
                EmailService.send_invoice_email(customer_session.email, invoice_path, bill.id)
            except Exception as exc:
                raise SmtpDeliveryError("Unable to send invoice email.") from exc

            self.repo.commit()
            return self._to_response(bill, cgst=cgst, sgst=sgst)
        except HTTPException:
            self.db.rollback()
            self._remove_invoice(invoice_path)
            raise
        except SmtpDeliveryError:
            self.db.rollback()
            self._remove_invoice(invoice_path)
            raise
        except SQLAlchemyError as exc:
            self.db.rollback()
            self._remove_invoice(invoice_path)
            logger.exception("Unable to create bill for customer session %s", session_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to create bill due to a database error.",
            ) from exc
        except Exception as exc:
            self.db.rollback()
            self._remove_invoice(invoice_path)
            logger.exception("Unable to generate invoice for customer session %s", session_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to generate invoice.",
            ) from exc

    def get_bill(self, session_id: int) -> BillResponse:
        try:
            bill = self.repo.get_bill_by_session_id(session_id)
        except SQLAlchemyError as exc:
            logger.exception("Unable to retrieve bill for customer session %s", session_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to retrieve bill due to a database error.",
            ) from exc
        if bill is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found.")
        _, cgst, sgst, _, _ = self._calculate_totals(bill.session)
        return self._to_response(bill, cgst=cgst, sgst=sgst)

    def mark_bill_paid(self, bill_id: int) -> BillResponse:
        try:
            bill = self.repo.get_bill_for_update(bill_id)
            if bill is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found.")
            if bill.session is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer session not found.")
            if bill.is_paid:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bill is already paid.")

            bill.is_paid = True
            bill.session.status = "COMPLETED"
            bill.session.ended_at = datetime.utcnow()
            self.repo.commit()
            _, cgst, sgst, _, _ = self._calculate_totals(bill.session)
            return self._to_response(bill, cgst=cgst, sgst=sgst)
        except HTTPException:
            self.db.rollback()
            raise
        except SQLAlchemyError as exc:
            self.db.rollback()
            logger.exception("Unable to mark bill %s as paid", bill_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to update bill due to a database error.",
            ) from exc

    @staticmethod
    def _calculate_totals(customer_session: CustomerSession) -> tuple[Decimal, Decimal, Decimal, Decimal, Decimal]:
        subtotal = sum(
            (Decimal(str(order.total)) for order in customer_session.orders),
            Decimal("0"),
        ).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)
        cgst = (subtotal * TAX_RATE).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)
        sgst = (subtotal * TAX_RATE).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)
        total_tax = cgst + sgst
        grand_total = subtotal + total_tax
        return subtotal, cgst, sgst, total_tax, grand_total

    @staticmethod
    def _invoice_items(customer_session: CustomerSession) -> list[BilledOrderItemResponse]:
        return [
            BilledOrderItemResponse(
                order_id=order.id,
                menu_item_name=item.menu_item.name,
                quantity=item.quantity,
                unit_price=Decimal(str(item.price)).quantize(MONEY_QUANTUM),
                item_total=(Decimal(str(item.price)) * item.quantity).quantize(MONEY_QUANTUM),
            )
            for order in customer_session.orders
            for item in order.order_items
        ]

    def _generate_invoice(
        self,
        *,
        bill: Bill,
        customer_session: CustomerSession,
        subtotal: Decimal,
        cgst: Decimal,
        sgst: Decimal,
        total_tax: Decimal,
        grand_total: Decimal,
    ) -> Path:
        INVOICE_DIRECTORY.mkdir(parents=True, exist_ok=True)
        invoice_path = INVOICE_DIRECTORY / f"invoice_{bill.id}.pdf"
        styles = getSampleStyleSheet()
        story = [
            Paragraph("Restaurant Management System", styles["Title"]),
            Spacer(1, 5 * mm),
            Paragraph(f"Invoice Number: {bill.id}", styles["Normal"]),
            Paragraph(f"Invoice Date &amp; Time: {bill.created_at.strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]),
            Paragraph(f"Customer: {customer_session.name}", styles["Normal"]),
            Paragraph(f"Email: {customer_session.email}", styles["Normal"]),
            Paragraph(f"Table Number: {customer_session.table.table_number}", styles["Normal"]),
            Paragraph(f"Session ID: {customer_session.id}", styles["Normal"]),
            Spacer(1, 6 * mm),
        ]
        rows = [["Item", "Qty", "Unit Price", "Item Total"]]
        for item in self._invoice_items(customer_session):
            rows.append([
                item.menu_item_name,
                str(item.quantity),
                f"{item.unit_price:.2f}",
                f"{item.item_total:.2f}",
            ])
        item_table = Table(rows, colWidths=[75 * mm, 20 * mm, 35 * mm, 35 * mm])
        item_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1F4E78")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F3F6F9")]),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.extend([item_table, Spacer(1, 6 * mm)])
        totals = Table([
            ["Subtotal", f"{subtotal:.2f}"],
            ["CGST (2.5%)", f"{cgst:.2f}"],
            ["SGST (2.5%)", f"{sgst:.2f}"],
            ["Total Tax", f"{total_tax:.2f}"],
            ["Grand Total", f"{grand_total:.2f}"],
        ], colWidths=[50 * mm, 35 * mm], hAlign="RIGHT")
        totals.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#D9EAF7")),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.extend([totals, Spacer(1, 10 * mm), Paragraph("Thank you for dining with us.", styles["Italic"])])
        SimpleDocTemplate(
            str(invoice_path),
            pagesize=A4,
            rightMargin=15 * mm,
            leftMargin=15 * mm,
            topMargin=15 * mm,
            bottomMargin=15 * mm,
        ).build(story)
        return invoice_path

    @staticmethod
    def _remove_invoice(invoice_path: Path | None) -> None:
        if invoice_path is not None:
            try:
                invoice_path.unlink(missing_ok=True)
            except OSError:
                logger.warning("Unable to remove failed invoice file: %s", invoice_path)

    def _to_response(self, bill: Bill, *, cgst: Decimal, sgst: Decimal) -> BillResponse:
        return BillResponse(
            bill_id=bill.id,
            session_id=bill.session_id,
            customer_name=bill.session.name,
            customer_email=bill.session.email,
            table_number=bill.session.table.table_number,
            ordered_items=self._invoice_items(bill.session),
            subtotal=Decimal(str(bill.subtotal)).quantize(MONEY_QUANTUM),
            cgst=cgst,
            sgst=sgst,
            total_tax=Decimal(str(bill.tax)).quantize(MONEY_QUANTUM),
            grand_total=Decimal(str(bill.total)).quantize(MONEY_QUANTUM),
            pdf_path=bill.pdf_path,
            is_paid=bill.is_paid,
            created_at=bill.created_at,
        )
