from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(
    title="CloudStay Hotel Service",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary in-memory storage
hotels = [
    {
        "id": 1,
        "name": "Taj Palace",
        "city": "Delhi",
        "price": 5000
    },
    {
        "id": 2,
        "name": "ITC Royal Bengal",
        "city": "Kolkata",
        "price": 6500
    }
]


class Hotel(BaseModel):
    name: str
    city: str
    price: float


@app.get("/")
def home():
    return {"message": "Welcome to CloudStay Hotel Service"}


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "hotel-service"
    }


@app.get("/hotels")
def get_hotels():
    return {"hotels": hotels}


@app.get("/hotels/{hotel_id}")
def get_hotel(hotel_id: int):

    for hotel in hotels:
        if hotel["id"] == hotel_id:
            return hotel

    raise HTTPException(
        status_code=404,
        detail="Hotel not found"
    )


@app.post("/hotels")
def create_hotel(hotel: Hotel):

    new_hotel = {
        "id": max(
            [h["id"] for h in hotels],
            default=0
        ) + 1,
        **hotel.model_dump()
    }

    hotels.append(new_hotel)

    return {
        "message": "Hotel created successfully",
        "hotel": new_hotel
    }