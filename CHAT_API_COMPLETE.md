# 🎓 Chat API - Step-Based Socratic Tutoring with Gemini

Your Chat API is now fully configured with:
- ✅ **Gemini 1.5 Flash** model (free tier)
- ✅ **Step-based Socratic prompting** with 4 progressive learning stages
- ✅ **Mandatory citation system** for all responses
- ✅ **Course content enforcement** (no hallucination, only from provided materials)

---

## 🚀 Quick Start

### 1. Verify Setup
```bash
# Check if API key is set
cat .env

# You should see:
# GEMINI_API_KEY=AIzaSyA7NaS71id4RP9uBft6ywd7Z5vIzSNOyQs
```

### 2. Start the Server
```bash
python -m uvicorn main:app --reload
```

### 3. Test the API
```bash
# Visit Swagger UI
http://localhost:8000/docs

# Or run tests
python test_chat_api.py
```

---

## 📚 Step-Based Socratic Tutoring System

Your API uses a 4-step progressive learning approach:

### **STEP 0: Initialization**
- **Purpose**: Introduce the topic gently
- **Tutor Response**: Give a small hint + ask ONE simple question
- **Use When**: Student is just starting or is a beginner
- **Example**: 
  - Student: "What is photosynthesis?"
  - Tutor: "Great question! Here's a hint: it happens when plants get sunlight. Can you think of what might be the opposite, where plants break down food?"

### **STEP 1: Deeper Exploration**
- **Purpose**: Encourage deeper thinking
- **Tutor Response**: Ask a deeper thinking question + provide slight guidance
- **Use When**: Student has basic understanding and needs more depth
- **Example**:
  - Student: "So it converts light into energy?"
  - Tutor: "Exactly! Now, think about this: where inside the plant's cells do you think this conversion happens? (Hint: it's a special organelle)"

### **STEP 2: Guided Discovery**
- **Purpose**: Build clearer understanding with partial guidance
- **Tutor Response**: Give a clearer hint + partial explanation + ask follow-up question
- **Use When**: Student is getting closer to full understanding
- **Example**:
  - Student: "Is it in the chloroplast?"
  - Tutor: "Perfect! Yes, in the chloroplast. There are actually two main parts: the light-dependent reactions use sunlight, and then the light-independent reactions use that energy to make glucose. Can you guess which one uses the sunlight directly?"

### **STEP 3: Full Comprehension**
- **Purpose**: Solidify understanding with clear explanation
- **Tutor Response**: Clear explanation + simple example + check understanding question
- **Use When**: Student is ready for complete understanding
- **Example**:
  - Student: "The light-dependent reactions?"
  - Tutor: "Correct! Here's how it works: Light hits chlorophyll in the light-dependent reactions, which excites electrons. These electrons are used to split water and create ATP and NADPH. Then in the light-independent reactions (Calvin cycle), these molecules help convert CO2 into glucose. It's like the light reactions are a battery charger, and the Calvin cycle uses that charge to make sugar. Does this make sense? Can you explain why photosynthesis is essential for life on Earth?"

---

## 🔗 API Endpoints

### Single-Turn Chat
**POST** `/chat/`

Returns a Socratic response based on the learning step.

