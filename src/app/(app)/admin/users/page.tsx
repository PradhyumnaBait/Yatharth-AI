'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { UnderlineTabs, TabItem } from '@/components/ui/UnderlineTabs';
import { useAuthStore, AccessRequest, UserRole } from '@/store/auth';
import { useProjectStore } from '@/store/project';
import { useUiStore } from '@/store/ui';
import { Sheet } from '@/components/ui/Sheet';
import {
  Search,
  UserPlus,
  Shield,
  Check,
  X,
  Key,
  UserX,
  Edit,
  ChevronRight,
  Lock,
} from 'lucide-react';

interface ManagedUser {
  id: string;
  name: string;
  role: UserRole;
  empId: string;
  project: string;
  active: string;
  organization: string;
}

const INITIAL_USERS: ManagedUser[] = [
  { id: 'usr-1', name: 'Rahul Patil', role: 'supervisor', empId: 'SUP-0412', project: 'Kandla–Panipat Pipeline', active: 'Just now', organization: 'Sterling Infra EPC' },
  { id: 'usr-2', name: 'Meera Nair', role: 'planner', empId: 'PLN-0107', project: 'Kandla–Panipat Pipeline', active: '3m ago', organization: 'Sterling Infra EPC' },
  { id: 'usr-3', name: 'Arvind Deshmukh', role: 'pm', empId: 'PM-0031', project: 'Kandla–Panipat Pipeline', active: '12m ago', organization: "Owner's Project Team" },
  { id: 'usr-4', name: 'Sana Qureshi', role: 'admin', empId: 'ADM-0002', project: 'Kandla–Panipat Pipeline', active: 'Active now', organization: 'Sterling Infra EPC' },
  { id: 'usr-5', name: 'Dinesh Rathod', role: 'supervisor', empId: 'SUP-0388', project: 'Kandla–Panipat Pipeline', active: '1h ago', organization: 'Sterling Infra EPC' },
  { id: 'usr-6', name: 'Suresh Yadav', role: 'supervisor', empId: 'SUP-0401', project: 'Kandla–Panipat Pipeline', active: '2h ago', organization: 'Rathi Contractors' },
];

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'users';

  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'roles'>(
    ['users', 'requests', 'roles'].includes(initialTab) ? (initialTab as any) : 'users'
  );

  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const { accessRequests, approveAccessRequest, rejectAccessRequest } = useAuthStore();
  const { showToast } = useUiStore();
  const projects = useProjectStore((s) => s.projects);

  // User details sheet
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [userSheetOpen, setUserSheetOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  // Invite user sheet
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteId, setInviteId] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('supervisor');
  const [inviteProject, setInviteProject] = useState('kandla-panipat-p3');

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.empId.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.project.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const tabs: TabItem[] = [
    { id: 'users', label: 'Users', count: users.length },
    { id: 'requests', label: 'Requests', count: accessRequests.length },
    { id: 'roles', label: 'Roles' },
  ];

  const handleApprove = (req: AccessRequest) => {
    approveAccessRequest(req.id);
    // Add to active users
    const newUser: ManagedUser = {
      id: `usr-${Date.now()}`,
      name: req.name,
      role: req.role,
      empId: req.contact,
      project: 'Kandla–Panipat Pipeline',
      active: 'Approved just now',
      organization: req.organization,
    };
    setUsers((prev) => [newUser, ...prev]);
    showToast(`Access request ${req.id} approved for ${req.name}.`);
  };

  const handleReject = (req: AccessRequest) => {
    rejectAccessRequest(req.id);
    showToast(`Access request ${req.id} rejected.`);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteId.trim()) return;

    const newUser: ManagedUser = {
      id: `usr-${Date.now()}`,
      name: inviteName.trim(),
      role: inviteRole,
      empId: inviteId.trim(),
      project: 'Kandla–Panipat Pipeline',
      active: 'Invited just now',
      organization: 'Sterling Infra EPC',
    };
    setUsers((prev) => [newUser, ...prev]);
    setInviteSheetOpen(false);
    setInviteName('');
    setInviteId('');
    showToast(`User ${inviteName} invited as ${inviteRole}.`);
  };

  const handleChangeRole = (newRole: UserRole) => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
    );
    setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
    showToast(`Role updated to ${newRole} for ${selectedUser.name}.`);
  };

  const handleResetPin = () => {
    showToast(`PIN reset to 482913 for ${selectedUser?.name}.`);
    setUserSheetOpen(false);
  };

  const handleDeactivate = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setDeactivateDialogOpen(false);
    setUserSheetOpen(false);
    showToast(`User ${selectedUser.name} deactivated.`);
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      <PageHeader variant="back" title="Users & Roles" />

      <div className="px-4 py-3 space-y-4">
        {/* Underline Tabs */}
        <UnderlineTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
        />

        {/* TAB 1: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {/* Search and Invite button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-sb-text-subtle absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  data-testid="search-users-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name, role, ID..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-sb-border rounded-xl text-caption text-sb-ink placeholder:text-sb-text-muted focus:outline-none focus:border-sb-navy"
                />
              </div>

              <button
                type="button"
                data-testid="invite-user-button"
                onClick={() => setInviteSheetOpen(true)}
                className="px-3.5 py-2 bg-sb-navy text-white text-caption font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </button>
            </div>

            {/* Users List */}
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  data-testid={`user-row-${u.id}`}
                  onClick={() => {
                    setSelectedUser(u);
                    setUserSheetOpen(true);
                  }}
                  className="p-3 bg-white border border-sb-border rounded-card hover:border-sb-navy cursor-pointer transition-colors shadow-sm flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sb-bg-subtle text-sb-navy font-bold flex items-center justify-center text-caption">
                      {u.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-caption font-bold text-sb-ink group-hover:text-sb-navy">
                          {u.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-sb-navy bg-slate-100 px-1.5 py-0.2 rounded">
                          {u.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-sb-text-subtle block">
                        {u.empId} · {u.organization}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <span className="text-[11px] text-sb-text-muted">{u.active}</span>
                    <ChevronRight className="w-4 h-4 text-sb-text-subtle group-hover:text-sb-navy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-body font-semibold text-sb-ink">
                Pending Access Requests ({accessRequests.length})
              </h3>
              <span className="text-caption text-sb-text-muted">
                Requires administrative approval
              </span>
            </div>

            {accessRequests.length === 0 ? (
              <div
                data-testid="no-requests-msg"
                className="p-8 text-center bg-white rounded-card border border-sb-border text-caption text-sb-text-subtle"
              >
                No pending access requests.
              </div>
            ) : (
              <div className="space-y-3">
                {accessRequests.map((req) => (
                  <div
                    key={req.id}
                    data-testid={`request-card-${req.id}`}
                    className="p-4 bg-white border border-sb-border rounded-card shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-mono-s font-bold text-sb-navy">
                            {req.id}
                          </span>
                          <span className="text-body font-bold text-sb-ink">{req.name}</span>
                        </div>
                        <p className="text-caption text-sb-text-subtle mt-0.5">
                          ID: {req.contact} · {req.organization}
                        </p>
                      </div>

                      <span className="text-[11px] uppercase font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        Requested: {req.role}
                      </span>
                    </div>

                    <div className="p-2 bg-sb-bg-subtle rounded text-[11px] text-sb-ink flex items-center justify-between">
                      <span>Target Package: {req.projectId}</span>
                      <span className="text-sb-text-subtle">{req.time}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        data-testid={`reject-request-btn-${req.id}`}
                        onClick={() => handleReject(req)}
                        className="px-3 py-1.5 border border-red-200 bg-red-50 text-red-700 text-caption font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>

                      <button
                        type="button"
                        data-testid={`approve-request-btn-${req.id}`}
                        onClick={() => handleApprove(req)}
                        className="px-3.5 py-1.5 bg-sb-navy text-white text-caption font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ROLES MATRIX */}
        {activeTab === 'roles' && (
          <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1 space-y-4">
            <div>
              <h3 className="text-body font-semibold text-sb-ink">
                Role-Based Access Control (RBAC) Matrix
              </h3>
              <p className="text-caption text-sb-text-muted">
                Governing permissions across execution, planning, and control capabilities (§5.2)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-caption">
                <thead>
                  <tr className="border-b border-sb-border bg-sb-bg-subtle text-sb-text-subtle font-semibold">
                    <th className="py-2.5 px-3">Capability / Feature</th>
                    <th className="py-2.5 px-2 text-center">Supervisor</th>
                    <th className="py-2.5 px-2 text-center">Planner</th>
                    <th className="py-2.5 px-2 text-center">PM</th>
                    <th className="py-2.5 px-2 text-center">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sb-border-subtle">
                  {[
                    { cap: 'Voice / Text Capture (SU2)', sup: true, pl: false, pm: false, ad: false },
                    { cap: 'Submit Daily Reports (SU3)', sup: true, pl: false, pm: false, ad: false },
                    { cap: 'Planner Workbench Match Review (PL3)', sup: false, pl: true, pm: false, ad: true },
                    { cap: 'Ingest Excel, DPR, XER (PL4-PL7)', sup: false, pl: true, pm: false, ad: true },
                    { cap: 'Export P6 Physical % Update (PL8)', sup: false, pl: true, pm: false, ad: true },
                    { cap: 'Executive Analytics & S-Curves (PM2)', sup: false, pl: true, pm: true, ad: true },
                    { cap: 'Ask SchedBridge Natural Query (PM3)', sup: false, pl: false, pm: true, ad: true },
                    { cap: 'Root-Cause Delay Forensics (PM4)', sup: false, pl: true, pm: true, ad: true },
                    { cap: 'Cryptographic Audit Verification (S7)', sup: false, pl: true, pm: true, ad: true },
                    { cap: 'Domain Dictionary Editing (AD3)', sup: false, pl: false, pm: false, ad: true },
                    { cap: 'User Approvals & Role Assignment (AD2)', sup: false, pl: false, pm: false, ad: true },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-sb-bg transition-colors">
                      <td className="py-2.5 px-3 font-medium text-sb-ink">{row.cap}</td>
                      <td className="py-2.5 px-2 text-center">
                        {row.sup ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {row.pl ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {row.pm ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {row.ad ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Details / Actions Sheet */}
      <Sheet
        isOpen={userSheetOpen}
        onClose={() => setUserSheetOpen(false)}
        title={selectedUser ? `User: ${selectedUser.name}` : 'User Details'}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-sb-bg-subtle p-3.5 rounded-card border border-sb-border space-y-1">
              <span className="font-mono text-caption text-sb-navy font-bold">
                {selectedUser.empId}
              </span>
              <h4 className="text-body font-bold text-sb-ink">{selectedUser.name}</h4>
              <p className="text-caption text-sb-text-subtle">
                {selectedUser.organization} · {selectedUser.project}
              </p>
            </div>

            {/* Change Role */}
            <div className="space-y-2">
              <label className="text-caption font-semibold text-sb-ink block">
                Change Assigned Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['supervisor', 'planner', 'pm', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    data-testid={`change-role-${r}`}
                    onClick={() => handleChangeRole(r)}
                    className={`p-2.5 rounded-lg border text-caption font-medium capitalize flex items-center justify-between ${
                      selectedUser.role === r
                        ? 'border-sb-navy bg-sb-bg font-bold text-sb-navy'
                        : 'border-sb-border bg-white text-sb-ink hover:bg-slate-50'
                    }`}
                  >
                    <span>{r}</span>
                    {selectedUser.role === r && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-sb-border-subtle space-y-2">
              <button
                type="button"
                data-testid="reset-user-pin-btn"
                onClick={handleResetPin}
                className="w-full py-2.5 border border-sb-border rounded-lg bg-sb-bg-subtle hover:bg-slate-100 text-caption font-semibold text-sb-ink flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4 text-sb-navy" />
                Reset PIN to Default (482913)
              </button>

              <button
                type="button"
                data-testid="deactivate-user-btn"
                onClick={() => setDeactivateDialogOpen(true)}
                className="w-full py-2.5 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 text-caption font-semibold text-red-700 flex items-center justify-center gap-2"
              >
                <UserX className="w-4 h-4 text-red-600" />
                Deactivate User Account
              </button>
            </div>
          </div>
        )}
      </Sheet>

      {/* Invite User Sheet */}
      <Sheet
        isOpen={inviteSheetOpen}
        onClose={() => setInviteSheetOpen(false)}
        title="Invite New User"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-caption font-semibold text-sb-ink">Full Name</label>
            <input
              type="text"
              data-testid="invite-name-input"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Ramesh Chandra"
              required
              className="w-full px-3 py-2 border border-sb-border rounded-lg text-caption text-sb-ink"
            />
          </div>

          <div className="space-y-1">
            <label className="text-caption font-semibold text-sb-ink">Employee ID</label>
            <input
              type="text"
              data-testid="invite-id-input"
              value={inviteId}
              onChange={(e) => setInviteId(e.target.value)}
              placeholder="e.g. SUP-0450"
              required
              className="w-full px-3 py-2 border border-sb-border rounded-lg text-caption text-sb-ink font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-caption font-semibold text-sb-ink">Role</label>
            <select
              data-testid="invite-role-select"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-sb-border rounded-lg text-caption text-sb-ink bg-white"
            >
              <option value="supervisor">Supervisor</option>
              <option value="planner">Planner</option>
              <option value="pm">Project Manager (PM)</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          <button
            type="submit"
            data-testid="submit-invite-btn"
            className="w-full py-2.5 bg-sb-navy text-white text-caption font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Send Invitation
          </button>
        </form>
      </Sheet>

      {/* Deactivate User Confirmation Dialog */}
      {deactivateDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div
            data-testid="deactivate-dialog"
            className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-sb-border animate-in zoom-in-95 duration-150"
          >
            <div className="space-y-1">
              <h3 className="text-body font-bold text-sb-ink">
                Deactivate {selectedUser?.name}?
              </h3>
              <p className="text-caption text-sb-text-subtle">
                This user will immediately lose access to the system. All their logged events and audit trails remain preserved.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeactivateDialogOpen(false)}
                className="px-4 py-2 text-caption font-medium border border-sb-border rounded-lg bg-white hover:bg-sb-bg text-sb-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-deactivate-btn"
                onClick={handleDeactivate}
                className="px-4 py-2 text-caption font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-4 text-caption text-sb-text-subtle">Loading...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
