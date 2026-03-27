# main.py
from fastapi import FastAPI, UploadFile, File, Query
import shutil
from pipeline import extract_text_from_pdf, chunk_text, save_chunks_to_json
from vector_store import create_vector_store, retrieve_chunks, get_all_chunks_by_course
from chat_service import ChatService
from chat_schemas import (
    ChatRequest, ChatHistoryRequest, ConfigurePromptRequest, ChatResponse,
    OutOfScopeCheckRequest, OutOfScopeCheckResponse
)
from chat_config import ChatConfig
from out_of_scope_detector import OutOfScopeDetector
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Initialize chat service and config
try:
    chat_service = ChatService(threshold=0.5)  # Set default threshold to 0.5
    chat_config = ChatConfig()
    out_of_scope_detector = OutOfScopeDetector()
except ValueError as e:
    print(f"Warning: {e}. Chat endpoints will not be available without GEMINI_API_KEY.")

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...), course_id: str = Query(...)):
    """Upload a PDF file and process it for a specific course."""
    file_path = f"data/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pages = extract_text_from_pdf(file_path)
    chunks = chunk_text(pages, file.filename, course_id)
    save_chunks_to_json(chunks, course_id)

    db = create_vector_store(chunks, course_id)

    return {
        "message": "File processed successfully",
        "course_id": course_id,
        "chunks_created": len(chunks),
        "document_name": file.filename
    }


@app.get("/retrieve/")
async def retrieve(query: str = Query(...), course_id: str = Query(...)):
    """Retrieve relevant chunks for a query from a specific course."""
    results = retrieve_chunks(query, course_id)
    return {
        "query": query,
        "course_id": course_id,
        "results": results,
        "count": len(results)
    }


@app.get("/course/{course_id}/chunks")
async def get_course_chunks(course_id: str):
    """Get all chunks for a specific course."""
    chunks = get_all_chunks_by_course(course_id)
    return {
        "course_id": course_id,
        "total_chunks": len(chunks),
        "chunks": chunks
    }


# =============== CHAT API ENDPOINTS ===============

