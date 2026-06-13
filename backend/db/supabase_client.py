import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Load .env from backend/ or parent khetwise/ — works from any cwd
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")
load_dotenv()  # fallback

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
            )
        _client = create_client(url, key)
    return _client
