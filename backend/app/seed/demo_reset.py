import asyncio
from sqlalchemy import delete
from backend.app.db.session import engine, Base, AsyncSessionLocal
from backend.app.seed.canonical_seed import seed_canonical_data
from backend.app.models.entities import (
    User, Project, ProjectMember, Schedule, WBSNode, Activity, ActivityRelationship,
    ActivityProgressUnit, FieldReport, ExtractedEvent, ActivityMatch, MatchCandidate,
    ProgressEvent, ReviewAction, AuditLog, DictionaryTerm, DictionaryTermSource,
    MatchingConfig, Session, Notification, ConversationMessage, AccessRequest,
    DelayCause, ProjectMemoryInsight
)

async def reset_demo_database():
    """
    Cleans all tables and re-seeds canonical state per SPEC §9.
    """
    async with AsyncSessionLocal() as session:
        for model in [
            AuditLog, ProgressEvent, ReviewAction, MatchCandidate, ActivityMatch,
            ExtractedEvent, FieldReport, ActivityProgressUnit, ActivityRelationship,
            Activity, WBSNode, Schedule, ProjectMember, Session, Notification,
            ConversationMessage, AccessRequest, DelayCause, ProjectMemoryInsight,
            DictionaryTermSource, DictionaryTerm, MatchingConfig, User, Project
        ]:
            await session.execute(delete(model))
        await session.commit()

    await seed_canonical_data()
    print("Database reset to clean canonical state.")

if __name__ == "__main__":
    asyncio.run(reset_demo_database())
