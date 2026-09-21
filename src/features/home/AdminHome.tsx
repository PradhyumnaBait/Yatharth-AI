'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, Layers, Check, X, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { useAuthStore } from '@/store/auth';
import { useProjectStore } from '@/store/project';

export type AdminPill = 'all' | 'users' | 'requests' | 'projects';

interface AdminHomeProps {
  activePill: AdminPill;
}

export const AdminHome: React.FC<AdminHomeProps> = ({ activePill }) => {
  const router = useRouter();
  const { accessRequests, approveAccessRequest, rejectAccessRequest } = useAuthStore();
  const projects = useProjectStore((state) => state.projects);

  // Mock list of active users
  const activeUsers = [
    { id: 'user-rahul', name: 'Rahul Patil', role: 'Supervisor', empId: 'SUP-0412', active: 'Just now' },
    { id: 'user-meera', name: 'Meera Nair', role: 'Planner', empId: 'PLN-0107', active: '3m ago' },
    { id: 'user-arvind', name: 'Arvind Deshmukh', role: 'PM', empId: 'PM-0031', active: '12m ago' },
    { id: 'user-sana', name: 'Sana Qureshi', role: 'Admin', empId: 'ADM-0002', active: 'Active now' },
    { id: 'user-dinesh', name: 'Dinesh Rathod', role: 'Supervisor', empId: 'SUP-0388', active: '1h ago' },
    { id: 'user-suresh', name: 'Suresh Yadav', role: 'Supervisor', empId: 'SUP-0401', active: '2h ago' },
  ];

  if (activePill === 'users') {
    return (
      <div data-testid="admin-users-body" className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-3 font-bold text-sb-navy">Active Users (38)</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/admin/users')}
          >
            + Invite User
          </Button>
        </div>

        <div className="space-y-2.5">
          {activeUsers.map((u) => (
            <div
              key={u.id}
              data-testid={`user-item-${u.id}`}
              className="bg-sb-white rounded-[16px] p-3.5 border border-sb-border shadow-e1 flex items-center justify-between"
            >
              <div>
                <div className="text-callout font-semibold text-sb-navy">{u.name}</div>
                <div className="text-caption text-sb-ink-3">
                  {u.empId} • {u.active}
                </div>
              </div>
              <span className="text-caption font-semibold bg-sb-navy-tint text-sb-navy px-2.5 py-1 rounded-full">
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activePill === 'requests') {
    return (
      <div data-testid="admin-requests-body" className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-3 font-bold text-sb-navy">
            Access Requests ({accessRequests.length})
          </h2>
          <span className="text-caption text-sb-review font-semibold">Pending Review</span>
        </div>

        {accessRequests.length === 0 ? (
          <div className="bg-sb-white rounded-[16px] p-8 text-center border border-sb-border text-sb-ink-3 text-caption">
            No pending access requests.
          </div>
        ) : (
          <div className="space-y-3">
            {accessRequests.map((req) => (
              <div
                key={req.id}
                data-testid={`request-item-${req.id}`}
                className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-callout font-bold text-sb-navy">{req.name}</div>
                    <div className="text-caption text-sb-ink-3">
                      ID: {req.contact} • {req.organization}
                    </div>
                  </div>
                  <span className="text-caption font-semibold uppercase bg-sb-review/15 text-sb-ink px-2 py-0.5 rounded">
                    {req.role}
                  </span>
                </div>

                <div className="text-caption text-sb-ink-2 mb-3">
                  Requested access to <span className="font-semibold">{req.projectId}</span> • {req.time}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-sb-border">
                  <Button
                    variant="destructive-outline"
                    size="sm"
                    data-testid={`reject-req-${req.id}`}
                    onClick={() => rejectAccessRequest(req.id)}
                    className="h-8 text-xs py-0 px-3"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    data-testid={`approve-req-${req.id}`}
                    onClick={() => approveAccessRequest(req.id)}
                    className="h-8 text-xs py-0 px-3"
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activePill === 'projects') {
    return (
      <div data-testid="admin-projects-body" className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-3 font-bold text-sb-navy">
            Pipeline Projects ({projects.length})
          </h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/admin/projects')}
          >
            + Create
          </Button>
        </div>

        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p.id}
              data-testid={`project-item-${p.id}`}
              onClick={() => router.push('/admin/projects')}
              className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1 hover:border-sb-navy/30 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-callout font-bold text-sb-navy">{p.name}</div>
                  <div className="text-caption text-sb-ink-3">{p.description}</div>
                </div>
                <span className="font-mono text-mono-s font-semibold bg-sb-navy-tint text-sb-navy px-2 py-0.5 rounded">
                  {p.baselineVersion}
                </span>
              </div>

              <div className="flex items-center justify-between text-caption text-sb-ink-2 pt-2 border-t border-sb-border">
                <span>Data Date: {p.dataDate}</span>
                <span className="font-semibold text-sb-navy">{p.physicalProgress}% Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: 'all' pill
  return (
    <div data-testid="admin-all-body" className="space-y-4 pb-2">
      {/* Pending Access Requests */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-title-3 font-bold text-sb-navy">
            Access Requests ({accessRequests.length})
          </h2>
          <button
            type="button"
            data-testid="see-all-requests-btn"
            onClick={() => router.push('/admin/requests')}
            className="text-caption font-semibold text-sb-navy hover:underline"
          >
            See All
          </button>
        </div>

        {accessRequests.length === 0 ? (
          <div className="bg-sb-white rounded-[16px] p-6 text-center border border-sb-border text-sb-ink-3 text-caption">
            No pending access requests.
          </div>
        ) : (
          <div className="space-y-2.5">
            {accessRequests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                data-testid={`admin-req-card-${req.id}`}
                className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1"
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="text-callout font-bold text-sb-navy">{req.name}</div>
                    <div className="text-caption text-sb-ink-3">
                      {req.contact} • {req.organization}
                    </div>
                  </div>
                  <span className="text-caption font-semibold uppercase bg-sb-review/15 text-sb-ink px-2 py-0.5 rounded">
                    {req.role}
                  </span>
                </div>

                <div className="text-caption text-sb-ink-2 mb-3">
                  Target: {req.projectId} • {req.time}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-sb-border">
                  <Button
                    variant="destructive-outline"
                    size="sm"
                    data-testid={`quick-reject-${req.id}`}
                    onClick={() => rejectAccessRequest(req.id)}
                    className="h-8 text-xs py-0 px-3"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    data-testid={`quick-approve-${req.id}`}
                    onClick={() => approveAccessRequest(req.id)}
                    className="h-8 text-xs py-0 px-3"
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Administration Links */}
      <section className="px-4">
        <h2 className="text-title-3 font-bold text-sb-navy mb-2">Administration Hub</h2>

        <div className="grid grid-cols-1 gap-2.5">
          <div
            data-testid="admin-link-dictionary"
            onClick={() => router.push('/admin/dictionary')}
            className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1 flex items-center justify-between cursor-pointer hover:border-sb-navy/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-sb-navy-tint text-sb-navy flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-callout font-semibold text-sb-navy">Domain Dictionary</div>
                <div className="text-caption text-sb-ink-3">Synonyms, disciplines, units mapper</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sb-ink-3" />
          </div>

          <div
            data-testid="admin-link-projects"
            onClick={() => router.push('/admin/projects')}
            className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1 flex items-center justify-between cursor-pointer hover:border-sb-navy/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-sb-navy-tint text-sb-navy flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-callout font-semibold text-sb-navy">Projects & Baselines</div>
                <div className="text-caption text-sb-ink-3">3 packages • XER v3 baseline</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sb-ink-3" />
          </div>

          <div
            data-testid="admin-link-roles"
            onClick={() => router.push('/admin/roles')}
            className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1 flex items-center justify-between cursor-pointer hover:border-sb-navy/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-sb-navy-tint text-sb-navy flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-callout font-semibold text-sb-navy">Roles & Permissions</div>
                <div className="text-caption text-sb-ink-3">RBAC authorization matrix (§5.2)</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sb-ink-3" />
          </div>
        </div>
      </section>
    </div>
  );
};
