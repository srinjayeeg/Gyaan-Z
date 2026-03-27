# Chat API Documentation

## Overview

The Chat API adds Socratic prompting capabilities to your RAG system. It uses Google's Gemini model to generate thoughtful, guiding questions that help students learn through discovery rather than direct answers.

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Get Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev)
2. Click "Get API Key"
3. Create a new project or use existing one
4. Generate a new API key
5. Copy the key

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Then edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Start the Server

```bash
python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

---

## API Endpoints

### Chat Endpoints

#### 1. Single-Turn Chat
**POST** `/chat/`

Process a single user message with Socratic prompting.

**Request:**
```json
{
  "message": "How do I solve quadratic equations?",
  "course_id": "math101",
  "custom_socratic_prompt": null,
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**Response:**
```json
{
  "response": "Great question! Before we dive into the formula, let me ask you: What do you already know about...",
  "course_id": "math101",
  "chunks_used": 3,
  "status": "success",
  "error": null
}
```

**Parameters:**
- `message` (required): User's question or message
- `course_id` (required): Course ID to retrieve relevant contextchunks from
- `custom_socratic_prompt` (optional): Override the default Socratic prompt for this request
- `temperature` (optional, default 0.7): Controls randomness/creativity (0.0-1.0)
  - Lower (0.0-0.3): More focused, deterministic
  - Medium (0.5-0.7): Balanced
  - Higher (0.8-1.0): More creative, varied
- `max_tokens` (optional, default 1024): Maximum length of response

---

#### 2. Multi-Turn Chat (Conversation History)
**POST** `/chat/multi-turn/`

Maintain conversation history with the model.

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is photosynthesis?"
    },
    {
      "role": "assistant",
      "content": "Great question! Let me guide you through this...[previous response]"
    },
    {
      "role": "user",
      "content": "Can you tell me more about chlorophyll?"
    }
  ],
  "course_id": "biology101",
  "custom_socratic_prompt": null,
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**Response:**
```json
{
  "response": "Excellent follow-up! Let me ask you this: where do you think chlorophyll...",
  "course_id": "biology101",
  "chunks_used": 4,
  "message_count": 3,
  "status": "success",
  "error": null
}
```

**Parameters:**
- `messages` (required): Array of conversation messages
  - Each message has `role` ("user" or "assistant") and `content` (text)
- `course_id` (required): Course ID for chunk retrieval
- `custom_socratic_prompt` (optional): Override default Socratic prompt
- `temperature` (optional, default 0.7): Model creativity level
- `max_tokens` (optional, default 1024): Max response length

---

### Configuration Endpoints

#### 3. Set Global Socratic Prompt
**POST** `/chat/config/global-prompt`

Configure the default Socratic prompting template used for all courses.

**Request:**
```json
{
  "socratic_prompt": "You are an expert Socratic tutor who...[your custom prompt]",
  "description": "Custom prompt for advanced learners"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Global Socratic prompt updated successfully",
  "description": "Custom prompt for advanced learners"
}
```

---

#### 4. Set Course-Specific Socratic Prompt
**POST** `/chat/config/course-prompt/{course_id}`

Configure a custom Socratic prompt for a specific course. This overrides the global prompt for that course.

**Request:**
```json
{
  "socratic_prompt": "For this course, focus on...[custom prompt]",
  "description": "Math-specific Socratic approach"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Socratic prompt updated for course math101",
  "course_id": "math101",
  "description": "Math-specific Socratic approach"
}
```

---

#### 5. Get Socratic Prompt for Course
**GET** `/chat/config/prompt/{course_id}`

Retrieve the Socratic prompt for a specific course.

**Response:**
```json
{
  "course_id": "math101",
  "prompt": "You are a Socratic tutor that guides students...",
  "type": "course-specific"
}
```

**type** can be:
- `"course-specific"`: Custom prompt for this course
- `"global"`: Using global default prompt
- `"none"`: Using built-in default Socratic prompting

---

#### 6. Get All Chat Configuration
**GET** `/chat/config/all`

Retrieve all configured Socratic prompts and chat settings.

**Response:**
```json
{
  "status": "success",
  "config": {
    "default_socratic_prompt": "You are an expert Socratic tutor...",
    "course_prompts": {
      "math101": "For math, focus on...",
      "biology101": "For biology, emphasize..."
    },
    "chat_settings": {
      "default_temperature": 0.7,
      "default_max_tokens": 1024,
      "default_num_chunks": 5
    }
  }
}
```

---

#### 7. Chat Service Status
**GET** `/chat/status`

Check if chat service is available and properly configured.

**Response:**
```json
{
  "status": "available",
  "service": "Gemini Socratic Tutor",
  "has_global_prompt": true,
  "configured_courses": ["math101", "biology101"],
  "total_courses_configured": 2
}
```

---

## Usage Examples

### Example 1: Basic Single-Turn Chat (Python)

```python
import requests
import json

url = "http://localhost:8000/chat/"

payload = {
    "message": "How does cellular respiration work?",
    "course_id": "biology101",
    "temperature": 0.7,
    "max_tokens": 1024
}

response = requests.post(url, json=payload)
print(response.json()["response"])
```

### Example 2: Multi-Turn Conversation (JavaScript/Fetch)

```javascript
async function chatWithHistory() {
  const messages = [
    {
      role: "user",
      content: "What is photosynthesis?"
    }
  ];

  const payload = {
    messages: messages,
    course_id: "biology101",
    temperature: 0.7,
    max_tokens: 1024
  };

  const response = await fetch("http://localhost:8000/chat/multi-turn/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log(data.response);

  // Continue conversation
  messages.push({
    role: "assistant",
    content: data.response
  });

  messages.push({
    role: "user",
    content: "What about the light-dependent reactions?"
  });

  // Make another request
  const response2 = await fetch("http://localhost:8000/chat/multi-turn/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, course_id: "biology101" })
  });

  const data2 = await response2.json();
  console.log(data2.response);
}
```

