from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class LogEntryIn(BaseModel):
    hostname: str
    source: str
    message: str
    level: Optional[str] = Field(default="info")
    timestamp: Optional[datetime] = None


class LogEntryOut(BaseModel):
    id: int
    hostname: str
    source: str
    message: str
    level: str
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True