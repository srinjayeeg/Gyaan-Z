# Chat API Quick Start Guide

## ⚡ 30-Second Setup

### 1. Get API Key (2 minutes)
- Go to https://ai.google.dev
- Click "Get API Key"
- Copy your key

### 2. Set Up Environment (1 minute)
```bash
# Copy the example file
cp .env.example .env

# Edit .env and paste your key
# GEMINI_API_KEY=your_key_here
```

### 3. Install & Run (2 minutes)
```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

✅ Done! Your chat API is running at `http://localhost:8000`

---

## 🎯 Try It Out

### Using Swagger UI (Easiest)
1. Open http://localhost:8000/docs
2. Click "Try it out" on any endpoint
3. Fill in the parameters
4. Click "Execute"

### Using curl
```bash
curl -X POST "http://localhost:8000/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I solve quadratic equations?",
    "course_id": "math101"
  }'
```

### Using Python
```python
import requests

response = requests.post(
    "http://localhost:8000/chat/",
    json={
        "message": "How do I solve quadratic equations?",
        "course_id": "math101"
    }
)

print(response.json()["response"])
```

---

## 📝 Configure Custom Socratic Prompt (Optional)

### Set Global Prompt
```bash
curl -X POST "http://localhost:8000/chat/config/global-prompt" \
  -H "Content-Type: application/json" \
  -d '{
    "socratic_prompt": "You are a Socratic tutor who guides students through questions...",
    "description": "My custom teaching approach"
  }'
```

### Set Course-Specific Prompt
```bash
curl -X POST "http://localhost:8000/chat/config/course-prompt/math101" \
  -H "Content-Type: application/json" \
  -d '{
    "socratic_prompt": "For math, focus on problem-solving steps...",
    "description": "Math-specific Socratic approach"
  }'
```

---

## 📚 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/chat/` | Single message chat |
| POST | `/chat/multi-turn/` | Conversation with history |
| POST | `/chat/config/global-prompt` | Set default Socratic prompt |
| POST | `/chat/config/course-prompt/{course_id}` | Set course-specific prompt |
| GET | `/chat/config/prompt/{course_id}` | Get prompt for course |
| GET | `/chat/config/all` | Get all config |
| GET | `/chat/status` | Check service status |

---

## 🎓 Common Socratic Prompts

### Science
```
"You are a science tutor. Ask guiding questions about observations, 
hypotheses, and evidence rather than giving answers directly."
```

### Math
```
"You are a math tutor. Help students understand the reasoning behind 
each step by asking them to explain their thinking."
```

### Writing
```
"You are a writing tutor. Ask questions that help students improve 
their writing through self-reflection and revision."
```

---

## ⚙️ Key Parameters

### `temperature` (0.0 - 1.0)
- Lower = more focused, factual
- Higher = more creative, varied
- **Default: 0.7** (good for most cases)

### `max_tokens` (response length)
- 512 = short
- 1024 = medium (default)
- 2048 = long

### `course_id` (required)
- Must match a course that has  uploaded PDFs
- Use `/upload/` endpoint first to add documents

---

## ✅ Before You Start

Make sure you've:
1. Uploaded a PDF using `/upload/` endpoint
2. Set the GEMINI_API_KEY in `.env`
3. Installed requirements: `pip install -r requirements.txt`

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key not configured" | Add GEMINI_API_KEY to .env and restart |
| "No chunks found" | Upload a PDF first using /upload/ endpoint |
| "Response too short" | Increase max_tokens (try 1024 or 2048) |
| "Not asking questions" | Configure a custom Socratic prompt |

---

## 📖 Full Documentation

See [CHAT_API.md](CHAT_API.md) for complete API documentation and examples.

---

## 🚀 Next Steps

1. ✅ Set up environment variables
2. ✅ Install dependencies
3. ✅ Start the server
4. ✅ Upload a PDF (use `/upload/` endpoint)
5. ✅ Start chatting!
6. (Optional) Configure custom Socratic prompts

---

## 💡 Example Workflow

```
1. Upload document
   POST /upload/?course_id=math101
   
2. Ask a question
   POST /chat/
   {
     "message": "How do I solve quadratic equations?",
     "course_id": "math101"
   }
   
3. Get Socratic response
   ← "Great question! Let me ask you this: ..."
   
4. Continue conversation
   POST /chat/multi-turn/
   (with conversation history)
```

---

Need help? Check CHAT_API.md for detailed documentation!
