from collections.abc import Generator
import os
from pathlib import Path
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlalchemy import Boolean, Column, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker


def load_env_file() -> None:
    env_path = Path(__file__).with_name(".env.local")
    if not env_path.exists():
        return

    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


load_env_file()


# DB 설정
DATABASE_URL = os.environ["DATABASE_URL"]
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# DB 모델 (테이블 구조 정의)
class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, nullable=False, default=False)


# Pydantic 스키마 (요청/응답 데이터 구조 정의)
class TodoCreate(BaseModel):
    title: str
    completed: bool = False


class TodoUpdate(BaseModel):
    title: str
    completed: bool


class TodoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    completed: bool


# 테이블 생성
Base.metadata.create_all(bind=engine)

# FastAPI 앱 생성
app = FastAPI(title="Todo API")

TodoFilter = Literal["all", "active", "completed"]

# FastAPI 앱 미들웨어 및 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.environ["FRONTEND_ORIGINS"].split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# DB 세션 의존성
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def build_todo_query(db: Session, filter: TodoFilter, search: str | None = None):
    query = db.query(Todo)

    if filter == "active":
        query = query.filter(Todo.completed.is_(False))
    elif filter == "completed":
        query = query.filter(Todo.completed.is_(True))

    if search:
        query = query.filter(Todo.title.ilike(f"%{search}%"))

    return query.order_by(Todo.id)


# 엔드포인트 구현
@app.get("/todos", response_model=list[TodoResponse])
def get_todos(
    filter: Annotated[TodoFilter, Query()] = "all",
    db: Session = Depends(get_db),
) -> list[Todo]:
    return build_todo_query(db, filter).all()


@app.get("/todos/search", response_model=list[TodoResponse])
def search_todos(
    search: Annotated[str, Query(min_length=1)],
    filter: Annotated[TodoFilter, Query()] = "all",
    db: Session = Depends(get_db),
) -> list[Todo]:
    return build_todo_query(db, filter, search).all()


@app.post(
    "/todos",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)) -> Todo:
    db_todo = Todo(title=todo.title, completed=todo.completed)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int, todo: TodoUpdate, db: Session = Depends(get_db)
) -> Todo:
    db_todo = db.get(Todo, todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    db_todo.title = todo.title
    db_todo.completed = todo.completed
    db.commit()
    db.refresh(db_todo)
    return db_todo


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)) -> Response:
    db_todo = db.get(Todo, todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    db.delete(db_todo)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
