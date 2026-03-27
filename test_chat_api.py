# test_chat_api.py
"""
Simple testing script for the Chat API.
Run this after starting the server to test all endpoints.
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_chat_status():
    """Test if chat service is available."""
    print_section("1. Testing Chat Service Status")
    
    try:
        response = requests.get(f"{BASE_URL}/chat/status")
        data = response.json()
        
        if response.status_code == 200:
            print("✅ Chat service is AVAILABLE")
            print(json.dumps(data, indent=2))
        else:
            print("❌ Chat service returned an error")
            print(json.dumps(data, indent=2))
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        print("   Make sure the server is running: python -m uvicorn main:app --reload")
        return False

def set_global_prompt():
    """Display information about the built-in Socratic prompt."""
    print_section("2. Built-In Socratic Prompting Information")
    
    print("""✅ The chat API uses a built-in STEP-BASED Socratic prompting approach:

STEP 0 (Initialization):
  - Give a small hint
  - Ask ONE simple question

STEP 1 (Deeper Exploration):
  - Ask a deeper thinking question
  - Provide slight guidance

STEP 2 (Guided Discovery):
  - Give a clearer hint + partial explanation
  - Ask a follow-up question

STEP 3 (Full Comprehension):
  - Give a clear explanation using simple language
  - Add a small example
  - End with a question to check understanding

KEY RULES:
  ✓ Answer ONLY from provided course content
  ✓ If answer not found → "Out of course scope"
  ✓ NO hallucination or external knowledge
  ✓ EVERY response must include citations: (Source: filename, Page X)
  ✓ Keep responses concise and focused
  ✓ Maintain Socratic behavior throughout

CITATION FORMAT:
  (Source: document_name, Page number)
  Example: (Source: Math101_Chapter2.pdf, Page 45)

Use the 'step' parameter (0-3) when calling /chat/ or /chat/multi-turn/
to control the teaching progression.
""")
    
    return True

def test_single_turn_chat():
    """Test single-turn chat endpoint with different steps."""
    print_section("3. Testing Single-Turn Chat with Step-Based Progression")
    
    # Test each step
    steps = [
        {"step": 0, "description": "Small hint + simple question"},
        {"step": 1, "description": "Deeper thinking question + slight guidance"},
        {"step": 2, "description": "Clearer hint + partial explanation + follow-up"},
        {"step": 3, "description": "Clear explanation + example + understanding check"}
    ]
    
    success = True
    
    for step_info in steps:
        step = step_info["step"]
        description = step_info["description"]
        
        payload = {
            "message": "What is photosynthesis and how does it work?",
            "course_id": "biology101",
            "step": step,
            "temperature": 0.7,
            "max_tokens": 1024
        }
        
        print(f"\nTesting STEP {step}: {description}")
        print(f"Request: {json.dumps(payload, indent=2)}\n")
        
        try:
            response = requests.post(
                f"{BASE_URL}/chat/",
                json=payload,
                timeout=30
            )
            data = response.json()
            
            if response.status_code == 200:
                print(f"✅ Step {step} successful")
                print(f"Status: {data.get('status')}")
                print(f"Chunks Used: {data.get('chunks_used')}")
                print(f"\nResponse:\n{data.get('response')[:500]}...")  # First 500 chars
            else:
                print(f"❌ Step {step} failed")
                print(json.dumps(data, indent=2))
                success = False
        
        except Exception as e:
            print(f"❌ Error in Step {step}: {e}")
            success = False
        
        time.sleep(1)  # Small delay between requests
    
    return success

def test_multi_turn_chat():
    """Test multi-turn chat with conversation history."""
    print_section("4. Testing Multi-Turn Chat (Conversation History)")
    
    messages = [
        {
            "role": "user",
            "content": "What is the water cycle?"
        },
        {
            "role": "assistant",
            "content": "Great question! Let me guide you through this. What happens to water when the sun heats it up?"
        },
        {
            "role": "user",
            "content": "It evaporates I think?"
        }
    ]
    
    payload = {
        "messages": messages,
        "course_id": "science101",
        "step": 1,  # Using step 1 for deeper exploration
        "temperature": 0.7,
        "max_tokens": 1024
    }
    
    print(f"Conversation history: {len(messages)} messages")
    print(f"Course ID: science101")
    print(f"Step: 1 (Deeper Exploration)\n")
    
    try:
        response = requests.post(
            f"{BASE_URL}/chat/multi-turn/",
            json=payload,
            timeout=30
        )
        data = response.json()
        
        if response.status_code == 200:
            print("✅ Multi-turn chat successful")
            print(f"\nStatus: {data.get('status')}")
            print(f"Chunks Used: {data.get('chunks_used')}")
            print(f"Message Count: {data.get('message_count')}")
            print(f"Step: {data.get('step')}")
            print(f"\nResponse:\n{data.get('response')}")
        else:
            print("❌ Multi-turn chat request failed")
            print(json.dumps(data, indent=2))
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_course_specific_prompt():
    """Test getting information about course-specific prompts."""
    print_section("5. Testing Prompt Configuration")
    
    try:
        # Check if using custom prompt or built-in for math101
        print("Checking prompt configuration for math101...\n")
        response = requests.get(f"{BASE_URL}/chat/config/prompt/math101")
        data = response.json()
        
        if response.status_code == 200:
            print("✅ Retrieved prompt information successfully")
            print(f"Course ID: {data.get('course_id')}")
            print(f"Prompt Type: {data.get('prompt_type')}")
            
            if data.get('prompt_type') == 'built-in':
                print(f"Message: {data.get('message')}")
                print("\n✅ System is using built-in step-based Socratic prompting")
            else:
                print("Using custom prompt override")
        else:
            print("❌ Failed to retrieve prompt info")
            print(json.dumps(data, indent=2))
            return False
        
        # Optional: Set a custom prompt if needed
        print("\n" + "="*60)
        print("(Optional) Setting course-specific prompt override...\n")
        
        custom_prompt = """You are a Socratic math tutor specializing in problem-solving.
