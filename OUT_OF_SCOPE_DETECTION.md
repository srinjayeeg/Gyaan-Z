# 🎯 Out-of-Scope Detection Mechanism

## Overview

Your Chat API now includes a sophisticated **similarity-based out-of-scope detection mechanism** that prevents answering questions not covered in the course materials.

---

## The Mechanism

### Formula

```
If S(q, C) ≥ τ, answer is generated
Else, query is rejected
```

### Components

| Symbol | Definition | Example |
|--------|-----------|---------|
| **q** | User query | "What is photosynthesis?" |
| **C** | Retrieved context | Course materials about photosynthesis |
| **S(q, C)** | Similarity score | 0.75 (ranges 0.0 to 1.0) |
| **τ** | Similarity threshold | 0.3 (default, configurable) |

---

## How It Works

### Step 1: Query & Context Retrieval
```
User Question (q)
    ↓
Retrieve chunks from course (C)
    ↓
User Query + Course Context
```

### Step 2: Similarity Calculation S(q, C)
```
S(q, C) = Average of:
  1. Keyword Overlap (Jaccard Similarity)
     - Intersection/Union of important words
     
  2. Semantic Similarity
     - How well query concepts appear in context
     
  3. Coverage Similarity (TF-based)
     - How many query terms are covered in context
```

### Step 3: Threshold Comparison
```
Is S(q, C) ≥ τ?

YES → Generate Socratic Answer ✅
NO  → Reject as Out-of-Scope ❌
```

---

## API: In-Scope Decision Endpoint

### POST `/chat/detect-out-of-scope/`

**Check if a query is within course scope WITHOUT generating an answer.**

#### Request
```json
{
  "message": "How do I solve quadratic equations?",
  "course_id": "math101",
  "threshold": 0.3
}
```

#### Response (Query IS In Scope)
```json
{
  "is_in_scope": true,
  "similarity_score": 0.72,
  "threshold": 0.30,
  "reasoning": "Query matches course content with high confidence (score: 0.72)",
  "confidence_level": "high",
  "metrics": {
    "keyword_overlap": 0.85,
    "semantic_similarity": 0.68,
    "coverage_similarity": 0.63
  },
  "chunks_analyzed": 4,
  "recommendation": "✅ Confident: Query is clearly within scope. Proceed with detailed answer."
}
```

#### Response (Query IS Out-of-Scope)
```json
{
  "is_in_scope": false,
  "similarity_score": 0.15,
  "threshold": 0.30,
  "reasoning": "Query similarity (0.15) below threshold (0.30). Topic not covered in course materials.",
  "confidence_level": "very_low",
  "metrics": {
    "keyword_overlap": 0.10,
    "semantic_similarity": 0.15,
    "coverage_similarity": 0.20
  },
  "chunks_analyzed": 0,
  "recommendation": "❌ Out of Scope: Query not covered in course materials. Suggest uploading relevant content."
}
```

---

## Integration with Chat Endpoints

### Single-Turn Chat with Scope Check

**POST** `/chat/`

Now includes out-of-scope detection:

```json
Request:
{
  "message": "How does photosynthesis work?",
  "course_id": "biology101",
  "step": 0,
  "threshold": 0.3
}

Response (if IN scope):
{
  "response": "Great question! Here's a hint...(Source: Bio101.pdf, Page 12)",
  "course_id": "biology101",
  "chunks_used": 3,
  "step": 0,
  "status": "success",
  "similarity_score": 0.72,
  "threshold": 0.30,
  "confidence": "high"
}

Response (if OUT of scope):
{
  "response": "Out of course scope - No relevant materials found in the course...",
  "course_id": "biology101",
  "chunks_used": 0,
  "step": 0,
  "status": "out_of_scope",
  "similarity_score": 0.15,
  "threshold": 0.30,
  "confidence": "very_low"
}
```

---

## Similarity Metrics Explained

### 1. Keyword Overlap (Jaccard Similarity)

**Measure**: Intersection of query keywords ÷ Union of all keywords

**Example**:
```
Query: "photosynthesis light energy"
Context: "photosynthesis light reactions glucose energy"

Query keywords: {photosynthesis, light, energy}
Context keywords: {photosynthesis, light, reactions, glucose, energy}

Intersection: {photosynthesis, light, energy} = 3
Union: {photosynthesis, light, reactions, glucose, energy} = 5

Score: 3/5 = 0.60
```

### 2. Semantic Similarity

**Measure**: How well query concepts appear in context

**Example**:
```
Query: "What is photosynthesis?"
Context: "Photosynthesis is the process where plants convert light..."

Query words appearing in context:
- "photosynthesis" ✓
- "is" ✓
- "?" ✗

Score: 2/3 = 0.67
```

