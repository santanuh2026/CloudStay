from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CloudStay Booking Service",
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


HOTEL_SERVICE_URL = "http://localhost:8002"

bookings = []


class BookingRequest(BaseModel):
    user_id: int
    hotel_id: int
    check_in: str
    check_out: str


@app.get("/")
def home():
    return {"message": "Welcome to Booking Service"}


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "booking-service"
    }


@app.post("/bookings")
def create_booking(request: BookingRequest):

    try:
        response = requests.get(
            f"{HOTEL_SERVICE_URL}/hotels/{request.hotel_id}",
            timeout=5
        )
        response.raise_for_status()
        hotel = response.json()

    except requests.RequestException:
        raise HTTPException(
            status_code=503,
            detail="Hotel Service unavailable or hotel not found"
        )

    booking = {
        "booking_id": len(bookings) + 1,
        "user_id": request.user_id,
        "hotel_id": request.hotel_id,
        "hotel_name": hotel["name"],
        "check_in": request.check_in,
        "check_out": request.check_out,
        "status": "CONFIRMED"
    }

    bookings.append(booking)

    return {
        "message": "Booking created successfully",
        "booking": booking
    }


@app.get("/bookings")
def get_bookings():
    return {"bookings": bookings}