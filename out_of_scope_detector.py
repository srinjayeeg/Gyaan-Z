# out_of_scope_detector.py
"""
Out-of-Scope Detection Mechanism

Implements similarity scoring between user query and retrieved context.
Rejects queries if similarity score falls below threshold.

Formula:
    If S(q, C) ≥ τ, answer is generated
    Else, query is rejected as out-of-scope
    
Where:
    q = user query
    C = retrieved context
    S(q, C) = similarity score
    τ = threshold
"""

from typing import Dict, List, Tuple
import math
from collections import Counter


class OutOfScopeDetector:
    """
    Detects if a user query is within the scope of retrieved course content.
    
    Uses similarity scoring between query and context to determine if sufficient
    relevant material exists to answer the question.
    """
    
    def __init__(self, default_threshold: float = 0.5):
        """
        Initialize the out-of-scope detector.
        
        Args:
            default_threshold: Default similarity threshold (0.0-1.0)
                - Lower values (0.1-0.3): More lenient, accepts broader queries
                - Medium values (0.4-0.6): Balanced, recommended
                - Higher values (0.7-1.0): Strict, only exact matches
        """
        self.default_threshold = default_threshold
        self._validate_threshold(default_threshold)
    
    @staticmethod
    def _validate_threshold(threshold: float):
        """Validate threshold is between 0 and 1."""
        if not 0.0 <= threshold <= 1.0:
            raise ValueError("Threshold must be between 0.0 and 1.0")
    
    def calculate_similarity(self, query: str, context: str) -> float:
        """
        Calculate similarity score between query and context.
        
        Uses multiple similarity metrics and averages them:
        1. Keyword overlap (TF-based)
        2. Semantic token matching
        3. Length-normalized matching
        
        Args:
            query: User's question
            context: Retrieved course content
            
        Returns:
            Similarity score between 0.0 and 1.0
        """
        if not query or not context:
            return 0.0
        
        # Get keywords from both
        query_tokens = self._tokenize(query)
        context_tokens = self._tokenize(context)
        
        if not query_tokens or not context_tokens:
            return 0.0
        
        # Calculate three different similarity metrics
        keyword_similarity = self._keyword_overlap(query_tokens, context_tokens)
        semantic_similarity = self._semantic_similarity(query, context)
        coverage_similarity = self._coverage_similarity(query_tokens, context_tokens)
        
        # Average the scores (equal weighting)
        overall_similarity = (keyword_similarity + semantic_similarity + coverage_similarity) / 3.0
        
        return min(1.0, max(0.0, overall_similarity))
    
    @staticmethod
    def _tokenize(text: str) -> List[str]:
        """
        Tokenize text into meaningful words.
        
        Args:
            text: Text to tokenize
            
        Returns:
            List of lowercase tokens
        """
        # Convert to lowercase and split
        tokens = text.lower().split()
        
        # Remove common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could',
            'will', 'would', 'should', 'may', 'might', 'must', 'shall', 'this',
            'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'what', 'which', 'who', 'when', 'where', 'why', 'how'
        }
        
        # Filter out stop words and non-alphabetic tokens
        meaningful_tokens = [
            token for token in tokens
            if token not in stop_words and len(token) > 2
        ]
        
        return meaningful_tokens
    
    @staticmethod
    def _keyword_overlap(query_tokens: List[str], context_tokens: List[str]) -> float:
        """
        Calculate keyword overlap similarity.
        
        Uses Jaccard similarity: intersection / union
        
        Args:
            query_tokens: Tokenized query
            context_tokens: Tokenized context
            
        Returns:
            Similarity score 0.0-1.0
        """
        query_set = set(query_tokens)
        context_set = set(context_tokens)
        
        if not query_set or not context_set:
            return 0.0
        
        intersection = len(query_set & context_set)
        union = len(query_set | context_set)
        
        if union == 0:
            return 0.0
        
        return intersection / union
    
    @staticmethod
    def _semantic_similarity(query: str, context: str) -> float:
        """
        Calculate semantic similarity using token frequency matching.
        
        Measures how well query concepts appear in context.
        
        Args:
            query: User's question
            context: Retrieved content
            
        Returns:
            Similarity score 0.0-1.0
        """
        query_lower = query.lower()
        context_lower = context.lower()
        
        # Check if query concepts appear in context
        # (Simple substring and word matching)
        query_words = query_lower.split()
        matched_words = sum(1 for word in query_words if word in context_lower)
        
        if not query_words:
            return 0.0
        
        return matched_words / len(query_words)
    
    @staticmethod
    def _coverage_similarity(query_tokens: List[str], context_tokens: List[str]) -> float:
        """
        Calculate how well context covers query topics.
        
        Uses TF (term frequency) based coverage.
        
        Args:
            query_tokens: Tokenized query
            context_tokens: Tokenized context
            
        Returns:
            Similarity score 0.0-1.0
        """
        if not query_tokens:
            return 0.0
        
        # Count term frequencies
        context_counter = Counter(context_tokens)
        
        # Check how many query terms appear in context
        covered_terms = sum(
            min(1, context_counter.get(token, 0))
            for token in query_tokens
        )
        
        return covered_terms / len(query_tokens)
    
    def is_in_scope(
        self,
        query: str,
        context_chunks: List[Dict],
        threshold: float = None
    ) -> Tuple[bool, float, str]:
        """
        Determine if query is within scope of retrieved context.
        
        Args:
            query: User's question
            context_chunks: Retrieved content chunks from vector store
            threshold: Similarity threshold (uses default if not provided)
            
        Returns:
            Tuple of (is_in_scope, similarity_score, reasoning)
            - is_in_scope: Boolean indicating if query matches context
            - similarity_score: Calculated similarity (0.0-1.0)
            - reasoning: Explanation of the decision
        """
        threshold = threshold or self.default_threshold
        self._validate_threshold(threshold)
        
        if not context_chunks:
            return (
                False,
                0.0,
                "No relevant learning materials found in the course."
            )
        
        # Combine all context chunks
        combined_context = " ".join([
            chunk.get("content", "")
            for chunk in context_chunks
            if chunk.get("content")
        ])
        
        if not combined_context.strip():
            return (
                False,
                0.0,
                "Retrieved materials contain no content."
            )
        
        # Calculate similarity
        similarity_score = self.calculate_similarity(query, combined_context)
        
        # Determine if in scope
        is_in_scope = similarity_score >= threshold
        
        # Generate reasoning
        if is_in_scope:
            confidence = "high" if similarity_score >= 0.7 else "moderate" if similarity_score >= 0.5 else "low"
            reasoning = f"Query matches course content with {confidence} confidence (score: {similarity_score:.2f})"
        else:
            reasoning = f"Query similarity ({similarity_score:.2f}) below threshold ({threshold:.2f}). Topic not covered in course materials."
        
        return is_in_scope, similarity_score, reasoning
    
    def check_with_details(
        self,
        query: str,
        context_chunks: List[Dict],
        threshold: float = None
    ) -> Dict:
        """
        Comprehensive out-of-scope check with detailed metrics.
        
        Args:
            query: User's question
            context_chunks: Retrieved content chunks
            threshold: Similarity threshold
            
        Returns:
            Dictionary with detailed analysis
        """
        is_in_scope, similarity_score, reasoning = self.is_in_scope(
            query, context_chunks, threshold
        )
        
        # Get detailed metrics for transparency
        combined_context = " ".join([
            chunk.get("content", "")
            for chunk in context_chunks
            if chunk.get("content")
        ])
        
        details = {
            "is_in_scope": is_in_scope,
            "similarity_score": round(similarity_score, 3),
            "threshold": threshold or self.default_threshold,
            "reasoning": reasoning,
            "metrics": {
                "keyword_overlap": round(
                    self._keyword_overlap(
                        self._tokenize(query),
                        self._tokenize(combined_context)
                    ), 3
                ) if combined_context else 0.0,
                "semantic_similarity": round(
                    self._semantic_similarity(query, combined_context), 3
                ) if combined_context else 0.0,
                "coverage_similarity": round(
                    self._coverage_similarity(
                        self._tokenize(query),
                        self._tokenize(combined_context)
                    ), 3
                ) if combined_context else 0.0,
            },
            "chunks_analyzed": len(context_chunks),
            "confidence_level": self._get_confidence_level(similarity_score)
        }
        
        return details
    
    @staticmethod
    def _get_confidence_level(similarity_score: float) -> str:
        """
        Categorize confidence level based on similarity score.
        
        Args:
            similarity_score: Similarity score 0.0-1.0
            
        Returns:
            Confidence level: "very_low", "low", "moderate", "high", "very_high"
        """
        if similarity_score >= 0.8:
            return "very_high"
        elif similarity_score >= 0.6:
            return "high"
        elif similarity_score >= 0.4:
            return "moderate"
        elif similarity_score >= 0.2:
            return "low"
        else:
            return "very_low"
    
    def get_recommendation(
        self,
        similarity_score: float,
        threshold: float = None
    ) -> str:
        """
        Get a recommendation based on similarity score.
        
        Args:
            similarity_score: Calculated similarity (0.0-1.0)
            threshold: Reference threshold
            
        Returns:
            Recommendation string
        """
        threshold = threshold or self.default_threshold
        
        if similarity_score >= threshold + 0.2:
            return "✅ Confident: Query is clearly within scope. Proceed with detailed answer."
        elif similarity_score >= threshold:
            return "⚠️  Marginal: Query is within scope but with lower confidence. Provide answer with caveats."
        elif similarity_score >= threshold - 0.1:
            return "❌ Borderline: Query is slightly out of scope. Consider suggesting related topics."
        else:
            return "❌ Out of Scope: Query not covered in course materials. Suggest uploading relevant content."