### 3. Coverage Similarity (TF-based)

**Measure**: How many query terms are covered in context

**Example**:
```
Query terms: [photosynthesis, light, energy]
Context contains:
- photosynthesis: YES ✓
- light: YES ✓
- energy: YES ✓

Score: 3/3 = 1.00
```

---

## Threshold Configuration

### Default Threshold: 0.3

This means:
- If `S(q, C) ≥ 0.3` → Accept the query
- If `S(q, C) < 0.3` → Reject as out-of-scope

### Threshold Strategies

| Threshold | Characteristic | Best For |
|-----------|-----------------|----------|
| **0.1** | Very lenient | Advanced students, broad topics |
| **0.2** | Lenient | Flexible learning environments |
| **0.3** | Balanced (default) | Most use cases |
| **0.4** | Moderate | Strict course adherence |
| **0.5** | Strict | Focused, specific topics |
| **0.6+** | Very strict | Exact matches only |

### Setting Custom Thresholds

#### In Chat Requests
```json
{
  "message": "How do I solve quadratic equations?",
  "course_id": "math101",
  "threshold": 0.45,
  "step": 0
}
```

#### In Out-of-Scope Check
```json
{
  "message": "How do I solve quadratic equations?",
  "course_id": "math101",
  "threshold": 0.45
}
```

---

## Confidence Levels

Based on similarity score and proximity to threshold:

| Confidence | Score Range | Meaning |
|-----------|-------------|---------|
| **very_low** | 0.00-0.20 | Definitely out of scope |
| **low** | 0.20-0.40 | Likely out of scope |
| **moderate** | 0.40-0.60 | Borderline, use with caution |
| **high** | 0.60-0.80 | Likely in scope |
| **very_high** | 0.80-1.00 | Definitely in scope |

---

## Response Status Values

| Status | Meaning | Action |
|--------|---------|--------|
| `success` | Query in scope, answer generated | Use response |
| `out_of_scope` | Query below threshold | Suggest uploading content |
| `no_content` | No chunks retrieved | Upload PDF first |
| `error` | Processing error | Check error message |

---

## Examples

### Example 1: Biology Course - In Scope

```
Query (q): "What is photosynthesis?"
Context (C): [Bio textbook Chapter 3: "Photosynthesis is the process..."]

Calculation:
  - Keyword Overlap: 0.85 (high match on "photosynthesis")
  - Semantic Similarity: 0.75 (concept well covered)
  - Coverage: 0.70 (most query aspects covered)
  
  Average S(q, C) = (0.85 + 0.75 + 0.70)/3 = 0.77
  
Threshold τ = 0.3

Decision: 0.77 ≥ 0.3 ✅ → GENERATE ANSWER
Response: Socratic response with citation
```

### Example 2: Biology Course - Out of Scope

```
Query (q): "How do I build a rocket?"
Context (C): [Bio textbook - no rocket content]

Calculation:
  - Keyword Overlap: 0.05 (no overlap with bio content)
  - Semantic Similarity: 0.10 (zero concept match)
  - Coverage: 0.10 (no query terms in context)
  
  Average S(q, C) = (0.05 + 0.10 + 0.10)/3 = 0.08
  
Threshold τ = 0.3

Decision: 0.08 < 0.3 ❌ → REJECT
Response: "Out of course scope - No relevant materials found..."
```

### Example 3: Math Course - Borderline Case

```
Query (q): "What about cubic equations?"
Context (C): [Math textbook Chapter 2: "...quadratic equations...polynomials..."]

Calculation:
  - Keyword Overlap: 0.40 (partial match on polynomials)
  - Semantic Similarity: 0.35 (some relevance to equations)
  - Coverage: 0.30 (limited query coverage)
  
  Average S(q, C) = (0.40 + 0.35 + 0.30)/3 = 0.35
  
Threshold τ = 0.3

Decision: 0.35 ≥ 0.3 ✅ BUT BORDERLINE
Response: Answer with ⚠️ caveat: "This is related to course content on polynomials, but we haven't covered cubic equations specifically..."
```

---

## Preventing Hallucination

The out-of-scope detection mechanism prevents:

1. **Direct Hallucination**: Answering q when C doesn't contain information
2. **Off-Topic Answers**: Providing information from memory instead of course materials
3. **Extrapolation**: Going beyond course scope to answer questions
4. **False Authority**: Claiming course coverage when topic not present

---

## Use Cases

### Scenario 1: Strict Course Adherence
```json
{
  "threshold": 0.5,
  "context": "High school biology exam prep"
}
```
Only answer questions thoroughly covered in materials.

### Scenario 2: Flexible Learning
```json
{
  "threshold": 0.2,
  "context": "Self-paced learning with supplements"
}
```
Allow related topics to be discussed.

