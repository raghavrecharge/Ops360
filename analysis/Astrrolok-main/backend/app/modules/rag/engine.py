import os
import json
import pickle
import numpy as np
import faiss
from typing import List, Dict, Tuple
from openai import OpenAI
from pypdf import PdfReader
from docx import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

class RAGEngine:
    """RAG engine using FAISS and OpenAI embeddings"""
    
    def __init__(self):
        self.index_path = settings.FAISS_INDEX_PATH
        self.dimension = 1536  # OpenAI text-embedding-3-small
        self.index = None
        self.chunks = []
        self.metadata = []
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        self.load_index()
    
    def load_index(self):
        """Load existing FAISS index or create new one"""
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        
        if os.path.exists(f"{self.index_path}/index.faiss"):
            self.index = faiss.read_index(f"{self.index_path}/index.faiss")
            with open(f"{self.index_path}/chunks.pkl", 'rb') as f:
                self.chunks = pickle.load(f)
            with open(f"{self.index_path}/metadata.pkl", 'rb') as f:
                self.metadata = pickle.load(f)
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
    
    def save_index(self):
        """Save FAISS index and metadata"""
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        faiss.write_index(self.index, f"{self.index_path}/index.faiss")
        
        with open(f"{self.index_path}/chunks.pkl", 'wb') as f:
            pickle.dump(self.chunks, f)
        
        with open(f"{self.index_path}/metadata.pkl", 'wb') as f:
            pickle.dump(self.metadata, f)
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings using OpenAI API"""
        embeddings = []
        
        # Process in batches of 100
        for i in range(0, len(texts), 100):
            batch = texts[i:i+100]
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=batch
            )
            batch_embeddings = [item.embedding for item in response.data]
            embeddings.extend(batch_embeddings)
        
        return np.array(embeddings, dtype='float32')
    
    def extract_text_from_pdf(self, file_path: str) -> List[Tuple[str, int]]:
        """Extract text from PDF with page numbers"""
        reader = PdfReader(file_path)
        text_with_pages = []
        
        for page_num, page in enumerate(reader.pages, start=1):
            text = page.extract_text()
            if text.strip():
                text_with_pages.append((text, page_num))
        
        return text_with_pages
    
    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    
    def extract_text_from_json(self, file_path: str) -> List[Dict]:
        """Extract documents from JSON knowledge base"""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        documents = []
        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict) and 'content' in item:
                    documents.append({
                        'text': item['content'],
                        'title': item.get('title', 'Untitled')
                    })
        elif isinstance(data, dict):
            for key, value in data.items():
                documents.append({
                    'text': str(value),
                    'title': key
                })
        
        return documents
    
    def extract_qa_pairs(self, file_path: str) -> List[Dict]:
        """Extract Q&A pairs from text file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        qa_pairs = []
        lines = content.split('\n')
        current_q = None
        current_a = []
        
        for line in lines:
            line = line.strip()
            if line.startswith('Q:') or line.startswith('Question:'):
                if current_q and current_a:
                    qa_pairs.append({
                        'question': current_q,
                        'answer': ' '.join(current_a)
                    })
                current_q = line.split(':', 1)[1].strip()
                current_a = []
            elif line.startswith('A:') or line.startswith('Answer:'):
                current_a.append(line.split(':', 1)[1].strip())
            elif line and current_q:
                current_a.append(line)
        
        if current_q and current_a:
            qa_pairs.append({
                'question': current_q,
                'answer': ' '.join(current_a)
            })
        
        return qa_pairs
    
    def ingest_file(self, file_path: str, source_name: str) -> Dict:
        """Ingest a file into the knowledge base"""
        chunks_added = 0
        file_ext = os.path.splitext(file_path)[1].lower()
        
        try:
            if file_ext == '.pdf':
                text_with_pages = self.extract_text_from_pdf(file_path)
                for text, page_num in text_with_pages:
                    text_chunks = self.text_splitter.split_text(text)
                    for chunk in text_chunks:
                        self.chunks.append(chunk)
                        self.metadata.append({
                            'source': source_name,
                            'page': page_num,
                            'type': 'pdf'
                        })
                        chunks_added += 1
            
            elif file_ext == '.docx':
                text = self.extract_text_from_docx(file_path)
                text_chunks = self.text_splitter.split_text(text)
                for chunk in text_chunks:
                    self.chunks.append(chunk)
                    self.metadata.append({
                        'source': source_name,
                        'type': 'docx'
                    })
                    chunks_added += 1
            
            elif file_ext == '.json':
                documents = self.extract_text_from_json(file_path)
                for doc in documents:
                    text_chunks = self.text_splitter.split_text(doc['text'])
                    for chunk in text_chunks:
                        self.chunks.append(chunk)
                        self.metadata.append({
                            'source': source_name,
                            'title': doc['title'],
                            'type': 'json'
                        })
                        chunks_added += 1
            
            elif file_ext == '.txt':
                qa_pairs = self.extract_qa_pairs(file_path)
                for qa in qa_pairs:
                    combined_text = f"Q: {qa['question']}\nA: {qa['answer']}"
                    self.chunks.append(combined_text)
                    self.metadata.append({
                        'source': source_name,
                        'type': 'qa',
                        'question': qa['question']
                    })
                    chunks_added += 1
            
            # Generate embeddings for new chunks
            if chunks_added > 0:
                start_idx = len(self.chunks) - chunks_added
                new_chunks = self.chunks[start_idx:]
                embeddings = self.generate_embeddings(new_chunks)
                
                # Add to FAISS index
                self.index.add(embeddings)
                
                # Save index
                self.save_index()
            
            return {
                'status': 'success',
                'chunks_added': chunks_added,
                'total_chunks': len(self.chunks)
            }
        
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'chunks_added': 0
            }
    
    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        """Search for relevant chunks"""
        if len(self.chunks) == 0:
            return []
        
        # Generate query embedding
        query_embedding = self.generate_embeddings([query])
        
        # Search in FAISS
        distances, indices = self.index.search(query_embedding, min(top_k, len(self.chunks)))
        
        results = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx < len(self.chunks):
                results.append({
                    'content': self.chunks[idx],
                    'metadata': self.metadata[idx],
                    'similarity': float(1 / (1 + distance))  # Convert distance to similarity
                })
        
        return results
    
    def import_demo_kb(self) -> Dict:
        """Import all demo KB files from /mnt/data"""
        demo_files = [
            '/mnt/data/AskAstroBot_KnowledgeBase.json',
            '/mnt/data/alokgpt_combined_QA.txt',
            '/mnt/data/Astrological_Prediction_Stepwise_Rulebook.pdf',
            '/mnt/data/Module_01_Jyotish_Karma_Asttrolok.pdf',
            '/mnt/data/Parashara (2).docx'
        ]
        
        results = []
        total_chunks = 0
        
        for file_path in demo_files:
            if os.path.exists(file_path):
                source_name = os.path.basename(file_path)
                result = self.ingest_file(file_path, source_name)
                results.append(result)
                total_chunks += result.get('chunks_added', 0)
        
        return {
            'status': 'completed',
            'files_processed': len(results),
            'total_chunks': total_chunks,
            'details': results
        }

rag_engine = RAGEngine()
