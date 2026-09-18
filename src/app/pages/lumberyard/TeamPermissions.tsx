import React, { useState } from "react";
import {
  Users, Crown, HardHat, ShoppingBag, Truck, Pencil, Wrench,
  Check, Minus, X, Plus, Mail, ChevronDown, MoreHorizontal,
  Shield, Eye, Edit2, Trash2, Settings,
} from "lucide-react";

type Role = "owner" | "yard-manager" | "counter-staff" | "driver" | "designer" | "engineer";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinedDate: string;
  lastActive: string;
  avatar: string;
  status: "active" | "pending" | "inactive";
}

interface PermissionRow {
  category: string;
  permissions: { id: string; label: string }[];
}

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ReactNode; color: string; bg: string; description: string }> = {
  "owner":         { label: "Owner / Admin",  icon: <Crown size={13} />,       color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",  description: "Full access to all settings, billing, and team management" },
  "yard-manager":  { label: "Yard Manager",   icon: <HardHat size={13} />,     color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",    description: "Manage orders, catalog, capacity, and staff" },
  "counter-staff": { label: "Counter Staff",  icon: <ShoppingBag size={13} />, color: "text-green-700",  bg: "bg-green-50 border-green-200",  description: "Process orders and manage customer-facing catalog" },
  "driver":        { label: "Driver",         icon: <Truck size={13} />,       color: "text-slate-700",  bg: "bg-slate-50 border-slate-200",  description: "View assigned deliveries and update delivery status" },
  "designer":      { label: "Designer",       icon: <Pencil size={13} />,      color: "text-violet-700", bg: "bg-violet-50 border-violet-200", description: "Access takeoff tools and material specifications" },
  "engineer":      { label: "Engineer",       icon: <Wrench size={13} />,      color: "text-rose-700",   bg: "bg-rose-50 border-rose-200",    description: "Review technical specs, certifications, and compliance docs" },
};

const TEAM_MEMBERS: TeamMember[] = [
  { id: "u-1", name: "Sarah Kim",      email: "sarah@austintimber.com",  role: "owner",         joinedDate: "Jun 2025", lastActive: "Today",      avatar: "SK", status: "active" },
  { id: "u-2", name: "Dave Reyes",     email: "dave@austintimber.com",   role: "yard-manager",  joinedDate: "Jun 2025", lastActive: "Today",      avatar: "DR", status: "active" },
  { id: "u-3", name: "Lena Park",      email: "lena@austintimber.com",   role: "yard-manager",  joinedDate: "Aug 2025", lastActive: "Yesterday",  avatar: "LP", status: "active" },
  { id: "u-4", name: "Carlos Mendez",  email: "carlos@austintimber.com", role: "counter-staff", joinedDate: "Sep 2025", lastActive: "Today",      avatar: "CM", status: "active" },
  { id: "u-5", name: "Pam Torres",     email: "pam@austintimber.com",    role: "counter-staff", joinedDate: "Jan 2026", lastActive: "2 days ago", avatar: "PT", status: "active" },
  { id: "u-6", name: "Raj Singh",      email: "raj@austintimber.com",    role: "driver",        joinedDate: "Oct 2025", lastActive: "Today",      avatar: "RS", status: "active" },
  { id: "u-7", name: "Maria Fuentes",  email: "maria@austintimber.com",  role: "driver",        joinedDate: "Mar 2026", lastActive: "Today",      avatar: "MF", status: "active" },
  { id: "u-8", name: "Alex Wright",    email: "alex@externalarch.com",   role: "designer",      joinedDate: "Feb 2026", lastActive: "4 days ago", avatar: "AW", status: "active" },
  { id: "u-9", name: "Jordan Blake",   email: "jordan@pending.com",      role: "engineer",      joinedDate: "—",        lastActive: "—",          avatar: "JB", status: "pending" },
];

// Permission matrix: rows = permission categories, cols = roles
type PermLevel = "full" | "read" | "none";

const PERMISSION_MATRIX: PermissionRow[] = [
  {
    category: "Orders",
    permissions: [
      { id: "orders.view",     label: "View Orders" },
      { id: "orders.confirm",  label: "Confirm / Reject" },
      { id: "orders.edit",     label: "Edit Orders" },
      { id: "orders.refund",   label: "Issue Refunds" },
    ],
  },
  {
    category: "Catalog",
    permissions: [
      { id: "catalog.view",   label: "View Catalog" },
      { id: "catalog.edit",   label: "Edit Products" },
      { id: "catalog.price",  label: "Update Pricing" },
      { id: "catalog.delete", label: "Delete Products" },
    ],
  },
  {
    category: "Deliveries",
    permissions: [
      { id: "delivery.view",    label: "View Schedule" },
      { id: "delivery.assign",  label: "Assign Drivers" },
      { id: "delivery.status",  label: "Update Status" },
      { id: "delivery.export",  label: "Export Logs" },
    ],
  },
  {
    category: "Analytics",
    permissions: [
      { id: "analytics.view",   label: "View Reports" },
      { id: "analytics.export", label: "Export Data" },
    ],
  },
  {
    category: "Team & Settings",
    permissions: [
      { id: "team.invite",   label: "Invite Members" },
      { id: "team.roles",    label: "Assign Roles" },
      { id: "team.remove",   label: "Remove Members" },
      { id: "settings.edit", label: "Edit Configuration" },
      { id: "billing.view",  label: "View Billing" },
    ],
  },
];

// Hard-coded permission table per role/permission
const PERM_TABLE: Record<string, Record<Role, PermLevel>> = {
  "orders.view":     { owner: "full", "yard-manager": "full",  "counter-staff": "full",  driver: "read", designer: "read", engineer: "read" },
  "orders.confirm":  { owner: "full", "yard-manager": "full",  "counter-staff": "full",  driver: "none", designer: "none", engineer: "none" },
  "orders.edit":     { owner: "full", "yard-manager": "full",  "counter-staff": "read",  driver: "none", designer: "none", engineer: "none" },
  "orders.refund":   { owner: "full", "yard-manager": "full",  "counter-staff": "none",  driver: "none", designer: "none", engineer: "none" },
  "catalog.view":    { owner: "full", "yard-manager": "full",  "counter-staff": "full",  driver: "none", designer: "full", engineer: "full" },
  "catalog.edit":    { owner: "full", "yard-manager": "full",  "counter-staff": "read",  driver: "none", designer: "none", engineer: "none" },
  "catalog.price":   { owner: "full", "yard-manager": "full",  "counter-staff": "none",  driver: "none", designer: "none", engineer: "none" },
  "catalog.delete":  { owner: "full", "yard-manager": "none",  "counter-staff": "none",  driver: "none", designer: "none", engineer: "none" },
  "delivery.view":   { owner: "full", "yard-manager": "full",  "counter-staff": "full",  driver: "full", designer: "none", engineer: "none" },
  "delivery.assign": { owner: "full", "yard-manager": "full",  "counter-staff": "none",  driver: "none", designer: "none", engineer: "none" },
  "delivery.status": { owner: "full", "yard-manager": "full",  "counter-staff": "read",  driver: "full", designer: "none", engineer: "none" },
  "delivery.export": { owner: "full", "yard-manager": "full",  "counter-staff": "none",  driver: "none", designer: "none", engineer: "none" },
  "analytics.view":  { owner: "full", "yard-manager": "full",  "counter-staff": "none",  driver: "none", designer: "read", engineer: "read" },
  "analytics.export":{ owner: "full", "yard-manager": "full",  "counter-staff": "none",  driver: "none", designer: "none", engineer: "none" },
  "team.invite":     { owner: "full", "yard-manager": "read",  "counter-staff": "none",  driver: "none", designer: "none", engineer: "none" },
  "team.roles":      { owner: "full", "yard-manager": "none",  "counter-staff": "none",  driver: "none", designer: "none", engineer: "none" },
  "team.remove":     { owner: "full", "yard-manager": "none",  "counter-staff": "none",  driver: "none", designer: "none", engineer: "none" },
  "settings.edit":   { owner: "full", "yard-manager": "read",  "counter-staff": "none",  driver: "none", designer: "none", engineer: "none" },
  "billing.view":    { owner: "full", "yard-manager": "none",  "counter-staff": "none",  driver: "none", designer: "none", engineer: "none" },
};

const ROLE_ORDER: Role[] = ["owner", "yard-manager", "counter-staff", "driver", "designer", "engineer"];

function PermCell({ level }: { level: PermLevel }) {
  if (level === "full")  return <Check size={13} className="text-green-500 mx-auto" />;
  if (level === "read")  return <Eye size={11} className="text-blue-400 mx-auto" />;
  return <Minus size={11} className="text-slate-200 mx-auto" />;
}

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

type Tab = "members" | "matrix" | "roles";

export function TeamPermissions() {
  const [activeTab, setActiveTab] = useState<Tab>("members");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "members", label: "Team Members",    icon: <Users size={13} /> },
    { id: "matrix",  label: "Permission Matrix", icon: <Shield size={13} /> },
    { id: "roles",   label: "Role Definitions",  icon: <Settings size={13} /> },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team & Permissions</h1>
          <p className="text-sm text-slate-500 mt-1">{TEAM_MEMBERS.filter(m => m.status === "active").length} active members · {TEAM_MEMBERS.filter(m => m.status === "pending").length} pending invite</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors">
          <Mail size={14} /> Invite Member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Members tab */}
      {activeTab === "members" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Member</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden md:table-cell">Joined</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden lg:table-cell">Last Active</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden sm:table-cell">Status</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {TEAM_MEMBERS.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                          member.status === "pending" ? "bg-slate-300" : "bg-gradient-to-br from-amber-400 to-amber-600"
                        }`}>
                          {member.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                          <div className="text-[10px] text-slate-400">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-3 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-slate-500">{member.joinedDate}</span>
                    </td>
                    <td className="px-3 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-slate-500">{member.lastActive}</span>
                    </td>
                    <td className="px-3 py-3.5 hidden sm:table-cell">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        member.status === "active"  ? "text-green-700 bg-green-50 border-green-200"
                        : member.status === "pending" ? "text-amber-700 bg-amber-50 border-amber-200"
                        : "text-slate-500 bg-slate-50 border-slate-200"
                      }`}>
                        {member.status === "pending" ? "Invite Pending" : member.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permission matrix tab */}
      {activeTab === "matrix" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Legend */}
          <div className="flex items-center gap-5 px-5 py-3 border-b border-slate-100 bg-slate-50 flex-wrap">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Legend:</span>
            {[
              { icon: <Check size={11} className="text-green-500" />,  label: "Full Access" },
              { icon: <Eye size={10} className="text-blue-400" />,     label: "Read Only" },
              { icon: <Minus size={11} className="text-slate-300" />,  label: "No Access" },
            ].map(item => (
              <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                {item.icon} {item.label}
              </span>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 w-52">Permission</th>
                  {ROLE_ORDER.map(role => {
                    const cfg = ROLE_CONFIG[role];
                    return (
                      <th key={role} className="px-3 py-3 text-center">
                        <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon}
                          <span className="hidden sm:inline">{cfg.label.split(" / ")[0].split(" ")[0]}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_MATRIX.map(section => (
                  <React.Fragment key={section.category}>
                    <tr className="bg-slate-50 border-y border-slate-100">
                      <td colSpan={ROLE_ORDER.length + 1} className="px-5 py-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{section.category}</span>
                      </td>
                    </tr>
                    {section.permissions.map(perm => (
                      <tr key={perm.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-2.5">
                          <span className="text-xs text-slate-700">{perm.label}</span>
                        </td>
                        {ROLE_ORDER.map(role => (
                          <td key={role} className="px-3 py-2.5 text-center">
                            <PermCell level={PERM_TABLE[perm.id]?.[role] ?? "none"} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role definitions tab */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ROLE_ORDER.map(role => {
            const cfg = ROLE_CONFIG[role];
            const count = TEAM_MEMBERS.filter(m => m.role === role).length;
            return (
              <div key={role} className={`bg-white rounded-2xl border shadow-sm p-5 border-slate-100`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className={`flex items-center gap-2 text-sm font-bold ${cfg.color}`}>
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center border ${cfg.bg}`}>
                      {cfg.icon}
                    </span>
                    {cfg.label}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                    {count} member{count !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{cfg.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
