"""
LLM Provider Abstraction Layer
Supports OpenAI via Emergent Universal Key
Designed for easy extension to other providers
"""
import os
from typing import Optional, List, Dict, Any
from abc import ABC, abstractmethod
import numpy as np
from dotenv import load_dotenv

load_dotenv()


class LLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    @abstractmethod
    async def chat(self, messages: List[Dict], system_message: str = None) -> str:
        pass
    
    @abstractmethod
    async def embed(self, texts: List[str]) -> List[List[float]]:
        pass


class OpenAIProvider(LLMProvider):
    """OpenAI provider using Emergent Universal Key"""
    
    def __init__(self):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not set in environment")
        
        self.chat_model = "gpt-4o-mini"
        self.embedding_model = "text-embedding-3-small"
        self.embedding_dimensions = 1536
    
    async def chat(
        self, 
        messages: List[Dict], 
        system_message: str = None,
        temperature: float = 0.7
    ) -> str:
        """Generate chat completion using gpt-4o-mini"""
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Build conversation
        chat = LlmChat(
            api_key=self.api_key,
            session_id="rag-chat",
            system_message=system_message or "You are a knowledgeable Vedic astrology assistant."
        ).with_model("openai", self.chat_model)
        
        # For RAG, we typically have a single user message with context
        last_user_msg = None
        for msg in messages:
            if msg.get("role") == "user":
                last_user_msg = msg.get("content", "")
        
        if not last_user_msg:
            return "No user message provided."
        
        user_message = UserMessage(text=last_user_msg)
        response = await chat.send_message(user_message)
        return response
    
    async def embed(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using text-embedding-3-small"""
        import openai
        
        client = openai.AsyncOpenAI(api_key=self.api_key)
        
        # Handle empty texts
        if not texts:
            return []
        
        # OpenAI embedding API
        response = await client.embeddings.create(
            model=self.embedding_model,
            input=texts
        )
        
        embeddings = [item.embedding for item in response.data]
        return embeddings
    
    async def embed_single(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        embeddings = await self.embed([text])
        return embeddings[0] if embeddings else []


class LLMProviderFactory:
    """Factory to get LLM provider instances"""
    
    _providers = {
        "openai": OpenAIProvider
    }
    
    @classmethod
    def get_provider(cls, provider_name: str = "openai") -> LLMProvider:
        """Get provider instance by name"""
        provider_class = cls._providers.get(provider_name.lower())
        if not provider_class:
            raise ValueError(f"Unknown provider: {provider_name}. Available: {list(cls._providers.keys())}")
        return provider_class()
    
    @classmethod
    def register_provider(cls, name: str, provider_class: type):
        """Register a new provider"""
        cls._providers[name.lower()] = provider_class


# Default provider instance
def get_llm_provider() -> LLMProvider:
    """Get the default LLM provider (OpenAI)"""
    return LLMProviderFactory.get_provider("openai")
