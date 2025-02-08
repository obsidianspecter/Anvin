from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import asyncio
import logging

# Initialize FastAPI app
app = FastAPI()

# Configure logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request/response models
class ChatRequest(BaseModel):
    user_input: str

class ChatResponse(BaseModel):
    response: str

# Ollama API settings
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "anvin"  # Update model if needed

async def generate_response(prompt: str) -> str:
    """Sends request to Ollama and retrieves AI-generated response."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=15.0  # Timeout to prevent hanging requests
            )
            response.raise_for_status()
            data = response.json()
            
            if "response" not in data:
                raise HTTPException(status_code=500, detail="Invalid response from Ollama")

            return data.get("response", "⚠️ No response received.")
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from Ollama: {e}")
            raise HTTPException(status_code=e.response.status_code, detail="Error from Ollama API")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handles chat requests from the frontend."""
    user_input = request.user_input.strip()
    if not user_input:
        raise HTTPException(status_code=400, detail="User input cannot be empty.")

    prompt = f"Human: {user_input}\nAI:"
    try:
        response = await generate_response(prompt)
        return ChatResponse(response=response)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Chat processing error: {e}")
        raise HTTPException(status_code=500, detail="Chat processing failed.")

# Start FastAPI server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
