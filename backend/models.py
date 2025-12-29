from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class LogEntry(Base):
    __tablename__ = "log_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hostname: Mapped[str] = mapped_column(String(255), index=True)
    source: Mapped[str] = mapped_column(String(255), index=True)
    level: Mapped[str] = mapped_column(String(32), default="info")
    message: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[DateTime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )