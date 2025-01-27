from fastapi import FastAPI

app = FastAPI()

# import routes
from routes.translator import router as translator_router

# include routers
app.include_router(translator_router)

if __name__ == "__main__":
    import uvicorn # type: ignore
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload = True)