### Scenario 3: Exact Match Required
```json
{
  "threshold": 0.7,
  "context": "Stricly follow curriculum"
}
```
Only answer directly covered topics.

---

## API Usage Patterns

### Pattern 1: Validate Before Answering
```python
# Check if in scope first
check = requests.post(
    "http://localhost:8000/chat/detect-out-of-scope/",
    json={
        "message": user_question,
        "course_id": "biology101",
        "threshold": 0.4
    }
).json()

if check["is_in_scope"]:
    # Now ask the question
    answer = requests.post(
        "http://localhost:8000/chat/",
        json={
            "message": user_question,
            "course_id": "biology101",
            "step": 0
        }
    ).json()
else:
    print(f"Out of scope: {check['recommendation']}")
```

### Pattern 2: Adaptive Threshold
```python
# Tighten threshold for strict mode, loosen for flexible
threshold = 0.5 if strict_mode else 0.2

response = requests.post(
    "http://localhost:8000/chat/",
    json={
        "message": user_question,
        "course_id": "math101",
        "threshold": threshold
    }
).json()
```

### Pattern 3: Confidence-Based Response
```python
response = requests.post(
    "http://localhost:8000/chat/",
    json={
        "message": user_question,
        "course_id": "biology101"
    }
).json()

confidence = response.get("confidence")
if confidence == "very_high":
    display_answer_prominently(response)
elif confidence == "moderate":
    display_answer_with_disclaimer(response)
else:
    suggest_more_materials(response)
```

---

## Interpretation Guide

### Understanding the Metrics

**Keyword Overlap**: How many important words match?
- 0.8+: Very strong keyword match
- 0.5-0.8: Good keyword match
- 0.2-0.5: Weak keyword match
- <0.2: Very weak match

**Semantic Similarity**: Do the concepts match?
- 0.8+: Core concepts definitely present
- 0.5-0.8: Main concepts probably present
- 0.2-0.5: Some related concepts
- <0.2: Few/no related concepts

**Coverage Similarity**: How comprehensively is the topic covered?
- 0.8+: Query is fully covered
- 0.5-0.8: Query is partly covered
- 0.2-0.5: Query is minimally covered
- <0.2: Query barely mentioned

---

## Technical Details

### Tokenization
- Converts text to lowercase
- Removes stop words (a, the, and, etc.)
- Filters non-alphabetic tokens
- Keeps tokens > 2 characters

### Stop Words Removed
Common English words like: the, a, and, or, is, are, but, in, on, of, with, for, etc.

### Normalization
- All scores normalized to 0.0-1.0 range
- Results rounded to 3 decimal places
- Always returns valid JSON

---

## Best Practices

✅ **DO:**
- Set threshold based on use case (0.2-0.5 typical)
- Use `/chat/detect-out-of-scope/` to validate questions first
- Monitor confidence levels in responses
- Periodically review out-of-scope rejections
- Adjust threshold if too many false positives/negatives

❌ **DON'T:**
- Set threshold too high (>0.7) unless very strict
- Ignore out-of-scope rejections
- Override threshold for every question
- Trust scores without considering confidence_level
- Change threshold mid-conversation

---

## Troubleshooting

### Too Many False Positives (Rejecting Valid Questions)
**Problem**: Legitimate questions marked out-of-scope
**Solution**: Lower threshold from 0.3 to 0.2 or 0.25

### Too Many False Negatives (Accepting Invalid Questions)
**Problem**: Off-topic questions getting answered
**Solution**: Raise threshold from 0.3 to 0.4 or 0.5

### Inconsistent Confidence Levels
**Problem**: Same query getting different scores
**Solution**: Ensure consistent course_id and check retrievable chunks

### All Queries Rejected
**Problem**: Nothing passes the threshold check
**Solution**: 
1. Verify course has PDFs uploaded
2. Lower threshold
3. Check /chat/detect-out-of-scope/ for detailed metrics

---

## Technical Implementation

The system uses:
- **Similarity Calculation**: Multi-metric averaging approach
- **Token Matching**: TF-based coverage analysis
- **Threshold Comparison**: Simple >= logic
- **Confidence Classification**: Score-based confidence mapping

See `out_of_scope_detector.py` for implementation details.

---

## Summary

Your Chat API now enforces strict course boundaries:

```
Query: "How do I build a rocket?"
Course: Biology 101 materials only

S(q, C) = 0.08 (query not in course materials)
τ = 0.30 (threshold)

S(q, C) < τ
0.08 < 0.30
❌ REJECT

Response: "Out of course scope - No relevant materials found"
```

This prevents hallucination and ensures all answers are grounded in course content!
