from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
import os
import sqlite3
import hashlib
import secrets
import datetime

app = FastAPI(title="TYUT Robot Team Recruit 2026")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
app.mount("/images", StaticFiles(directory=os.path.join(BASE_DIR, "images")), name="images")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

DB_PATH = os.path.join(BASE_DIR, "likes.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            created_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS guestbook (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            is_deleted INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()


init_db()


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        return None
    conn = get_db()
    row = conn.execute(
        """SELECT u.id, u.username, u.email FROM users u
           JOIN sessions s ON u.id = s.user_id
           WHERE s.token = ?""",
        (token,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_client_ip(request: Request):
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ── Page routes ──────────────────────────────────────────────

@app.get("/")
async def index(request: Request):
    user = get_current_user(request)
    return templates.TemplateResponse("index.html", {"request": request, "page": "index", "user": user})


@app.get("/organization")
async def organization(request: Request):
    user = get_current_user(request)
    return templates.TemplateResponse("organization.html", {"request": request, "page": "organization", "user": user})


@app.get("/training")
async def training(request: Request):
    user = get_current_user(request)
    return templates.TemplateResponse("training.html", {"request": request, "page": "training", "user": user})


@app.get("/research")
async def research(request: Request):
    user = get_current_user(request)
    return templates.TemplateResponse("research.html", {"request": request, "page": "research", "user": user})


@app.get("/guestbook")
async def guestbook(request: Request):
    user = get_current_user(request)
    return templates.TemplateResponse("guestbook.html", {"request": request, "page": "guestbook", "user": user})

@app.get("/history")
async def history(request: Request):
    user = get_current_user(request)
    return templates.TemplateResponse("history.html", {"request": request, "page": "history", "user": user})


# ── Likes API ────────────────────────────────────────────────

@app.get("/api/likes")
async def get_likes(request: Request):
    conn = get_db()
    total = conn.execute("SELECT COALESCE(SUM(count), 0) FROM likes").fetchone()[0]
    conn.close()
    return {"total": total}


@app.post("/api/like")
async def like(request: Request):
    ip = get_client_ip(request)
    today = datetime.date.today().isoformat()
    conn = get_db()
    row = conn.execute("SELECT count FROM likes WHERE ip = ? AND date = ?", (ip, today)).fetchone()
    if row and row["count"] >= 5:
        conn.close()
        return JSONResponse({"error": "今日点赞次数已达上限（5次）", "remaining": 0}, status_code=429)

    if row:
        conn.execute("UPDATE likes SET count = count + 1 WHERE ip = ? AND date = ?", (ip, today))
    else:
        conn.execute("INSERT INTO likes (ip, date, count) VALUES (?, ?, 1)", (ip, today))
    conn.commit()
    total_row = conn.execute("SELECT COALESCE(SUM(count), 0) FROM likes").fetchone()
    total = total_row[0] if total_row else 0
    remaining = 5 - (row["count"] + 1) if row else 4
    conn.close()
    return {"total": total, "remaining": remaining}


# ── Auth APIs ────────────────────────────────────────────────

@app.post("/api/register")
async def register(request: Request):
    data = await request.json()
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not username or not email or not password:
        return JSONResponse({"error": "所有字段都是必填的"}, status_code=400)
    if len(username) < 2 or len(username) > 20:
        return JSONResponse({"error": "用户名长度需在2-20个字符之间"}, status_code=400)
    if len(password) < 6:
        return JSONResponse({"error": "密码长度至少6位"}, status_code=400)

    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    if existing:
        conn.close()
        return JSONResponse({"error": "用户名已被注册"}, status_code=400)

    password_hash = hash_password(password)
    now = datetime.datetime.now().isoformat()
    conn.execute(
        "INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
        (username, email, password_hash, now)
    )
    conn.commit()
    conn.close()
    return {"message": "注册成功"}


@app.post("/api/login")
async def login(request: Request, response: Response):
    data = await request.json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return JSONResponse({"error": "用户名和密码不能为空"}, status_code=400)

    password_hash = hash_password(password)
    conn = get_db()
    user = conn.execute(
        "SELECT id, username FROM users WHERE username = ? AND password_hash = ?",
        (username, password_hash)
    ).fetchone()

    if not user:
        conn.close()
        return JSONResponse({"error": "用户名或密码错误"}, status_code=400)

    token = secrets.token_hex(32)
    now = datetime.datetime.now().isoformat()
    conn.execute("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)", (token, user["id"], now))
    conn.commit()
    conn.close()

    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        max_age=86400 * 30,
        samesite="lax"
    )
    return {"username": user["username"]}


@app.post("/api/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        conn = get_db()
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
        conn.close()
    response.delete_cookie("session_token")
    return {"message": "已登出"}


@app.get("/api/me")
async def me(request: Request):
    user = get_current_user(request)
    if not user:
        return JSONResponse({"error": "未登录"}, status_code=401)
    return {"username": user["username"], "email": user["email"]}


# ── Guestbook APIs ───────────────────────────────────────────

@app.get("/api/guestbook")
async def list_guestbook(request: Request):
    user = get_current_user(request)
    conn = get_db()
    rows = conn.execute(
        """SELECT g.id, g.content, g.created_at, g.is_deleted, u.username
           FROM guestbook g JOIN users u ON g.user_id = u.id
           WHERE g.is_deleted = 0
           ORDER BY g.created_at DESC"""
    ).fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "content": r["content"],
            "created_at": r["created_at"],
            "username": r["username"],
            "is_owner": user is not None and user["username"] == r["username"]
        }
        for r in rows
    ]


@app.post("/api/guestbook")
async def create_guestbook(request: Request):
    user = get_current_user(request)
    if not user:
        return JSONResponse({"error": "请先登录"}, status_code=401)

    data = await request.json()
    content = data.get("content", "").strip()
    if not content:
        return JSONResponse({"error": "留言不能为空"}, status_code=400)
    if len(content) > 2000:
        return JSONResponse({"error": "留言长度不能超过2000字"}, status_code=400)

    conn = get_db()
    now = datetime.datetime.now().isoformat()
    conn.execute(
        "INSERT INTO guestbook (user_id, content, created_at) VALUES (?, ?, ?)",
        (user["id"], content, now)
    )
    conn.commit()
    conn.close()
    return {"message": "留言成功"}


@app.delete("/api/guestbook/{id}")
async def delete_guestbook(id: int, request: Request):
    user = get_current_user(request)
    if not user:
        return JSONResponse({"error": "请先登录"}, status_code=401)

    conn = get_db()
    row = conn.execute("SELECT user_id FROM guestbook WHERE id = ? AND is_deleted = 0", (id,)).fetchone()
    if not row:
        conn.close()
        return JSONResponse({"error": "留言不存在"}, status_code=404)
    if row["user_id"] != user["id"]:
        conn.close()
        return JSONResponse({"error": "只能删除自己的留言"}, status_code=403)

    conn.execute("UPDATE guestbook SET is_deleted = 1 WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return {"message": "已删除"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
