import asyncio
from backend.app.db.session import engine, Base
import backend.app.models  # ensure models are registered

async def init_database():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables initialized successfully.")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_database())
