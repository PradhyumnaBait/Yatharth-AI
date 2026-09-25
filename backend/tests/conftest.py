import pytest
import asyncio
from backend.app.seed.demo_reset import reset_demo_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Ensures clean canonical database before test session."""
    asyncio.run(reset_demo_database())
    yield
