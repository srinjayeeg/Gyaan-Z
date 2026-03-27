# chat_schemas.py
from pydantic import BaseModel
from typing import Optional, List


class ChatRequest(BaseModel):
    """Schema for single chat message request."""
    message: str
    course_id: str
    step: Optional[int] = 0  # Learning step (0-3) for progressive difficulty
    threshold: Optional[float] = 0.5  # Similarity threshold τ (default 0.5) for out-of-scope detection
    max_tokens: Optional[int] = 1024
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "How do I solve quadratic equations?",
                "course_id": "math101",
                "step": 0,
                "threshold": 0.5,
                "max_tokens": 1024
            }
        }


class ChatMessage(BaseModel):
    """Schema for individual message in conversation."""
    role: str  # "user" or "assistant"
    content: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "What is photosynthesis?"
            }
        }


class ChatHistoryRequest(BaseModel):
    """Schema for multi-turn chat with conversation history."""
    messages: List[ChatMessage]
    course_id: str
    step: Optional[int] = 0  # Learning step (0-3) for progressive difficulty
    threshold: Optional[float] = 0.5  # Similarity threshold τ (default 0.5) for out-of-scope detection
    max_tokens: Optional[int] = 1024
    
    class Config:
        json_schema_extra = {
            "example": {
                "messages": [
                    {"role": "user", "content": "What is photosynthesis?"},
                    {"role": "assistant", "content": "Great question! Let me guide you..."}
                ],
                "course_id": "biology101",
                "step": 0,
                "threshold": 0.5,
                "max_tokens": 1024
            }
        }


class ChatResponse(BaseModel):
    """Schema for chat response."""
    response: str
    course_id: str
    chunks_used: int
    status: str  # success, error, out_of_scope, no_content
    step: Optional[int] = None
    similarity_score: Optional[float] = None  # S(q, C) - the similarity score
    threshold: Optional[float] = None  # τ - the threshold
    confidence: Optional[str] = None  # Confidence level of similarity match
    error: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Great question! Let me ask you: What do you know about...",
                "course_id": "math101",
                "chunks_used": 3,
                "step": 0,
                "status": "success",
                "similarity_score": 0.65,
                "threshold": 0.5,
                "confidence": "high",
                "error": None
            }
        }


class ConfigurePromptRequest(BaseModel):
    """Schema for configuring Socratic prompt."""
    socratic_prompt: str
    description: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "socratic_prompt": "You are a Socratic tutor that guides students...",
                "description": "Custom Socratic prompting guide for advanced learners"
            }
        }


class OutOfScopeCheckRequest(BaseModel):
    """Schema for out-of-scope similarity checking without generating response."""
    message: str
    course_id: str
    threshold: Optional[float] = 0.5
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "How do I build a rocket?",
                "course_id": "biology101",
                "threshold": 0.5
            }
        }


class OutOfScopeCheckResponse(BaseModel):
    """Schema for out-of-scope detection analysis."""
    is_in_scope: bool
    similarity_score: float  # S(q, C)
    threshold: float  # τ
    reasoning: str
    confidence_level: str  # very_low, low, moderate, high, very_high
    metrics: dict  # Detailed breakdown of similarity metrics
    chunks_analyzed: int
    recommendation: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "is_in_scope": False,
                "similarity_score": 0.15,
                "threshold": 0.5,
                "reasoning": "Query similarity (0.15) below threshold (0.30). Topic not covered in course materials.",
                "confidence_level": "very_low",
                "metrics": {
                    "keyword_overlap": 0.1,
                    "semantic_similarity": 0.15,
                    "coverage_similarity": 0.2
                },
                "chunks_analyzed": 0,
                "recommendation": "❌ Out of Scope: Query not covered in course materials. Suggest uploading relevant content."
            }
        }
