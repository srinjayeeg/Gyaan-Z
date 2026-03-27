# chat_service.py
import google.generativeai as genai
import os
from typing import Optional, List, Dict
from vector_store import retrieve_chunks
from out_of_scope_detector import OutOfScopeDetector


class ChatService:
    """Service for handling chat requests with Gemini API and Socratic prompting."""

    def __init__(self, api_key: Optional[str] = None, threshold: float = 0.5):
        """Initialize the chat service with Gemini API key and out-of-scope threshold."""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")

        genai.configure(api_key=self.api_key)
        # Using gemini-2.5-flash-lite (free tier with available quota)
        self.model = genai.GenerativeModel("gemini-2.5-flash-lite")

        # Initialize out-of-scope detector with threshold
        self.out_of_scope_detector = OutOfScopeDetector(default_threshold=threshold)

    def set_threshold(self, threshold: float):
        """Update the similarity threshold for out-of-scope detection."""
        self.out_of_scope_detector = OutOfScopeDetector(default_threshold=threshold)

    def build_socratic_prompt(
        self,
        course_content: str,
        query: str,
        step: int = 0
    ) -> str:
        """
        Build Socratic prompt using the provided template with step-based progression.

        Args:
            course_content: Formatted course content with citations
            query: Student's question
            step: Learning step (0-3) for progressive difficulty

        Returns:
            Complete prompt for Gemini
        """
        prompt = f"""
You are an AI-powered Socratic Tutor for a specific course.

========================
RULES (STRICT)
========================
- Answer ONLY from the provided course content
- If the answer is not found → say: "Out of course scope"
- Do NOT hallucinate or use external knowledge
- Guide the student step-by-step
- Promote thinking, not direct answers

========================
TEACHING STYLE
========================
- Use Socratic method (ask guiding questions)
- Be simple, clear, and friendly
- Encourage student to think and discover
- Keep responses short and meaningful

========================
RESPONSE STRUCTURE
========================
- Give a short explanation OR a hint
- Ask 1–2 guiding questions
- Do NOT give long direct answers unless necessary

========================
TEACHING STEPS
========================

STEP 0:
- Give a small hint
- Ask ONE simple question

STEP 1:
- Ask a deeper thinking question
- Provide slight guidance

STEP 2:
- Give a clearer hint + partial explanation
- Ask a follow-up question

STEP 3:
- Give a clear explanation using simple language
- Add a small example
- End with a question to check understanding

========================
CITATION RULE (VERY IMPORTANT)
========================
- Every response MUST include source citation
- Format: (Source: filename, Page X)
- Use ONLY the provided course content metadata
- Do NOT create or guess citations
- If multiple sources are used, include multiple citations

========================
COURSE CONTENT
========================
{course_content}

========================
STUDENT QUESTION
========================
{query}

========================
CURRENT STEP
========================
{step}

========================
IMPORTANT INSTRUCTIONS
========================
- Stay strictly within course content
- Never go outside the given material
- Always maintain Socratic behavior
- Keep answers concise and focused
- ALWAYS include proper citations in every response
"""
        return prompt

    def prepare_course_content(self, chunks: List[Dict]) -> str:
        """
        Prepare course content from retrieved chunks with proper citations.

        Args:
            chunks: List of chunk dictionaries from vector store

        Returns:
            Formatted course content with citations
        """
        if not chunks:
            return "No relevant learning materials found."

        content_parts = []

        for i, chunk in enumerate(chunks, 1):
            document = chunk.get("document_name", "Unknown")
            page = chunk.get("page_number", "?")
            content = chunk.get("content", "")
            course_id = chunk.get("course_id", "unknown")

            # Format with citation information
            content_parts.append(f"\n[Material {i}] From {document} (Page {page}) - Course: {course_id}")
            content_parts.append("-" * 60)
            content_parts.append(content)
            content_parts.append(f"(Source: {document}, Page {page})")
            content_parts.append("")

        return "\n".join(content_parts)

    def chat(
        self,
        user_message: str,
        course_id: str,
        step: int = 0,
        num_chunks: int = 5,
        threshold: float = None,
        max_tokens: int = 1024
    ) -> Dict[str, str]:
        """
        Process a chat message with Socratic prompting using Gemini.

        Args:
            user_message: The user's question or message
            course_id: The course ID to retrieve relevant chunks from
            step: Learning step (0-3) for progressive difficulty
            num_chunks: Number of chunks to retrieve (default: 5)
            threshold: Similarity threshold for out-of-scope detection
            max_tokens: Maximum tokens in response

        Returns:
            Dictionary with response and metadata
        """
        try:
            # Retrieve relevant chunks from the course
            chunks = retrieve_chunks(user_message, course_id)

            # Limit number of chunks to avoid token overflow
            chunks = chunks[:num_chunks]

            # Check if query is in scope using similarity score
            out_of_scope_result = self.out_of_scope_detector.check_with_details(
                user_message,
                chunks,
                threshold=threshold
            )

            if not out_of_scope_result["is_in_scope"]:
                return {
                    "response": out_of_scope_result["reasoning"],
                    "course_id": course_id,
                    "chunks_used": len(chunks),
                    "step": step,
                    "status": "out_of_scope",
                    "similarity_score": out_of_scope_result["similarity_score"],
                    "threshold": out_of_scope_result["threshold"],
                    "confidence": out_of_scope_result["confidence_level"]
                }

            # Prepare course content with citations
            course_content = self.prepare_course_content(chunks)

            # Build the Socratic prompt
            full_prompt = self.build_socratic_prompt(
                course_content=course_content,
                query=user_message,
                step=step
            )

            # Call Gemini API
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                )
            )

            return {
                "response": response.text,
                "course_id": course_id,
                "chunks_used": len(chunks),
                "step": step,
                "status": "success",
                "similarity_score": out_of_scope_result["similarity_score"],
                "threshold": out_of_scope_result["threshold"],
                "confidence": out_of_scope_result["confidence_level"]
            }

        except Exception as e:
            return {
                "response": f"Error processing request: {str(e)}",
                "course_id": course_id,
                "chunks_used": 0,
                "step": step,
                "status": "error",
                "error": str(e)
            }

    def chat_with_history(
        self,
        messages: List[Dict[str, str]],
        course_id: str,
        step: int = 0,
        threshold: float = None,
        max_tokens: int = 1024
    ) -> Dict[str, str]:
        """
        Process multi-turn chat with conversation history using Socratic method.

        Args:
            messages: List of message dicts with 'role' (user/assistant) and 'content'
            course_id: The course ID for context retrieval
            step: Learning step (0-3) for progressive difficulty
            threshold: Similarity threshold for out-of-scope detection
            max_tokens: Maximum tokens in response

        Returns:
            Dictionary with response and metadata
        """
        try:
            if not messages or len(messages) == 0:
                return {
                    "response": "No messages provided.",
                    "status": "error",
                    "error": "Empty message list"
                }

            # Get the last user message for chunk retrieval
            last_user_message = None
            for msg in reversed(messages):
                if msg.get("role") == "user":
                    last_user_message = msg.get("content", "")
                    break

            if not last_user_message:
                return {
                    "response": "No user message found.",
                    "status": "error",
                    "error": "No user message in conversation"
                }

            # Retrieve relevant chunks based on last user message
            chunks = retrieve_chunks(last_user_message, course_id)
            chunks = chunks[:5]

            # Check if query is in scope using similarity score
            out_of_scope_result = self.out_of_scope_detector.check_with_details(
                last_user_message,
                chunks,
                threshold=threshold
            )

            if not out_of_scope_result["is_in_scope"]:
                return {
                    "response": out_of_scope_result["reasoning"],
                    "course_id": course_id,
                    "chunks_used": len(chunks),
                    "step": step,
                    "status": "out_of_scope",
                    "similarity_score": out_of_scope_result["similarity_score"],
                    "threshold": out_of_scope_result["threshold"],
                    "confidence": out_of_scope_result["confidence_level"]
                }

            # Prepare course content with citations
            course_content = self.prepare_course_content(chunks)

            # Build Socratic prompt
            socratic_prompt = self.build_socratic_prompt(
                course_content=course_content,
                query=last_user_message,
                step=step
            )

            # Build full prompt with conversation history
            prompt_parts = [socratic_prompt, "\n\n========================\nCONVERSATION HISTORY\n========================\n"]

            # Add conversation history
            for msg in messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role == "user":
                    prompt_parts.append(f"Student: {content}\n")
                else:
                    prompt_parts.append(f"Tutor: {content}\n")

            prompt_parts.append("\nNow provide your response following the Socratic method and citation rules.")

            full_prompt = "".join(prompt_parts)

            # Call Gemini API
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                )
            )

            return {
                "response": response.text,
                "course_id": course_id,
                "chunks_used": len(chunks),
                "message_count": len(messages),
                "step": step,
                "status": "success",
                "similarity_score": out_of_scope_result["similarity_score"],
                "threshold": out_of_scope_result["threshold"],
                "confidence": out_of_scope_result["confidence_level"]
            }

        except Exception as e:
            return {
                "response": f"Error processing conversation: {str(e)}",
                "course_id": course_id,
                "status": "error",
                "error": str(e)
            }