@app.post("/chat/")
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Single-turn chat endpoint using Socratic prompting with out-of-scope detection.
    
    Uses similarity scoring: If S(q, C) ≥ τ, answer is generated. Else, query is rejected.
    
    Args:
        request: ChatRequest containing:
            - message: User's question
            - course_id: Course ID for context retrieval
            - step: Learning step (0-3, default 0) for progressive difficulty
            - threshold: Similarity threshold τ (default 0.5)
            - max_tokens: Max response length (default 1024)
    
    Returns:
        ChatResponse with the model's response and metadata including:
        - similarity_score: S(q, C) - calculated similarity between query and context
        - threshold: τ - the threshold used for comparison
        - confidence: Confidence level based on similarity score
        - status: success, out_of_scope, or error
    
    Teaching Steps:
        STEP 0: Give a small hint + ask ONE simple question
        STEP 1: Ask a deeper thinking question + provide slight guidance
        STEP 2: Give a clearer hint + partial explanation + follow-up question
        STEP 3: Give clear explanation + simple example + check understanding question
    """
    try:
        result = chat_service.chat(
            user_message=request.message,
            course_id=request.course_id,
            step=request.step,
            threshold=request.threshold,
            max_tokens=request.max_tokens
        )
        return ChatResponse(**result)
    except Exception as e:
        return ChatResponse(
            response=f"Error: {str(e)}",
            course_id=request.course_id,
            chunks_used=0,
            status="error",
            error=str(e)
        )


@app.post("/chat/multi-turn/")
async def chat_with_history(request: ChatHistoryRequest) -> ChatResponse:
    """
    Multi-turn chat endpoint for conversation history support with out-of-scope detection.
    
    Uses similarity scoring on the last user message.
    
    Args:
        request: ChatHistoryRequest containing:
            - messages: List of messages with roles (user/assistant)
            - course_id: Course ID for context retrieval
            - step: Learning step (0-3, default 0) for progressive difficulty
            - threshold: Similarity threshold τ (default 0.5)
            - max_tokens: Max response length (default 1024)
    
    Returns:
        ChatResponse with the model's response and metadata including:
        - similarity_score: S(q, C) from last user message
        - threshold: τ - the threshold used
        - confidence: Confidence level of match
    """
    try:
        # Convert Pydantic messages to dictionaries
        message_dicts = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages
        ]
        
        result = chat_service.chat_with_history(
            messages=message_dicts,
            course_id=request.course_id,
            step=request.step,
            threshold=request.threshold,
            max_tokens=request.max_tokens
        )
        return ChatResponse(**result)
    except Exception as e:
        return ChatResponse(
            response=f"Error: {str(e)}",
            course_id=request.course_id,
            chunks_used=0,
            status="error",
            error=str(e)
        )


@app.post("/chat/config/global-prompt")
async def set_global_socratic_prompt(request: ConfigurePromptRequest):
    """
    Configure the global default Socratic prompting template.
    
    NOTE: The system uses a built-in Socratic prompting template by default.
    This endpoint allows you to override it if needed.
    
    Args:
        request: ConfigurePromptRequest containing:
            - socratic_prompt: The Socratic prompting template
            - description: Optional description of the prompt
    
    Returns:
        Confirmation message
    """
    try:
        chat_config.set_default_socratic_prompt(request.socratic_prompt)
        return {
            "status": "success",
            "message": "Global Socratic prompt updated successfully",
            "description": request.description or "No description provided",
            "note": "The system will now use your custom prompt instead of the built-in template"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to update global prompt: {str(e)}",
            "error": str(e)
        }


@app.post("/chat/config/course-prompt/{course_id}")
async def set_course_socratic_prompt(course_id: str, request: ConfigurePromptRequest):
    """
    Configure a course-specific Socratic prompting template.
    
    Course-specific prompts override the built-in default for that course.
    
    Args:
        course_id: The course ID
        request: ConfigurePromptRequest containing:
            - socratic_prompt: The Socratic prompting template
            - description: Optional description of the prompt
    
    Returns:
        Confirmation message
    """
    try:
        chat_config.set_course_prompt(course_id, request.socratic_prompt)
        return {
            "status": "success",
            "message": f"Socratic prompt updated for course {course_id}",
            "course_id": course_id,
            "description": request.description or "No description provided"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to update course prompt: {str(e)}",
            "error": str(e),
            "course_id": course_id
        }


@app.get("/chat/config/prompt/{course_id}")
async def get_socratic_prompt(course_id: str):
    """
    Get the Socratic prompting template for a course.
    
    Returns the course-specific prompt if available, otherwise returns
    the global default prompt. If no custom prompts are configured,
    returns the built-in Socratic prompting template.
    
    Args:
        course_id: The course ID
    
    Returns:
        The Socratic prompting template and its type (course-specific/global/built-in)
    """
    try:
        course_prompt = chat_config.get_course_prompt(course_id)
        
        if course_prompt:
            return {
                "course_id": course_id,
                "prompt_type": "course-specific",
                "has_custom_prompt": True
            }
        
        global_prompt = chat_config.get_default_socratic_prompt()
        if global_prompt:
            return {
                "course_id": course_id,
                "prompt_type": "global-override",
                "has_custom_prompt": True
            }
        
        return {
            "course_id": course_id,
            "prompt_type": "built-in",
            "has_custom_prompt": False,
            "message": "Using built-in Socratic prompting template with step-based progression"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to retrieve prompt: {str(e)}",
            "error": str(e),
            "course_id": course_id
        }


@app.get("/chat/config/all")
async def get_all_chat_config():
    """
    Get entire chat configuration.
    
    Returns all configured Socratic prompts and chat settings.
    
    Returns:
        Complete chat configuration
    """
    try:
        config = chat_config.get_all_config()
        return {
            "status": "success",
            "config": config
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to retrieve configuration: {str(e)}",
            "error": str(e)
        }


@app.get("/chat/status")
async def chat_status():
    """
    Check if chat service is available and configured.
    
    Returns:
        Status of chat service and configuration
    """
    try:
        return {
            "status": "available",
            "service": "Gemini Socratic Tutor",
            "model": "gemini-1.5-flash",
            "prompting_method": "Step-based Socratic Method",
            "out_of_scope_detection": "Enabled with similarity scoring",
            "available_steps": {
                "0": "Give a small hint + ask ONE simple question",
                "1": "Ask a deeper thinking question + provide slight guidance",
                "2": "Give a clearer hint + partial explanation + follow-up question",
                "3": "Clear explanation + simple example + check understanding question"
            },
            "features": [
                "Single-turn chat with step progression",
                "Multi-turn conversations with history",
                "Course-based context retrieval",
                "Citation-based responses",
                "Out-of-scope detection using similarity scoring",
                "Configurable similarity threshold"
            ],
            "citation_format": "(Source: filename, Page X)",
            "similarity_scoring": {
                "formula": "If S(q, C) ≥ τ, answer is generated. Else, query is rejected.",
                "explanation": {
                    "q": "user query",
                    "C": "retrieved context",
                    "S(q, C)": "similarity score (0.0-1.0)",
                    "τ": "threshold (default 0.5)"
                },
                "default_threshold": 0.5
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Chat service is not available: {str(e)}",
            "error": str(e)
        }


@app.post("/chat/detect-out-of-scope/")
async def detect_out_of_scope(request: OutOfScopeCheckRequest) -> OutOfScopeCheckResponse:
    """
    Check if a query is within scope of course content without generating a response.
    
    Uses similarity scoring mechanism:
    - Calculates S(q, C) = similarity between query (q) and context (C)
    - Compares against threshold τ
    - If S(q, C) ≥ τ: query is in scope
    - Else: query is out of scope
    
    Args:
        request: OutOfScopeCheckRequest containing:
            - message: User's question to check
            - course_id: Course ID for context retrieval
            - threshold: Similarity threshold τ (default 0.5, range 0.0-1.0)
    
    Returns:
        OutOfScopeCheckResponse with:
        - is_in_scope: Boolean result
        - similarity_score: S(q, C)
        - threshold: τ
        - confidence_level: Assessment of match quality
        - metrics: Breakdown of individual similarity components
        - recommendation: Actionable suggestion
    
    Example:
        Request: {"message": "How do I build a rocket?", "course_id": "biology101", "threshold": 0.5}
        Response: {
            "is_in_scope": false,
            "similarity_score": 0.15,
            "threshold": 0.50,
            "reasoning": "Query similarity (0.15) below threshold (0.30). Topic not covered...",
            "confidence_level": "very_low",
            "recommendation": "❌ Out of Scope: Query not covered in course materials..."
        }
    """
    try:
        # Retrieve chunks for the query
        chunks = retrieve_chunks(request.message, request.course_id)
        
        # Perform comprehensive out-of-scope check
        check_result = out_of_scope_detector.check_with_details(
            request.message,
            chunks,
            threshold=request.threshold
        )
        
        # Add recommendation
        recommendation = out_of_scope_detector.get_recommendation(
            check_result["similarity_score"],
            request.threshold
        )
        
        check_result["recommendation"] = recommendation
        
        return OutOfScopeCheckResponse(**check_result)
    
    except Exception as e:
        return OutOfScopeCheckResponse(
            is_in_scope=False,
            similarity_score=0.0,
            threshold=request.threshold,
            reasoning=f"Error during analysis: {str(e)}",
            confidence_level="very_low",
            metrics={"error": str(e)},
            chunks_analyzed=0,
            recommendation=f"Error checking scope: {str(e)}"
        )