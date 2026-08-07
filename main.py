from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os

app = FastAPI(title="TYUT Robot Team Recruit 2026")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
app.mount("/images", StaticFiles(directory=os.path.join(BASE_DIR, "images")), name="images")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))


@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "page": "index"})


@app.get("/organization")
async def organization(request: Request):
    return templates.TemplateResponse("organization.html", {"request": request, "page": "organization"})


@app.get("/training")
async def training(request: Request):
    return templates.TemplateResponse("training.html", {"request": request, "page": "training"})


@app.get("/research")
async def research(request: Request):
    return templates.TemplateResponse("research.html", {"request": request, "page": "research"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
