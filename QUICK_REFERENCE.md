# 📋 Chat API - Quick Reference Card

## Your Setup
- ✅ **API Key**: Configured in `.env`
- ✅ **Model**: Gemini 1.5 Flash (free)
- ✅ **Prompting**: Your step-based Socratic template
- ✅ **Citations**: Mandatory in all responses
- ✅ **Content**: Course materials only (no hallucination)

---

## API Endpoints

### POST `/chat/` - Single Turn
```
Request:
{
  "message": "string (required)",
  "course_id": "string (required)",
  "step": 0-3 (optional, default 0),
  "temperature": 0.0-1.0 (optional, default 0.7),
  "max_tokens": number (optional, default 1024)
}

Response:
{
  "response": "tutored response with (Source: file, Page X)",
  "course_id": "string",
  "chunks_used": number,
  "step": number,
  "status": "success|error|no_content"
}
```

### POST `/chat/multi-turn/` - Conversation
```
Request:
{
  "messages": [
    {"role": "user", "content": "string"},
    {"role": "assistant", "content": "string"}
  ],
  "course_id": "string (required)",
  "step": 0-3 (optional),
  "temperature": 0.0-1.0 (optional),
  "max_tokens": number (optional)
}

Response: Same as /chat/ with message_count added
```

### GET `/chat/status` - Service Status
Returns: model, step descriptions, features, citation format

### GET `/chat/config/prompt/{course_id}` - Check Prompt
Returns: prompt_type (built-in|global-override|course-specific)

---

## 4 Teaching Steps

| Step | Response Type | Use For | Example |
|------|---------------|---------|---------|
| 0️⃣ | Hint + simple Q | Beginners | "What happens in darkness?" |
| 1️⃣ | Deeper Q + guidance | Growing understanding | "Where exactly?" |
| 2️⃣ | Hint + partial explanation + followup | Near mastery | "It's the chloroplast. What about..." |
| 3️⃣ | Full explanation + example + check | Mastery | "Here's exactly how... Can you explain?" |

---

## Citation Format (MANDATORY)
```
(Source: filename, Page number)

Example: (Source: Biology101_Ch3.pdf, Page 45)
Multiple: (Source: Ch1.pdf, Page 10) (Source: Ch2.pdf, Page 20)
```

---

## Key Rules (Strict Enforcement)

✅ **DO:**
- Answer ONLY from course content
- Include citations in every response
- Use Socratic method (guide with questions)
- Follow step progression
- Return "Out of course scope" if needed

❌ **DON'T:**
- Use external knowledge
- Hallucinate answers
- Skip citations
- Give direct answers (except Step 3)
- Repeat content verbatim

---

## Quick Examples

### Python - Basic Chat
```python
import requests

response = requests.post(
    "http://localhost:8000/chat/",
    json={
        "message": "What is photosynthesis?",
        "course_id": "biology101",
        "step": 0
    }
)
print(response.json()["response"])
```

### JavaScript - Chat
```javascript
const response = await fetch("http://localhost:8000/chat/", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({
    message: "What is photosynthesis?",
    course_id: "biology101",
    step: 0
  })
});
const data = await response.json();
console.log(data.response);
```

### bash - Using curl
```bash
curl -X POST "http://localhost:8000/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is photosynthesis?",
    "course_id": "biology101",
    "step": 0
  }'
```

---

## Parameter Guide

### `step` (0-3)
- **0**: Beginner - Give a hint, ask simple Q
- **1**: Some understanding - Ask deeper Q
- **2**: Near mastery - Give partial explanation  
- **3**: Ready - Give full explanation

### `temperature` (0.0-1.0)
- **0.0-0.3**: Focused, predictable
- **0.4-0.7**: Balanced (default: 0.7)
- **0.8-1.0**: Creative, varied

### `max_tokens` (response length)
- **256**: Very short
- **512**: Short
- **1024**: Medium (default)
- **2048**: Long/detailed

---

## Setup Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Start server
python -m uvicorn main:app --reload

# Run tests
python test_chat_api.py

# Open API docs
# Visit: http://localhost:8000/docs
```

---

## Common Responses

### Success
```json
{
  "response": "Great question! ...(Source: file.pdf, Page X)",
  "status": "success",
  "chunks_used": 3
}
```

### No Content Found
```json
{
  "response": "Out of course scope - No relevant materials found...",
  "status": "no_content",
  "chunks_used": 0
}
```

### Error
```json
{
  "response": "Error processing request: ...",
  "status": "error",
  "error": "error details"
}
```

---

## Files You Need

| File | Purpose |
|------|---------|
| `.env` | API key storage |
| `chat_service.py` | Core chat logic |
| `main.py` | API endpoints |
| `vector_store.py` | Content retrieval |
| `requirements.txt` | Dependencies |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Out of course scope" | Upload PDF first with `/upload/` |
| No citations | Shouldn't happen - restart server |
| Response too short | Increase `max_tokens` |
| Response too long | Decrease `max_tokens` |
| API key error | Check `.env` file, restart server |

---

## Status Check

```bash
# Check service is running
curl http://localhost:8000/chat/status

# Should return:
# {
#   "status": "available",
#   "service": "Gemini Socratic Tutor",
#   "model": "gemini-1.5-flash",
#   "citation_format": "(Source: filename, Page X)"
# }
```

---

## Your Workflow

1. 📤 **Upload PDFs** → `/upload/?course_id=biology101`
2. 💬 **Ask Questions** → `/chat/` with `step=0`
3. 🎓 **Get Socratic Responses** → With citations, with guidance questions
4. 📖 **Progress through Steps** → 0→1→2→3 for deeper understanding
5. 💾 **Multiple Turns** → `/chat/multi-turn/` with message history

---

## Documentation Files

- **IMPLEMENTATION_SUMMARY.md** - What was built
- **CHAT_API_COMPLETE.md** - Full detailed documentation
- **GET_STARTED.md** - Quick start guide
- **QUICK_REFERENCE.md** - This file

---

**Last Updated**: March 27, 2026
**API Version**: 1.0  
**Model**: Gemini 1.5 Flash
**Status**: ✅ Ready to Use
