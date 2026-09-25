import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, 
    Text, UniqueConstraint, Index, JSON
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

# 1. Users
class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    employee_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(30), nullable=False)  # SUPERVISOR, PLANNER, PM, ADMIN
    phone = Column(String(30), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    pin_hash = Column(String(255), nullable=False)
    failed_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    project_memberships = relationship("ProjectMember", back_populates="user")
    sessions = relationship("Session", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

# 2. Projects
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    data_date = Column(String(50), nullable=False)  # e.g. "20 Sep 2026"
    physical_progress = Column(Float, default=0.0, nullable=False)
    planned_progress = Column(Float, default=0.0, nullable=False)
    baseline_version = Column(String(30), default="v1", nullable=False)
    is_populated = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    schedules = relationship("Schedule", back_populates="project")
    members = relationship("ProjectMember", back_populates="project")
    field_reports = relationship("FieldReport", back_populates="project")
    audit_logs = relationship("AuditLog", back_populates="project")

# 3. Project Members
class ProjectMember(Base):
    __tablename__ = "project_members"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(30), nullable=False)
    
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")

    __table_args__ = (UniqueConstraint("project_id", "user_id", name="uq_project_user"),)

# 4. Schedules
class Schedule(Base):
    __tablename__ = "schedules"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    version = Column(String(30), nullable=False)
    is_baseline = Column(Boolean, default=False, nullable=False)
    data_date = Column(String(50), nullable=False)
    is_current = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    project = relationship("Project", back_populates="schedules")
    wbs_nodes = relationship("WBSNode", back_populates="schedule")
    activities = relationship("Activity", back_populates="schedule")

# 5. WBS Nodes
class WBSNode(Base):
    __tablename__ = "wbs_nodes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    schedule_id = Column(String(36), ForeignKey("schedules.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    parent_id = Column(String(36), ForeignKey("wbs_nodes.id", ondelete="RESTRICT"), nullable=True)
    path = Column(String(500), nullable=False)  # e.g. "Pipeline > North Zone > Section 4B"

    schedule = relationship("Schedule", back_populates="wbs_nodes")

# 6. Activities
class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    schedule_id = Column(String(36), ForeignKey("schedules.id", ondelete="CASCADE"), nullable=False)
    external_task_id = Column(String(50), nullable=False, index=True)  # e.g. "PIP-24-017"
    name = Column(String(255), nullable=False)
    phase_id = Column(String(50), nullable=False)
    phase_name = Column(String(100), nullable=False)
    status = Column(String(30), default="Not started", nullable=False)  # "Not started", "In progress", "Complete"
    physical_percent = Column(Float, default=0.0, nullable=False)
    planned_start = Column(String(50), nullable=True)
    planned_finish = Column(String(50), nullable=True)
    actual_start = Column(String(50), nullable=True)
    actual_finish = Column(String(50), nullable=True)
    quantity_total = Column(Float, nullable=True)
    quantity_completed = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    is_critical = Column(Boolean, default=False, nullable=False)
    is_out_of_sequence = Column(Boolean, default=False, nullable=False)
    
    # D21 Contextual embedding text
    embedding_context_text = Column(Text, nullable=True)
    
    # D19 Sparse search keywords / normalized tokens
    search_tsv = Column(Text, nullable=True)
    
    # Dense vector representation (stored as JSON array of floats for universal DB compatibility)
    embedding = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    schedule = relationship("Schedule", back_populates="activities")
    progress_units = relationship("ActivityProgressUnit", back_populates="activity")

# 7. Activity Relationships
class ActivityRelationship(Base):
    __tablename__ = "activity_relationships"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    predecessor_id = Column(String(36), ForeignKey("activities.id", ondelete="CASCADE"), nullable=False)
    successor_id = Column(String(36), ForeignKey("activities.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(10), default="FS", nullable=False)  # FS, SS, FF
    lag = Column(Integer, default=0, nullable=False)

# 8. Activity Progress Units (Sub-ledger for accumulators)
class ActivityProgressUnit(Base):
    __tablename__ = "activity_progress_units"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    activity_id = Column(String(36), ForeignKey("activities.id", ondelete="CASCADE"), nullable=False)
    unit_label = Column(String(100), nullable=False)  # e.g. "Spool 17"
    status = Column(String(30), default="COMPLETED", nullable=False)
    completed_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    source_event_id = Column(String(36), nullable=True)

    activity = relationship("Activity", back_populates="progress_units")
    __table_args__ = (UniqueConstraint("activity_id", "unit_label", name="uq_activity_unit"),)

# 9. Field Reports
class FieldReport(Base):
    __tablename__ = "field_reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=True)
    author_name = Column(String(100), nullable=False)
    author_role = Column(String(50), nullable=False)
    author_phone = Column(String(30), nullable=True)
    author_crew = Column(String(100), nullable=True)
    source = Column(String(30), nullable=False)  # "voice", "excel", "pdf", "manual"
    raw_text = Column(Text, nullable=False)
    audio_url = Column(String(255), nullable=True)
    thumbnail_url = Column(String(255), nullable=True)
    status = Column(String(30), default="RECEIVED", nullable=False)  # RECEIVED, TRANSCRIBED, FAILED
    degraded_mode = Column(Boolean, default=False, nullable=False)  # D18 / D22
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    project = relationship("Project", back_populates="field_reports")
    extracted_events = relationship("ExtractedEvent", back_populates="field_report")
    evidence_items = relationship("Evidence", back_populates="field_report")

# 10. Extracted Events
class ExtractedEvent(Base):
    __tablename__ = "extracted_events"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    field_report_id = Column(String(36), ForeignKey("field_reports.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(100), nullable=True)
    object = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    status = Column(String(50), nullable=True)
    quantity = Column(String(50), nullable=True)
    unit = Column(String(50), nullable=True)
    confidence = Column(Float, default=1.0, nullable=False)
    raw_extraction_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    field_report = relationship("FieldReport", back_populates="extracted_events")
    matches = relationship("ActivityMatch", back_populates="extracted_event")

# 11. Activity Matches
class ActivityMatch(Base):
    __tablename__ = "activity_matches"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    extracted_event_id = Column(String(36), ForeignKey("extracted_events.id", ondelete="CASCADE"), nullable=False)
    suggested_activity_id = Column(String(36), ForeignKey("activities.id", ondelete="SET NULL"), nullable=True)
    suggested_activity_name = Column(String(255), nullable=True)
    confidence = Column(Float, nullable=False)
    decision_tier = Column(String(30), nullable=False)  # AUTO_ACCEPT, REVIEW, UNMATCHED, DELAY, WARNING
    match_method = Column(String(50), default="AI_MATCH", nullable=False)  # AI_MATCH, PLANNER_OVERRIDE, PLANNER_MANUAL_SEARCH
    logic_check_result = Column(String(30), default="PASSED", nullable=False)  # PASSED, WARNING, FAILED
    logic_check_message = Column(Text, nullable=True)
    retrieval_sources = Column(String(50), nullable=True)  # dense, sparse, both
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    extracted_event = relationship("ExtractedEvent", back_populates="matches")
    candidates = relationship("MatchCandidate", back_populates="activity_match")
    review_actions = relationship("ReviewAction", back_populates="activity_match")
    progress_events = relationship("ProgressEvent", back_populates="activity_match")

# 12. Match Candidates
class MatchCandidate(Base):
    __tablename__ = "match_candidates"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    activity_match_id = Column(String(36), ForeignKey("activity_matches.id", ondelete="CASCADE"), nullable=False)
    activity_id = Column(String(36), ForeignKey("activities.id", ondelete="CASCADE"), nullable=False)
    dense_rank = Column(Integer, nullable=True)
    sparse_rank = Column(Integer, nullable=True)
    rrf_score = Column(Float, nullable=True)
    rerank_score = Column(Float, nullable=False)
    reasons = Column(JSON, nullable=True)  # List of {label, matchedText}

    activity_match = relationship("ActivityMatch", back_populates="candidates")

# 13. Progress Events
class ProgressEvent(Base):
    __tablename__ = "progress_events"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    activity_match_id = Column(String(36), ForeignKey("activity_matches.id", ondelete="CASCADE"), nullable=False)
    activity_id = Column(String(36), ForeignKey("activities.id", ondelete="CASCADE"), nullable=False)
    percent_old = Column(Float, nullable=False)
    percent_new = Column(Float, nullable=False)
    delta = Column(Float, nullable=False)
    unit_delta = Column(String(100), nullable=True)
    applied_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    applied_by = Column(String(100), nullable=False)

    activity_match = relationship("ActivityMatch", back_populates="progress_events")

# 14. Review Actions
class ReviewAction(Base):
    __tablename__ = "review_actions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    activity_match_id = Column(String(36), ForeignKey("activity_matches.id", ondelete="CASCADE"), nullable=False)
    actor_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=True)
    actor_name = Column(String(100), nullable=False)
    action = Column(String(30), nullable=False)  # APPROVE, REJECT, REMATCH, AUTO_ACCEPTED
    reason = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    activity_match = relationship("ActivityMatch", back_populates="review_actions")

# 15. Audit Logs (Tamper-evident SHA-256 chain)
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    sequence_no = Column(Integer, nullable=False, unique=True, index=True)
    timestamp = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    actor = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    activity_id = Column(String(50), nullable=False)
    new_value = Column(String(50), nullable=False)
    source_event_id = Column(String(50), nullable=True)
    payload_canonical_json = Column(Text, nullable=False)
    prev_hash = Column(String(64), nullable=False)
    entry_hash = Column(String(64), nullable=False)

    project = relationship("Project", back_populates="audit_logs")

# 16. Evidence
class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    field_report_id = Column(String(36), ForeignKey("field_reports.id", ondelete="CASCADE"), nullable=False)
    file_type = Column(String(50), nullable=False)  # audio, image, pdf, xlsx
    storage_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    sha256_hash = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    field_report = relationship("FieldReport", back_populates="evidence_items")

# 17. Imports
class ImportRecord(Base):
    __tablename__ = "imports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=True)
    type = Column(String(20), nullable=False)  # XER, EXCEL, DPR
    filename = Column(String(255), nullable=False)
    status = Column(String(30), default="COMPLETED", nullable=False)
    row_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

# 18. Exports
class ExportRecord(Base):
    __tablename__ = "exports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=True)
    type = Column(String(20), default="P6_CSV", nullable=False)
    filename = Column(String(255), nullable=False)
    row_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    items = relationship("ExportItem", back_populates="export_record")

# 19. Export Items
class ExportItem(Base):
    __tablename__ = "export_items"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    export_id = Column(String(36), ForeignKey("exports.id", ondelete="CASCADE"), nullable=False)
    progress_event_id = Column(String(36), ForeignKey("progress_events.id", ondelete="RESTRICT"), nullable=True)
    external_task_id = Column(String(50), nullable=False)
    percent_complete_delta = Column(Float, nullable=False)

    export_record = relationship("ExportRecord", back_populates="items")

# 20. Matching Config
class MatchingConfig(Base):
    __tablename__ = "matching_config"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    auto_accept_threshold = Column(Float, default=95.0, nullable=False)
    unmatched_threshold = Column(Float, default=50.0, nullable=False)
    min_corroborations = Column(Integer, default=2, nullable=False)
    rrf_k = Column(Integer, default=60, nullable=False)

# 21. Sessions
class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(255), nullable=False, index=True)
    refresh_token_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="sessions")

# 22. Dictionary Terms
class DictionaryTerm(Base):
    __tablename__ = "dictionary_terms"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    term = Column(String(100), nullable=False, index=True)
    canonical = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    # Tier 1: SCHEDULE_MINED, Tier 2: PLANNER_BOOTSTRAP, Tier 3: ACTIVE_LEARNED
    source = Column(String(30), default="PLANNER_BOOTSTRAP", nullable=False)
    confidence = Column(Float, nullable=True)
    learned_from_match_id = Column(String(36), ForeignKey("activity_matches.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    sources = relationship("DictionaryTermSource", back_populates="term_record")

# 23. Dictionary Term Sources (Tier 3 Active-learning corroboration ledger)
class DictionaryTermSource(Base):
    __tablename__ = "dictionary_term_sources"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    dictionary_term_id = Column(String(36), ForeignKey("dictionary_terms.id", ondelete="CASCADE"), nullable=False)
    activity_match_id = Column(String(36), ForeignKey("activity_matches.id", ondelete="CASCADE"), nullable=False)
    actor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    term_record = relationship("DictionaryTerm", back_populates="sources")
    __table_args__ = (
        UniqueConstraint("dictionary_term_id", "activity_match_id", name="uq_term_match"),
    )

# 24. Notifications
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    time = Column(String(50), nullable=False)
    unread = Column(Boolean, default=True, nullable=False)
    target_route = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    user = relationship("User", back_populates="notifications")

# 25. Conversation Messages (Bidirectional loop between Supervisor and Planner)
class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), nullable=False, index=True)
    author_id = Column(String(36), nullable=True)
    author_name = Column(String(100), nullable=False)
    author_role = Column(String(50), nullable=False)
    text = Column(Text, nullable=False)
    reply = Column(Text, nullable=True)
    time = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

# 26. Access Requests
class AccessRequest(Base):
    __tablename__ = "access_requests"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    request_code = Column(String(50), unique=True, nullable=False, index=True)  # e.g. "REQ-0087"
    name = Column(String(100), nullable=False)
    contact = Column(String(100), nullable=False)
    organization = Column(String(100), nullable=False)
    project_id = Column(String(36), nullable=False)
    project_name = Column(String(255), nullable=True)
    role = Column(String(30), nullable=False)
    status = Column(String(30), default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

# 27. Delay Causes
class DelayCause(Base):
    __tablename__ = "delay_causes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)  # Weather, Equipment / crane, RFI, Material, etc.
    events_count = Column(Integer, default=0, nullable=False)
    days_lost = Column(Integer, default=0, nullable=False)
    is_critical_path = Column(Boolean, default=False, nullable=False)
    critical_activity_id = Column(String(50), nullable=True)
    critical_activity_name = Column(String(255), nullable=True)

# 28. Project Memory Insights
class ProjectMemoryInsight(Base):
    __tablename__ = "project_memory_insights"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    insight = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)
    benchmark_project = Column(String(255), nullable=True)
    sample_size = Column(Integer, default=0, nullable=False)
    season = Column(String(50), nullable=True)
    variance_percent = Column(Float, default=0.0, nullable=False)
    activities = Column(JSON, nullable=True)  # List of activity ID strings
