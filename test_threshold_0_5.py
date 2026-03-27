#!/usr/bin/env python3
"""
Quick test script for out-of-scope detection with threshold 0.5
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_out_of_scope_detection():
    """Test the out-of-scope detection with threshold 0.5"""

    print("🧪 Testing Out-of-Scope Detection with Threshold 0.5")
    print("=" * 60)

    # Test 1: Check scope detection
    print("\n1. Testing scope detection endpoint:")
    try:
        response = requests.post(
            f"{BASE_URL}/chat/detect-out-of-scope/",
            json={
                "message": "What is photosynthesis?",
                "course_id": "java123",
                "threshold": 0.5
            },
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            print("✅ API Response:")
            print(json.dumps(data, indent=2))

            # Check if similarity score is included
            if "similarity_score" in data:
                score = data["similarity_score"]
                threshold = data["threshold"]
                is_in_scope = data["is_in_scope"]
                confidence = data["confidence_level"]

                print("\n📊 Results:")
                print(f"   Similarity Score S(q, C): {score:.3f}")
                print(f"   Threshold τ: {threshold}")
                print(f"   In Scope: {is_in_scope}")
                print(f"   Confidence: {confidence}")
                print(f"   Formula: {score:.3f} ≥ {threshold} = {score >= threshold}")

                if score >= threshold:
                    print("   ✅ Decision: ANSWER GENERATED")
                else:
                    print("   ❌ Decision: QUERY REJECTED")

            else:
                print("❌ Missing similarity_score in response")

        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"❌ Error: {e}")

    # Test 2: Test full chat endpoint
    print("\n2. Testing full chat endpoint:")
    try:
        response = requests.post(
            f"{BASE_URL}/chat/",
            json={
                "message": "What is photosynthesis?",
                "course_id": "java123",
                "threshold": 0.5,
                "step": 0
            },
            timeout=15
        )

        if response.status_code == 200:
            data = response.json()
            print("✅ Chat Response:")
            print(f"   Status: {data.get('status')}")
            print(f"   Similarity Score: {data.get('similarity_score', 'N/A')}")
            print(f"   Threshold: {data.get('threshold', 'N/A')}")
            print(f"   Confidence: {data.get('confidence', 'N/A')}")
            print(f"   Response: {data.get('response', '')[:100]}...")

        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"❌ Error: {e}")

    print("\n" + "=" * 60)
    print("🎯 Test Complete!")

if __name__ == "__main__":
    test_out_of_scope_detection()