### Example 3: Configure Custom Socratic Prompt

```python
import requests

# Set global prompt
url = "http://localhost:8000/chat/config/global-prompt"

custom_prompt = """You are an expert Socratic tutor specializing in STEM education.
Your approach:
1. Always ask guiding questions before giving explanations
2. Build on student's existing knowledge
3. Guide them toward discovering the answer themselves
4. Use real-world examples when helpful
5. Celebrate their insights and encourage deeper thinking
"""

payload = {
    "socratic_prompt": custom_prompt,
    "description": "STEM-focused Socratic approach"
}

response = requests.post(url, json=payload)
print(response.json())
```

### Example 4: Course-Specific Prompt

```python
import requests

# Set course-specific prompt for math
url = "http://localhost:8000/chat/config/course-prompt/math101"

math_prompt = """You are a Socratic tutor specializing in mathematics.
When students ask about problems:
1. Ask them to identify what they know and what they need to find
2. Guide them to recall relevant formulas or concepts
3. Encourage them to work through steps themselves
4. Help them check their reasoning
5. Ask follow-up questions about why their approach works
"""

payload = {
    "socratic_prompt": math_prompt,
    "description": "Mathematics-specific Socratic prompting"
}

response = requests.post(url, json=payload)
print(response.json())
```

---

## Socratic Prompting Strategies

### What is Socratic Prompting?

Socratic prompting uses thoughtful questions to guide learners toward their own understanding rather than providing direct answers. This approach:

- Encourages critical thinking
- Builds deeper understanding
- Develops problem-solving skills
- Adapts to individual learning styles

### Example Socratic Prompts for Different Subjects

#### Science Education
```
You are a Socratic tutor for science. When answering questions:
- Ask students what they observe
- Encourage them to form hypotheses
- Guide them to test their thinking
- Help them explain phenomena using evidence
- Ask: "What would happen if...?"
```

#### Mathematics
```
You are a Socratic math tutor. When helping with problems:
- Ask students to restate the problem in their own words
- Guide them to identify what type of problem it is
- Encourage them to try different approaches
- Ask about the reasoning behind each step
- Help them verify their answer makes sense
```

#### History/Literature
```
You are a Socratic tutor for humanities. When discussing topics:
- Ask students what they already know
- Encourage perspective-taking
- Ask about sources and evidence
- Guide them to make connections
- Ask open-ended questions like "What do you think this means?"
```

---

## Important Parameters

### Temperature

Controls the creativity/randomness of responses:

- **0.0-0.3**: Deterministic, focused (best for factual questions)
- **0.4-0.7**: Balanced (default 0.7, good for most use cases)
- **0.8-1.0**: Creative, varied (for brainstorming, creative tasks)

### Max Tokens

Limits response length. One token ≈ 4 characters:

- 256-512: Short responses
- 1024 (default): Medium length answers
- 2048+: Long, detailed responses

### Chunks Used

Returned in response. More chunks = more context, but risks longer processing:

- Default: 5 chunks per query
- The model uses these chunks to inform Socratic questions

---

## Troubleshooting

### Error: "GEMINI_API_KEY environment variable not set"

**Solution:** Make sure you've set the API key in your `.env` file:
```
GEMINI_API_KEY=your_key_here
```

Then restart the server.

### Error: "No chunks found for course"

**Solution:** Make sure you've uploaded a PDF for that course using the `/upload/` endpoint first.

### Getting too long/short responses

**Solution:** Adjust `max_tokens`:
- Shorter: lower max_tokens (512)
- Longer: increase max_tokens (2048)

### Responses not following Socratic approach

**Solution:** Configure a custom Socratic prompt using the configuration endpoints. Be specific about:
- The teaching style you want
- The types of questions to ask
- How to engage students

---

## Files Created

- **chat_service.py**: Core chat service with Gemini integration
- **chat_schemas.py**: Pydantic models for API requests/responses
- **chat_config.py**: Configuration management for Socratic prompts
- **requirements.txt**: Python dependencies
- **.env.example**: Environment variable template
- **CHAT_API.md**: This documentation

---

## Next Steps

1. Set up your `.env` file with your Gemini API key
2. Install dependencies: `pip install -r requirements.txt`
3. Start the server: `python -m uvicorn main:app --reload`
4. Test the endpoints using the Swagger UI: `http://localhost:8000/docs`
5. Configure custom Socratic prompts for your courses
6. Integrate with your frontend application

---

## Architecture

```
User Request
    ↓
FastAPI Endpoint
    ↓
ChatService (chat_service.py)
    ├→ Retrieve chunks from vector store
    ├→ Get Socratic prompt from config
    ├→ Prepare context from chunks
    └→ Call Gemini API
        ↓
    Generate Response
        ↓
    Return to User
```

---

## API Development Notes

- All endpoints are async for better performance
- Error handling returns informative error messages and status
- Configuration is persisted to JSON files
- Responses include metadata (chunks used, status, etc.) for debugging
- The service gracefully handles missing configurations

---

## Support

For issues with:
- **Gemini API**: Visit [Google AI Documentation](https://ai.google.dev/docs)
- **FastAPI**: Visit [FastAPI Documentation](https://fastapi.tiangolo.com/)
- **This implementation**: Check the code comments and error messages