**Request:**
```json
{
  "message": "How does photosynthesis work?",
  "course_id": "biology101",
  "step": 0,
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**Response:**
```json
{
  "response": "Great question! Here's a hint: photosynthesis happens when plants get sunlight... (Source: Biology101_Chapter3.pdf, Page 12)",
  "course_id": "biology101",
  "chunks_used": 3,
  "step": 0,
  "status": "success"
}
```

**Parameters:**
- `message` (required): Student's question
- `course_id` (required): Course to retrieve content from
- `step` (0-3, default 0): Learning progression stage
- `temperature` (0.0-1.0, default 0.7): Response creativity
- `max_tokens` (default 1024): Response length

---

### Multi-Turn Chat
**POST** `/chat/multi-turn/`

Maintain conversation history with the Socratic method.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "What is photosynthesis?"},
    {"role": "assistant", "content": "Great question! Here's a hint..."},
    {"role": "user", "content": "Is it related to chlorophyll?"}
  ],
  "course_id": "biology101",
  "step": 1,
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**Response:**
```json
{
  "response": "Excellent connection! Yes, chlorophyll is the key... (Source: Biology101_Chapter3.pdf, Page 15)",
  "course_id": "biology101",
  "chunks_used": 4,
  "message_count": 3,
  "step": 1,
  "status": "success"
}
```

---

### Get Service Status
**GET** `/chat/status`

Check service availability and view step descriptions.

**Response:**
```json
{
  "status": "available",
  "service": "Gemini Socratic Tutor",
  "model": "gemini-1.5-flash",
  "prompting_method": "Step-based Socratic Method",
  "available_steps": {
    "0": "Give a small hint + ask ONE simple question",
    "1": "Ask a deeper thinking question + provide slight guidance",
    "2": "Give a clearer hint + partial explanation + follow-up question",
    "3": "Clear explanation + simple example + check understanding question"
  },
  "citation_format": "(Source: filename, Page X)"
}
```

---

## 📝 Citation System

**Every response MUST include citations.**

### Format:
```
(Source: document_name, Page number)
```

### Examples:
- `(Source: Math101_Chapter2.pdf, Page 45)`
- `(Source: Biology_Textbook_2024.pdf, Page 78)`
- Multiple citations: `(Source: Chapter1.pdf, Page 10) (Source: Chapter2.pdf, Page 20)`

### Rules:
✅ **DO:**
- Use ONLY metadata from provided course content
- Include filename and page number
- Use exact document names
- Include citations in every response

❌ **DON'T:**
- Create or guess citations
- Use external sources
- Include citations from material not provided
- Skip citations in any response

---

## 🛡️ Strict Content Rules

The system enforces these rules strictly:

### 1. **Course Content Only**
- ✅ Answer ONLY from provided course materials
- ❌ NO external knowledge
- ❌ NO hallucination
- Response if not found: **"Out of course scope"**

### 2. **Socratic Method**
- ✅ Ask guiding questions
- ✅ Promote thinking and discovery
- ✅ Build on student's existing knowledge
- ❌ NO direct answers (until Step 3)

### 3. **Keep Responses Focused**
- ✅ Short, meaningful responses
- ✅ One concept at a time
- ✅ Follow step guidelines
- ❌ NO lengthy direct explanations (except Step 3)

### 4. **Always Cite**
- ✅ Every response includes source citation
- ✅ Format: `(Source: filename, Page X)`
- ✅ Use provided metadata only

---

## 💡 Usage Examples

### Example 1: Progressive Learning (Step 0 → Step 3)

**Student reaches out at Step 0:**
```bash
curl -X POST "http://localhost:8000/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is cellular respiration?",
    "course_id": "biology101",
    "step": 0
  }'
```

**Response (Hint + Simple Question):**
```
"Great question! Here's a hint: it's the opposite of photosynthesis. 
Can you think of what plants do with the glucose they make from photosynthesis? 
(Source: Biology101_Chapter4.pdf, Page 88)"
```

**Student progresses to Step 1:**
```bash
curl -X POST "http://localhost:8000/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I think they break it down for energy?",
    "course_id": "biology101",
    "step": 1
  }'
```

**Response (Deeper Question):**
```
"Excellent thinking! Yes, they break it down. Now, here's a deeper question: 
Where in the cell do you think this breakdown happens? 
(Source: Biology101_Chapter4.pdf, Page 90)"
```

**Continue through Steps 2 and 3...**

---

### Example 2: Multi-Turn Conversation (Python)

```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Start conversation
messages = []

# First question
user_input = "What is the greenhouse effect?"
messages.append({"role": "user", "content": user_input})

response = requests.post(
    f"{BASE_URL}/chat/multi-turn/",
    json={
        "messages": messages,
        "course_id": "environmental_science",
        "step": 0
    }
)

tutor_response = response.json()["response"]
print(f"Tutor: {tutor_response}")
messages.append({"role": "assistant", "content": tutor_response})

# Follow-up question
user_input = "So it traps heat?"
messages.append({"role": "user", "content": user_input})

response = requests.post(
    f"{BASE_URL}/chat/multi-turn/",
    json={
        "messages": messages,
        "course_id": "environmental_science",
        "step": 1  # Progress to step 1
    }
)

