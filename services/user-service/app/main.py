from fastapi import FastAPI

app = FastAPI(
    title="CloudStay User Service",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to CloudStay User Service"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "user-service"
    }


@app.get("/users")
def get_users():
    return {
        "users": [
            {"id": 1, "name": "John"},
            {"id": 2, "name": "David"}
        ]
    }