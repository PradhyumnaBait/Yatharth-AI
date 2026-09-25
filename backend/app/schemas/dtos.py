from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class CamelModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

# 1. Auth Schemas
class LoginRequest(BaseModel):
    employeeId: str
    pin: str

class UserProfileDTO(CamelModel):
    id: str
    employeeId: str = Field(..., validation_alias="employee_id")
    name: str
    role: str
    phone: Optional[str] = None
    avatarUrl: Optional[str] = Field(None, validation_alias="avatar_url")
    accessToken: Optional[str] = None

class AccessRequestCreate(BaseModel):
    name: str
    contact: str
    organization: str
    projectId: str
    role: str

class ResetPinRequest(BaseModel):
    employeeId: str
    code: str
    newPin: str

# 2. Project & Phase Schemas
class ProjectDTO(CamelModel):
    id: str
    name: str
    description: Optional[str] = None
    dataDate: str = Field(..., validation_alias="data_date")
    physicalProgress: float = Field(..., validation_alias="physical_progress")
    plannedProgress: float = Field(..., validation_alias="planned_progress")
    activeActivitiesCount: int = 14
    totalActivitiesCount: int = 200
    baselineVersion: str = Field("v1", validation_alias="baseline_version")
    isPopulated: bool = Field(True, validation_alias="is_populated")

class PhaseDTO(BaseModel):
    id: str
    name: str
    weight: float
    planned: float
    dprReported: float
    verified: float

class CrewTeamDTO(BaseModel):
    id: str
    name: str
    foreman: str
    contractor: str
    headcount: int
    reportsToday: int
    lastReportTime: str
    verifiedRate: float
    phone: str

# 3. Schedule & Activity Schemas
class RelationshipDTO(BaseModel):
    id: str
    type: str = "FS"
    lag: int = 0

class ActivityDTO(CamelModel):
    id: str
    name: str
    phaseId: str = Field(..., validation_alias="phase_id")
    phaseName: str = Field(..., validation_alias="phase_name")
    status: str
    physicalPercent: float = Field(..., validation_alias="physical_percent")
    plannedStart: Optional[str] = Field(None, validation_alias="planned_start")
    plannedFinish: Optional[str] = Field(None, validation_alias="planned_finish")
    actualStart: Optional[str] = Field(None, validation_alias="actual_start")
    actualFinish: Optional[str] = Field(None, validation_alias="actual_finish")
    quantityTotal: Optional[float] = Field(None, validation_alias="quantity_total")
    quantityCompleted: Optional[float] = Field(None, validation_alias="quantity_completed")
    unit: Optional[str] = None
    predecessors: List[RelationshipDTO] = []
    successors: List[RelationshipDTO] = []
    isCritical: bool = Field(False, validation_alias="is_critical")
    isOutOfSequence: bool = Field(False, validation_alias="is_out_of_sequence")

class UpdateProgressRequest(BaseModel):
    physicalPercent: float
    reason: str

# 4. Field Event Schemas
class ExtractedInfoDTO(BaseModel):
    action: Optional[str] = None
    object: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    quantity: Optional[str] = None
    unit: Optional[str] = None

class MatchReasonDTO(BaseModel):
    label: str
    matchedText: Optional[str] = None

class FieldEventDTO(CamelModel):
    id: str
    source: str
    timestamp: str
    rawText: str
    authorName: str
    authorRole: str
    authorPhone: Optional[str] = None
    authorCrew: Optional[str] = None
    audioUrl: Optional[str] = None
    thumbnailUrl: Optional[str] = None
    status: str
    queueTier: str
    confidence: float
    suggestedActivityId: Optional[str] = None
    suggestedActivityName: Optional[str] = None
    extractedInfo: Optional[Dict[str, Any]] = None
    reasons: List[Dict[str, Any]] = []
    logicCheckStatus: str = "Passed"
    logicCheckMessage: Optional[str] = None
    delayCategory: Optional[str] = None
    daysLost: Optional[int] = None
    isConflict: Optional[bool] = False
    isAccumulator: Optional[bool] = False
    accumulatorDetails: Optional[Dict[str, Any]] = None
    isDistribute: Optional[bool] = False
    distributeActivities: Optional[List[Dict[str, Any]]] = None
    approvedAt: Optional[str] = None
    approvedBy: Optional[str] = None
    questions: Optional[List[Dict[str, Any]]] = []

# 5. Matching & Voice Schemas
class MatchTextRequest(BaseModel):
    text: str
    projectId: Optional[str] = "proj-kpp"

class MatchCandidateDTO(BaseModel):
    id: str
    name: str
    confidence: float

class MatchResultDTO(BaseModel):
    activityId: Optional[str] = None
    activityName: Optional[str] = None
    confidence: float
    reasons: List[Dict[str, str]] = []
    topCandidates: List[MatchCandidateDTO] = []

class TranscribeResponse(BaseModel):
    transcript: str
    language: str

# 6. Analytics & Audit Schemas
class SCurveResponse(BaseModel):
    dates: List[str]
    planned: List[float]
    actual: List[Optional[float]]

class DelayCauseDTO(CamelModel):
    id: Optional[str] = None
    category: str
    eventsCount: int = Field(0, validation_alias="events_count")
    daysLost: int = Field(0, validation_alias="days_lost")
    isCriticalPath: bool = Field(False, validation_alias="is_critical_path")
    criticalActivityId: Optional[str] = Field(None, validation_alias="critical_activity_id")
    criticalActivityName: Optional[str] = Field(None, validation_alias="critical_activity_name")

class MemoryInsightDTO(CamelModel):
    id: str
    title: str
    insight: str
    recommendation: Optional[str] = None
    benchmarkProject: Optional[str] = Field(None, validation_alias="benchmark_project")
    sampleSize: int = Field(0, validation_alias="sample_size")
    season: Optional[str] = None
    variancePercent: float = Field(0.0, validation_alias="variance_percent")
    activities: List[str] = []

class AuditEntryDTO(CamelModel):
    sequenceNo: int = Field(..., validation_alias="sequence_no")
    timestamp: str
    actor: str
    action: str
    activityId: str = Field(..., validation_alias="activity_id")
    newValue: str = Field(..., validation_alias="new_value")
    sourceEventId: Optional[str] = Field(None, validation_alias="source_event_id")
    hash: str = Field(..., validation_alias="entry_hash")
    prevHash: str = Field(..., validation_alias="prev_hash")

class VerifyAuditResponse(BaseModel):
    valid: bool
    brokenAtIndex: Optional[int] = None

class NotificationDTO(CamelModel):
    id: str
    title: str
    time: str
    unread: bool
    targetRoute: Optional[str] = Field(None, validation_alias="target_route")
