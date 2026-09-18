import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, FolderOpen, Store, Truck, BarChart3, Settings,
  ShoppingCart, Package, Calendar, ClipboardCheck, User, Home,
  Bell, Search, ChevronLeft, ChevronRight, LogOut, Menu, X,
  HardHat, Building2, Ruler, UserCircle, Zap, ChevronDown, FileText,
  MessageSquare, Radio, SlidersHorizontal, Navigation, Star, FolderArchive,
  Rocket, Users, UserCog, Star as StarIcon, Target,
} from "lucide-react";

export type UserRole = "contractor" | "lumberyard" | "architect" | "homeowner";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

// ─── Unread message counts (mock — would come from context/API in production) ─
const unreadMessageCounts: Record<UserRole, number> = {
  contractor: 3,
  lumberyard: 4,
  architect: 2,
  homeowner: 1,
};

const roleNav: Record<UserRole, NavItem[]> = {
  contractor: [
    { label: "Dashboard",      icon: <LayoutDashboard size={18} />, path: "/contractor" },
    { label: "Projects",       icon: <FolderOpen size={18} />,      path: "/contractor/projects" },
    { label: "Marketplace",    icon: <Store size={18} />,           path: "/contractor/marketplace" },
    { label: "Deliveries",     icon: <Truck size={18} />,           path: "/contractor/deliveries" },
    { label: "Tracking",       icon: <Navigation size={18} />,      path: "/contractor/tracking", badge: 1 },
    { label: "Rate Delivery",  icon: <Star size={18} />,            path: "/contractor/review",   badge: 1 },
    { label: "Comms",          icon: <Radio size={18} />,           path: "/contractor/comms", badge: unreadMessageCounts.contractor },
    { label: "Messages",       icon: <MessageSquare size={18} />,   path: "/contractor/messages" },
    { label: "Case File",       icon: <FolderArchive size={18} />,   path: "/contractor/casefile" },
    { label: "Analytics",      icon: <BarChart3 size={18} />,       path: "/contractor/analytics" },
    { label: "Settings",       icon: <Settings size={18} />,        path: "/contractor/settings" },
  ],
  lumberyard: [
    { label: "Dashboard",        icon: <LayoutDashboard size={18} />, path: "/lumberyard" },
    { label: "Orders",           icon: <ShoppingCart size={18} />,    path: "/lumberyard/orders" },
    { label: "Incoming Orders",  icon: <FileText size={18} />,        path: "/lumberyard/quotations", badge: unreadMessageCounts.lumberyard },
    { label: "Messages",         icon: <MessageSquare size={18} />,   path: "/lumberyard/messages" },
    { label: "Catalog",          icon: <Package size={18} />,         path: "/lumberyard/catalog" },
    { label: "Capacity",         icon: <Calendar size={18} />,        path: "/lumberyard/capacity" },
    { label: "Analytics",        icon: <BarChart3 size={18} />,       path: "/lumberyard/analytics" },
    { label: "Profile",          icon: <Building2 size={18} />,       path: "/lumberyard/profile" },
    { label: "Team",             icon: <Users size={18} />,           path: "/lumberyard/team" },
    { label: "Reviews",          icon: <Star size={18} />,            path: "/lumberyard/reviews" },
    { label: "Settings",         icon: <Settings size={18} />,        path: "/lumberyard/settings" },
  ],
  architect: [
    { label: "Dashboard",   icon: <LayoutDashboard size={18} />, path: "/architect" },
    { label: "Reviews",     icon: <ClipboardCheck size={18} />,  path: "/architect/reviews" },
    { label: "Projects",    icon: <FolderOpen size={18} />,      path: "/architect/projects" },
    { label: "Messages",    icon: <MessageSquare size={18} />,   path: "/architect/messages", badge: unreadMessageCounts.architect },
    { label: "Profile",     icon: <User size={18} />,            path: "/architect/profile" },
    { label: "Settings",    icon: <Settings size={18} />,        path: "/architect/settings" },
  ],
  homeowner: [
    { label: "Dashboard",   icon: <Home size={18} />,            path: "/homeowner" },
    { label: "My Project",  icon: <FolderOpen size={18} />,      path: "/homeowner/project" },
    { label: "Materials",   icon: <Package size={18} />,         path: "/homeowner/materials" },
    { label: "Deliveries",  icon: <Truck size={18} />,           path: "/homeowner/deliveries" },
    { label: "Messages",    icon: <MessageSquare size={18} />,   path: "/homeowner/messages", badge: unreadMessageCounts.homeowner },
    { label: "Settings",    icon: <Settings size={18} />,        path: "/homeowner/settings" },
  ],
};

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string; user: string; org: string }> = {
  contractor: { label: "Contractor", icon: <HardHat size={14} />, color: "bg-blue-500", user: "Mike Torres", org: "Torres Construction LLC" },
  lumberyard: { label: "Lumberyard", icon: <Building2 size={14} />, color: "bg-amber-500", user: "Sarah Kim", org: "Austin Timber Supply" },
  architect: { label: "Architect", icon: <Ruler size={14} />, color: "bg-violet-500", user: "James Chen, PE", org: "Chen Structural Engineering" },
  homeowner: { label: "Homeowner", icon: <UserCircle size={14} />, color: "bg-rose-500", user: "Emily Davis", org: "Personal Account" },
};

