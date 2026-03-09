from sqlalchemy import Column, Integer, Text, Float, String
from database import Base

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(Text)
    ai_response = Column(Text)
    severity = Column(String)  # To store "High", "Moderate", or "Low"