tutor_response = response.json()["response"]
print(f"Tutor: {tutor_response}")
```

---

### Example 3: Full Learning Journey (JavaScript)

```javascript
async function learnWithSocraticMethod() {
  const course = "mathematics_101";
  let step = 0;
  const messages = [];

  async function askQuestion(question) {
    messages.push({ role: "user", content: question });
    
    const response = await fetch("http://localhost:8000/chat/multi-turn/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages,
        course_id: course,
        step: step,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    const tutorResponse = data.response;
    messages.push({ role: "assistant", content: tutorResponse });
    
    console.log(`Step ${step}: ${tutorResponse}`);
    return tutorResponse;
  }

  // Student journey
  await askQuestion("How do I solve quadratic equations?");  // Step 0
  step = 1;
  
  await askQuestion("What does the discriminant tell us?");  // Step 1
  step = 2;
  
  await askQuestion("How do I use it to find the solutions?");  // Step 2
  step = 3;
  
  await askQuestion("Can I always use the quadratic formula?");  // Step 3
}
```

---

## ⚙️ Tuning Parameters

### Temperature
Controls response creativity:
- **0.0-0.3**: Very focused, predictable (good for Step 0-1)
- **0.4-0.7**: Balanced (default, works for all steps)
- **0.8-1.0**: More varied, casual (optional for Step 3)

### Max Tokens
Controls response length:
- **256-512**: Very short responses
- **1024**: Medium responses (default, good for all steps)
- **2048**: Long, detailed responses (Step 3)

### Step Values
- **Step 0**: Beginner/initialization
- **Step 1**: Some understanding
- **Step 2**: Getting closer to mastery
- **Step 3**: Ready for full explanation

---

## 🐛 Troubleshooting

### "Out of course scope"
**Problem**: Response says the topic isn't in the course
**Solutions**:
1. Upload more PDFs for that course using `/upload/` endpoint
2. Verify course_id is correct
3. Check that search query keywords match the content

### No citations in response
**Problem**: Response missing `(Source: ..., Page X)` format
**Solutions**:
1. System enforces citations - this shouldn't happen
2. If it does, report as a bug
3. Check server logs

### Response too short or too long
**Problem**: Response doesn't match step expectations
**Solutions**:
1. Adjust `max_tokens`: lower for shorter, higher for longer
2. Verify `step` value (0-3)
3. Try different `temperature` values

### API key error
**Problem**: "GEMINI_API_KEY not set"
**Solutions**:
1. Check `.env` file has `GEMINI_API_KEY=AIzaSyA7NaS71id4RP9uBft6ywd7Z5vIzSNOyQs`
2. Restart server after updating `.env`
3. Don't include it in version control (it's in `.gitignore`)

---

## 📚 Complete Workflow

```
1. Upload PDFs
   POST /upload/?course_id=biology101
   
2. Ask first question (Step 0)
   POST /chat/
   {
     "message": "What is photosynthesis?",
     "course_id": "biology101",
     "step": 0
   }
   
   Response: Small hint + simple question
   
3. Student thinks and responds (Step 1)
   POST /chat/multi-turn/
   Messages with previous interaction + new question
   "step": 1
   
   Response: Deeper question + slight guidance
   
4. Continue through Steps 2 and 3
   Gradually increase understanding
   Eventually reach full comprehension
   
5. Student masters the concept ✓
```

---

## 🔄 Model Information

- **Model**: Gemini 1.5 Flash
- **API Key**: Set in `.env` file
- **Type**: Generative (conversational)
- **Tier**: Free (via Google AI Studio)
- **Rate Limits**: Check [Google AI Documentation](https://ai.google.dev)

---

## 📖 Model/API Limitations

- Maximum context length: Check Gemini docs
- Free tier has usage limits
- Responses honor course content only
- Citations are automatically generated from metadata

---

## ✅ Required File Structure

```
.env                    # API key (DO NOT COMMIT)
.env.example           # Template (commit this)
chat_service.py        # Core chat logic
chat_schemas.py        # Request/response models
chat_config.py         # Configuration management
main.py                # FastAPI endpoints
vector_store.py        # Content storage
pipeline.py            # PDF processing
requirements.txt       # Dependencies
test_chat_api.py       # Test suite
CHAT_API.md           # This documentation
```

---

## 🎯 Next Steps

1. ✅ API Key configured
2. ✅ Server running
3. ✅ Upload a PDF with `/upload/`
4. ✅ Test with `/chat/` endpoint
5. Build frontend integration
6. Monitor citation accuracy
7. Track student learning progression

---

## 📞 Support

- **Gemini API Issues**: [Google AI Documentation](https://ai.google.dev/docs)
- **FastAPI Help**: [FastAPI Docs](https://fastapi.tiangolo.com/)
- **This System**: Review code comments and error messages

---

## 🎓 Pedagogical Notes

The step-based system matches **Bloom's Taxonomy**:

- **Step 0**: Remember (recall facts)
- **Step 1**: Understand (grasp concepts deeply)
- **Step 2**: Apply (use in new contexts)
- **Step 3**: Analyze/Synthesize (full mastery)

This approach ensures students don't just memorize, but truly learn.

---

**Last Updated**: March 27, 2026
**API Version**: 1.0 with Step-Based Socratic Prompting
**Model**: Gemini 1.5 Flash