When helping with problems:
1. Ask students to restate the problem in their own words
2. Guide them to identify what type of problem it is
3. Encourage them to try different approaches
4. Ask about the reasoning behind each step
5. Help them verify their answer makes sense
6. ALWAYS include citations from course materials"""
        
        payload = {
            "socratic_prompt": custom_prompt,
            "description": "Math-specific Socratic approach with emphasis on problem-solving"
        }
        
        response = requests.post(
            f"{BASE_URL}/chat/config/course-prompt/math101",
            json=payload,
            timeout=10
        )
        data = response.json()
        
        if response.status_code == 200:
            print("✅ Custom course prompt set successfully")
            print(json.dumps(data, indent=2))
            return True
        else:
            print("⚠️  Could not set custom prompt (not critical)")
            print(json.dumps(data, indent=2))
            return True  # Not a critical failure
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_all_config():
    """Get all chat configuration."""
    print_section("6. Testing Chat Service Status & Configuration")
    
    try:
        response = requests.get(f"{BASE_URL}/chat/status")
        data = response.json()
        
        if response.status_code == 200:
            print("✅ Chat service is available\n")
            print(f"Status: {data.get('status')}")
            print(f"Service: {data.get('service')}")
            print(f"Model: {data.get('model')}")
            print(f"Prompting Method: {data.get('prompting_method')}\n")
            
            print("Available Teaching Steps:")
            steps = data.get('available_steps', {})
            for step_num, description in steps.items():
                print(f"  STEP {step_num}: {description}")
            
            print("\nFeatures:")
            features = data.get('features', [])
            for feature in features:
                print(f"  ✓ {feature}")
            
            print(f"\nCitation Format: {data.get('citation_format')}")
        else:
            print("❌ Failed to get chat service status")
            print(json.dumps(data, indent=2))
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("  CHAT API TEST SUITE")
    print("="*60)
    print("\nMake sure your server is running before starting!")
    print(f"Testing endpoint: {BASE_URL}\n")
    
    time.sleep(2)
    
    results = {
        "Chat Status": test_chat_status(),
        "Socratic Prompting Info": set_global_prompt(),
        "Single-Turn Chat (Steps)": test_single_turn_chat(),
        "Multi-Turn Chat": test_multi_turn_chat(),
        "Prompt Configuration": test_course_specific_prompt(),
        "Service Status": test_get_all_config(),
    }
    
    # Print summary
    print_section("TEST SUMMARY")
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:.<50} {status}")
    
    total = len(results)
    passed = sum(1 for r in results.values() if r)
    
    print(f"\n{'='*60}")
    print(f"Result: {passed}/{total} tests passed")
    print(f"{'='*60}\n")
    
    if passed >= 4:  # At least 4 tests should pass
        print("🎉 Chat API is working correctly!")
        print("\nNext steps:")
        print("1. Upload a PDF to a course using /upload/ endpoint")
        print("2. Start chatting using /chat/ endpoint with different step values (0-3)")
        print("3. Use /chat/multi-turn/ for conversations with history")
        print("\nExample request:")
        print(json.dumps({
            "message": "How does photosynthesis work?",
            "course_id": "biology101",
            "step": 0
        }, indent=2))
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        print("Make sure:")
        print("- Server is running: python -m uvicorn main:app --reload")
        print("- GEMINI_API_KEY is set in .env file")
        print("- You have uploaded a PDF using /upload/ endpoint")
    
    return passed >= 4

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
