
const API = {
    user: "http://localhost:8001",
    hotel: "http://localhost:8002",
    booking: "http://localhost:8003",
    payment: "http://localhost:8004"
};

let selectedHotel = null;
let currentBooking = null;

// Utility: display errors
function showStatus(message, isError = false) {
    const status = document.getElementById("hotelStatus");
    status.textContent = message;
    status.style.color = isError ? "#c0392b" : "#176b60";
}

// Load hotels from Hotel Service
async function loadHotels() {
    const container = document.getElementById("hotelList");
    const city = document.getElementById("citySearch")
        .value.trim().toLowerCase();

    showStatus("Loading hotels...");
    container.innerHTML = "";

    try {
        const response = await fetch(`${API.hotel}/hotels`);

        if (!response.ok) {
            throw new Error("Unable to retrieve hotels");
        }

        const data = await response.json();

        const hotels = data.hotels || [];

        const filtered = hotels.filter(hotel =>
            hotel.city.toLowerCase().includes(city)
        );

        if (filtered.length === 0) {
            showStatus("No hotels found for this destination.");
            return;
        }

        showStatus(`${filtered.length} hotel(s) available`);

        filtered.forEach(hotel => {
            const card = document.createElement("div");
            card.className = "hotel-card";

            const art = document.createElement("div");
            art.className = "hotel-art";
            art.textContent = "🏨";

            const name = document.createElement("h3");
            name.textContent = hotel.name;

            const location = document.createElement("p");
            location.className = "hotel-city";
            location.textContent = hotel.city;

            const price = document.createElement("p");
            price.className = "hotel-price";
            price.textContent = `₹${Number(hotel.price).toLocaleString("en-IN")}`;

            const perNight = document.createElement("small");
            perNight.textContent = " / night";
            price.appendChild(perNight);

            const button = document.createElement("button");
            button.className = "primary-btn";
            button.textContent = "Book this hotel";

            button.addEventListener("click", () => {
                selectHotel(hotel);
            });

            card.append(art, name, location, price, button);
            container.appendChild(card);
        });

    } catch (error) {
        showStatus(
            "Hotel Service is unavailable. Please try again.",
            true
        );
        console.error(error);
    }
}

// Select hotel
function selectHotel(hotel) {
    selectedHotel = hotel;

    document.getElementById("hotelId").value = hotel.id;
    document.getElementById("selectedHotel").value =
        `${hotel.name} - ${hotel.city}`;

    document.getElementById("booking").scrollIntoView({
        behavior: "smooth"
    });
}

// Date validation
const today = new Date().toISOString().split("T")[0];

document.getElementById("checkIn").min = today;
document.getElementById("checkOut").min = today;

document.getElementById("checkIn").addEventListener("change", () => {
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut");

    checkOut.min = checkIn;

    if (checkOut.value && checkOut.value <= checkIn) {
        checkOut.value = "";
    }
});

// Create booking through Booking Service
document.getElementById("bookingForm").addEventListener(
    "submit",
    async function(event) {
        event.preventDefault();

        if (!selectedHotel) {
            alert("Please select a hotel first.");
            return;
        }

        const checkIn = document.getElementById("checkIn").value;
        const checkOut = document.getElementById("checkOut").value;

        if (checkOut <= checkIn) {
            alert("Check-out must be after check-in.");
            return;
        }

        const payload = {
            user_id: Number(document.getElementById("userId").value),
            hotel_id: Number(selectedHotel.id),
            check_in: checkIn,
            check_out: checkOut
        };

        try {
            const response = await fetch(
                `${API.booking}/bookings`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Booking failed");
            }

            currentBooking = data.booking;

            document.getElementById("bookingSummary").textContent =
                `Booking #${currentBooking.booking_id} | ` +
                `${currentBooking.hotel_name} | ` +
                `₹${Number(selectedHotel.price).toLocaleString("en-IN")} per night`;

            document.getElementById("paymentSection")
                .classList.remove("hidden");

            document.getElementById("paymentSection")
                .scrollIntoView({ behavior: "smooth" });

        } catch (error) {
            alert(`Booking error: ${error.message}`);
            console.error(error);
        }
    }
);

// Process simulated payment through Payment Service
document.getElementById("payButton").addEventListener(
    "click",
    async function() {
        if (!currentBooking || !selectedHotel) {
            alert("Please create a booking first.");
            return;
        }

        const button = document.getElementById("payButton");
        button.disabled = true;
        button.textContent = "Processing...";

        const checkIn = new Date(currentBooking.check_in);
        const checkOut = new Date(currentBooking.check_out);

        const nights = Math.round(
            (checkOut - checkIn) / (1000 * 60 * 60 * 24)
        );

        const totalAmount = Number(selectedHotel.price) * nights;

        try {
            const response = await fetch(
                `${API.payment}/payments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        booking_id: currentBooking.booking_id,
                        amount: totalAmount,
                        payment_method:
                            document.getElementById("paymentMethod").value
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Payment failed");
            }

            document.getElementById("paymentSection")
                .classList.add("hidden");

            document.getElementById("confirmationDetails").textContent =
                `Booking ID: ${currentBooking.booking_id} | ` +
                `Transaction ID: ${data.payment.transaction_id} | ` +
                `Total: ₹${totalAmount.toLocaleString("en-IN")} | ` +
                `Status: ${data.payment.status}`;

            document.getElementById("confirmation")
                .classList.remove("hidden");

            document.getElementById("confirmation")
                .scrollIntoView({ behavior: "smooth" });

        } catch (error) {
            alert(`Payment error: ${error.message}`);
            console.error(error);

        } finally {
            button.disabled = false;
            button.textContent = "Pay now";
        }
    }
);

// Reset booking form
function resetBooking() {
    selectedHotel = null;
    currentBooking = null;

    document.getElementById("bookingForm").reset();
    document.getElementById("hotelId").value = "";
    document.getElementById("paymentSection").classList.add("hidden");
    document.getElementById("confirmation").classList.add("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Load hotels when application opens
loadHotels();
