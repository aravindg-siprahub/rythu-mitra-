# Qdrant Vector Database Configuration
"""
Qdrant Collections for Rythu Mitra Enterprise Command Center

This file defines the vector database schema for:
1. Agriculture Knowledge Base (RAG)
2. Crop Disease Embeddings (CV similarity)
3. Market Price Patterns (time-series similarity)
"""

from qdrant_client import models

QDRANT_COLLECTIONS = {
    "agriculture_knowledge": {
        "vectors_config": {
            "size": 1536,  # OpenAI text-embedding-3-small
            "distance": models.Distance.COSINE
        },
        "payload_schema": {
            "source": "str",
            "category": "str",  # crop_guide, pest_management, soil_health, etc.
            "language": "str",
            "last_updated": "datetime"
        }
    },
    
    "crop_disease_embeddings": {
        "vectors_config": {
            "size": 512,  # ResNet/MobileNet feature extraction
            "distance": models.Distance.COSINE
        },
        "payload_schema": {
            "disease_name": "str",
            "crop_type": "str",
            "treatment": "text",
            "image_features": "array",
            "severity": "str"
        }
    },
    
    "market_price_patterns": {
        "vectors_config": {
            "size": 256,  # Time-series embeddings
            "distance": models.Distance.EUCLIDEAN
        },
        "payload_schema": {
            "crop": "str",
            "season": "str",
            "region": "str",
            "historical_pattern": "array",
            "volatility_score": "float"
        }
    }
}


def create_collections(client):
    """
    Initialize all Qdrant collections
    
    Usage:
        from qdrant_client import QdrantClient
        client = QdrantClient(url=settings.QDRANT_URL)
        create_collections(client)
    """
    for collection_name, config in QDRANT_COLLECTIONS.items():
        # Check if collection exists
        collections = client.get_collections().collections
        exists = any(c.name == collection_name for c in collections)
        
        if not exists:
            client.create_collection(
                collection_name=collection_name,
                vectors_config=config["vectors_config"]
            )
            print(f"✓ Created collection: {collection_name}")
        else:
            print(f"→ Collection already exists: {collection_name}")


# Example: Adding data to agriculture_knowledge
def index_agriculture_document(client, text: str, metadata: dict):
    """
    Index a single agriculture knowledge document
    
    Args:
        client: QdrantClient instance
        text: Document text
        metadata: {source, category, language}
    """
    from langchain_openai import OpenAIEmbeddings
    import os
    import uuid

    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=os.getenv("OPENROUTER_API_KEY", ""),
        openai_api_base=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
    )
    vector = embeddings.embed_query(text)

    client.upsert(
        collection_name="agriculture_knowledge",
        points=[
            models.PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={
                    "text": text,
                    **metadata
                }
            )
        ]
    )