// ─── SidebarContent defined OUTSIDE AppLayout to prevent remount on every render ───

interface SidebarContentProps {
  role: UserRole;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  roleMenuOpen: boolean;
  setRoleMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SidebarContent({
  role,
  collapsed,
  setCollapsed,
  setMobileOpen,
  roleMenuOpen,
  setRoleMenuOpen,
}: SidebarContentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const nav = roleNav[role];
  const config = roleConfig[role];

  const handleRoleSwitch = (newRole: UserRole) => {
    setRoleMenuOpen(false);
    setMobileOpen(false);
    navigate(`/${newRole}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-white text-sm font-bold tracking-wide">LUMBERYARD</span>
            <div className="text-white/40 text-xs">Build Platform</div>
          </div>
        )}
      </div>

      {/* Role Switcher */}
      <div className="px-3 py-3 border-b border-white/10">
        <button
          onClick={() => setRoleMenuOpen(!roleMenuOpen)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <span className={`w-5 h-5 rounded flex items-center justify-center text-white flex-shrink-0 ${config.color}`}>
            {config.icon}
          </span>
          {!collapsed && (
            <>
              <span className="text-white/90 text-xs font-medium flex-1 text-left">{config.label}</span>
              <ChevronDown size={12} className="text-white/50" />
            </>
          )}
        </button>
        {roleMenuOpen && !collapsed && (
          <div className="mt-2 rounded-lg bg-slate-800 border border-white/10 overflow-hidden">
            {(["contractor", "lumberyard", "architect", "homeowner"] as UserRole[]).map(r => (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/10 transition-colors ${r === role ? "bg-white/5 text-green-400" : "text-white/70"}`}
              >
                <span className={`w-4 h-4 rounded flex items-center justify-center text-white flex-shrink-0 ${roleConfig[r].color}`}>
                  {roleConfig[r].icon}
                </span>
                {roleConfig[r].label}
                {r === role && <span className="ml-auto text-green-400">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const isActive = item.path === `/${role}`
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                ${isActive
                  ? "bg-green-600 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
                }
                ${collapsed ? "justify-center" : ""}
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0 relative">
                {item.icon}
                {/* Badge on icon when collapsed */}
                {collapsed && item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              {!collapsed && <span className="font-medium flex-1">{item.label}</span>}
              {/* Badge when expanded */}
              {!collapsed && item.badge && item.badge > 0 && !isActive && (
                <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
            {config.user.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{config.user}</div>
              <div className="text-white/40 text-xs truncate">{config.org}</div>
            </div>
          )}
          {!collapsed && (
            <button className="text-white/40 hover:text-white/70 transition-colors" title="Sign out">
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle (Desktop) */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="hidden lg:flex items-center justify-center py-3 border-t border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

interface AppLayoutProps {
  role: UserRole;
}

export function AppLayout({ role }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const config = roleConfig[role];
  const navigate = useNavigate();
  const totalUnread = unreadMessageCounts[role];

  const sidebarProps: SidebarContentProps = {
    role,
    collapsed,
    setCollapsed,
    setMobileOpen,
    roleMenuOpen,
    setRoleMenuOpen,
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-slate-900 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 lg:hidden transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent {...sidebarProps} />
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-slate-200 flex items-center gap-4 px-4 lg:px-6">
          {/* Mobile menu button */}
          <button
            className="lg:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, materials..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Messages shortcut */}
            <button
              onClick={() => navigate(`/${role}/messages`)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
              title="Messages"
            >
              <MessageSquare size={18} />
              {totalUnread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </button>

            {/* Role Badge — normalized: always visible sm+ across all roles/screens */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white ${config.color} select-none`}>
              {config.icon}
              <span>{config.label}</span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              {config.user.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}