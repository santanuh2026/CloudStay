from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from uuid import uuid4
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CloudStay Payment Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

payments = []


class PaymentRequest(BaseModel):
    booking_id: int
    amount: float = Field(gt=0)
    payment_method: str


@app.get("/")
def home():
    return {
        "message": "Welcome to CloudStay Payment Service"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "payment-service"
    }


@app.post("/payments")
def process_payment(request: PaymentRequest):

    payment = {
        "transaction_id": str(uuid4()),
        "booking_id": request.booking_id,
        "amount": request.amount,
        "payment_method": request.payment_method,
        "status": "SUCCESS"
    }

    payments.append(payment)

    return {
        "message": "Payment processed successfully",
        "payment": payment
    }


@app.get("/payments")
def get_payments():
    return {"payments": payments}