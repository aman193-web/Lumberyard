import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare, Search, Send, Mail, Zap, Paperclip,
  ChevronDown, MoreHorizontal, Phone, Video, Info,
  Check, CheckCheck, Filter, Plus, ArrowUpRight,
  Building2, HardHat, Ruler, UserCircle, Archive,
  Star, Tag, AlertCircle,
} from "lucide-react";

type UserRole = "contractor" | "lumberyard" | "architect" | "homeowner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  content: string;
  timestamp: string;
  via: "in-app" | "email";
  read: boolean;
  mine: boolean;
}

interface Conversation {
  id: string;
  participantName: string;
  participantOrg: string;
  participantRole: string;
  participantInitials: string;
  participantColor: string;
  subject: string;
  projectRef?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  tag: "project" | "support" | "platform" | "internal";
  pinned?: boolean;
  messages: Message[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const contractorConversations: Conversation[] = [
  {
    id: "conv-1",
    participantName: "Sarah Kim",
    participantOrg: "Austin Timber Supply",
    participantRole: "Lumberyard",
    participantInitials: "SK",
    participantColor: "bg-amber-500",
    subject: "Quote #RFQ-001 · 2847 Oak Ridge Dr",
    projectRef: "2847 Oak Ridge Dr",
    lastMessage: "Also running a 3% discount on engineered lumber this week — saves ~$800 on your LVL beams.",
    lastMessageTime: "10:42 AM",
    unread: 2,
    tag: "project",
    pinned: true,
    messages: [
      {
        id: "m1", senderId: "sk", senderName: "Sarah Kim", senderInitials: "SK",
        content: "Hi Mike, we've reviewed your RFQ-001 for 2847 Oak Ridge Dr. We can fulfill all 142 line items. Our quote has been submitted at $47,890 including phased delivery. Please review at your earliest convenience.",
        timestamp: "Yesterday, 2:18 PM", via: "in-app", read: true, mine: false,
      },
      {
        id: "m2", senderId: "me", senderName: "Mike Torres", senderInitials: "MT",
        content: "Thanks Sarah, reviewing now. Quick question — can you schedule the framing package delivery for Feb 18th specifically? We'll be ready to receive by then.",
        timestamp: "Yesterday, 3:05 PM", via: "in-app", read: true, mine: true,
      },
      {
        id: "m3", senderId: "sk", senderName: "Sarah Kim", senderInitials: "SK",
        content: "Absolutely. We can lock in Feb 18 for the framing package and keep the remaining two phases on your requested schedule. I'll update the delivery slots now. Want me to issue a revised confirmation?",
        timestamp: "Yesterday, 3:41 PM", via: "email", read: true, mine: false,
      },
      {
        id: "m4", senderId: "sk", senderName: "Sarah Kim", senderInitials: "SK",
        content: "Also running a 3% discount on engineered lumber this week — saves ~$800 on your LVL beams. Just let me know before you finalize and I'll apply it to the quote.",
        timestamp: "10:42 AM", via: "in-app", read: false, mine: false,
      },
      {
        id: "m5", senderId: "sk", senderName: "Sarah Kim", senderInitials: "SK",
        content: "One more thing — we do require a PO number on orders over $25K per our terms. Do you have one ready or should we flag this for your billing team?",
        timestamp: "10:44 AM", via: "email", read: false, mine: false,
      },
    ],
  },
  {
    id: "conv-2",
    participantName: "James Chen, PE",
    participantOrg: "Chen Structural Engineering",
    participantRole: "Architect",
    participantInitials: "JC",
    participantColor: "bg-violet-500",
    subject: "Structural Review · 2847 Oak Ridge Dr",
    projectRef: "2847 Oak Ridge Dr",
    lastMessage: "Ridge beam should be upsized to 3.5×14. I've updated the takeoff — please reorder accordingly.",
    lastMessageTime: "9:15 AM",
    unread: 1,
    tag: "project",
    messages: [
      {
        id: "m1", senderId: "jc", senderName: "James Chen, PE", senderInitials: "JC",
        content: "Mike, I've completed the structural review for 2847 Oak Ridge Dr. Everything checks out with one minor adjustment — the LVL beam specs on the second-floor corridor need to be upsized. I've added detailed notes to the takeoff.",
        timestamp: "Yesterday, 11:20 AM", via: "in-app", read: true, mine: false,
      },
      {
        id: "m2", senderId: "me", senderName: "Mike Torres", senderInitials: "MT",
        content: "Thanks James. What's the exact spec change on the beams? Want to make sure the supplier has those in stock before we finalize the order.",
        timestamp: "Yesterday, 1:00 PM", via: "in-app", read: true, mine: true,
      },
      {
        id: "m3", senderId: "jc", senderName: "James Chen, PE", senderInitials: "JC",
        content: "Ridge beam should be upsized to 3.5×14\" LVL instead of 3.5×11.25\". I've updated the takeoff line item directly. Please reorder from the supplier with the corrected spec.",
        timestamp: "9:15 AM", via: "email", read: false, mine: false,
      },
    ],
  },
  {
    id: "conv-3",
    participantName: "Delivery Dispatch",
    participantOrg: "Austin Timber Supply",
    participantRole: "Logistics",
    participantInitials: "DD",
    participantColor: "bg-green-600",
    subject: "Framing Package Delivery Confirmation",
    projectRef: "2847 Oak Ridge Dr",
    lastMessage: "Your delivery window is confirmed for Feb 18, 7:00 AM – 10:00 AM. Driver will call 30 min prior.",
    lastMessageTime: "Feb 7",
    unread: 0,
    tag: "project",
    messages: [
      {
        id: "m1", senderId: "dd", senderName: "Dispatch Team", senderInitials: "DD",
        content: "Your delivery window is confirmed for Feb 18, 7:00 AM – 10:00 AM. Our driver will call 30 minutes prior to arrival. Please ensure site access is clear.",
        timestamp: "Feb 7, 9:00 AM", via: "email", read: true, mine: false,
      },
      {
        id: "m2", senderId: "me", senderName: "Mike Torres", senderInitials: "MT",
        content: "Perfect, the site will be ready. Gate code is 4821.",
        timestamp: "Feb 7, 9:22 AM", via: "in-app", read: true, mine: true,
      },
    ],
  },
  {
    id: "conv-4",
    participantName: "Platform Support",
    participantOrg: "Lumberyard App",
    participantRole: "Support",
    participantInitials: "PS",
    participantColor: "bg-slate-500",
    subject: "Welcome to Lumberyard App",
    lastMessage: "Your account is fully set up. Reach out if you need anything.",
    lastMessageTime: "Jan 28",
    unread: 0,
    tag: "support",
    messages: [
      {
        id: "m1", senderId: "ps", senderName: "Platform Support", senderInitials: "PS",
        content: "Welcome to Lumberyard App, Mike! Your contractor account for Torres Construction LLC is fully configured. You can now create projects, generate intelligent takeoffs, and connect with local suppliers. Reach out anytime you need help.",
        timestamp: "Jan 28, 10:00 AM", via: "email", read: true, mine: false,
      },
    ],
  },
];

const lumberyardConversations: Conversation[] = [
  {
    id: "conv-1",
    participantName: "Mike Torres",
    participantOrg: "Torres Construction LLC",
    participantRole: "Contractor",
    participantInitials: "MT",
    participantColor: "bg-blue-500",
    subject: "RFQ-001 · 2847 Oak Ridge Dr",
    projectRef: "2847 Oak Ridge Dr",
    lastMessage: "Do you have 4×12×12 DF in stock or is that a special order?",
    lastMessageTime: "11:02 AM",
    unread: 3,
    tag: "project",
    pinned: true,
    messages: [
      {
        id: "m1", senderId: "me", senderName: "Sarah Kim", senderInitials: "SK",
        content: "Hi Mike, we've reviewed your RFQ-001 for 2847 Oak Ridge Dr. We can fulfill all 142 line items. Our quote has been submitted at $47,890 including phased delivery.",
        timestamp: "Yesterday, 2:18 PM", via: "in-app", read: true, mine: true,
      },
      {
        id: "m2", senderId: "mt", senderName: "Mike Torres", senderInitials: "MT",
        content: "Thanks Sarah. Quick question — can you confirm the Douglas Fir studs are kiln-dried #2 grade or better?",
        timestamp: "Yesterday, 3:10 PM", via: "in-app", read: true, mine: false,
      },
      {
        id: "m3", senderId: "mt", senderName: "Mike Torres", senderInitials: "MT",
        content: "Also checking on delivery window for the framing package. Feb 18 still works on your end?",
        timestamp: "10:55 AM", via: "email", read: false, mine: false,
      },
      {
        id: "m4", senderId: "mt", senderName: "Mike Torres", senderInitials: "MT",
        content: "One more — do you have 4×12×12 Douglas Fir in stock or would that be a special order?",
        timestamp: "11:02 AM", via: "in-app", read: false, mine: false,
      },
      {
        id: "m5", senderId: "mt", senderName: "Mike Torres", senderInitials: "MT",
        content: "Also interested in that 3% engineered lumber discount you mentioned. Can you apply it to the quote before I finalize?",
        timestamp: "11:05 AM", via: "in-app", read: false, mine: false,
      },
    ],
  },
  {
    id: "conv-2",
    participantName: "Jennifer Walsh",
    participantOrg: "Walsh Home Builders",
    participantRole: "Contractor",
    participantInitials: "JW",
    participantColor: "bg-rose-500",
    subject: "Bulk Pricing Inquiry · Cedar Siding",
    lastMessage: "Looking for 5,000 LF of cedar lap siding for a Q2 project. Do you offer volume pricing?",
    lastMessageTime: "Feb 8",
    unread: 0,
    tag: "project",
    messages: [
      {
        id: "m1", senderId: "jw", senderName: "Jennifer Walsh", senderInitials: "JW",
        content: "Hi, we're planning a 12-unit townhome project starting in Q2. Looking for roughly 5,000 LF of cedar lap siding. Do you offer volume pricing on that quantity?",
        timestamp: "Feb 8, 8:45 AM", via: "email", read: true, mine: false,
      },
      {
        id: "m2", senderId: "me", senderName: "Sarah Kim", senderInitials: "SK",
        content: "Hi Jennifer! Yes, we do offer tiered pricing on orders over 3,000 LF. I can put together a custom quote. What profile and grade are you targeting?",
        timestamp: "Feb 8, 10:15 AM", via: "in-app", read: true, mine: true,
      },
    ],
  },
  {
    id: "conv-3",
    participantName: "Platform Operations",
    participantOrg: "Lumberyard App",
    participantRole: "Platform",
    participantInitials: "PO",
    participantColor: "bg-green-600",
    subject: "New RFQ Available in Your Area",
    lastMessage: "RFQ-002 has been posted near your service area. Review it in your Quotations tab.",
    lastMessageTime: "Feb 6",
    unread: 1,
    tag: "platform",
    messages: [
      {
        id: "m1", senderId: "po", senderName: "Platform Operations", senderInitials: "PO",
        content: "A new RFQ (RFQ-002) has been posted in your service area for a residential framing project in Cedar Park, TX. Review it in your Quotations tab and submit a quote within 48 hours to remain competitive.",
        timestamp: "Feb 6, 7:00 AM", via: "email", read: false, mine: false,
      },
    ],
  },
];

const architectConversations: Conversation[] = [
  {
    id: "conv-1",
    participantName: "Mike Torres",
    participantOrg: "Torres Construction LLC",
    participantRole: "Contractor",
    participantInitials: "MT",
    participantColor: "bg-blue-500",
    subject: "Takeoff Review Request · 2847 Oak Ridge Dr",
    projectRef: "2847 Oak Ridge Dr",
    lastMessage: "What's the exact spec change on the beams? Need to confirm stock with supplier.",
    lastMessageTime: "Yesterday",
    unread: 2,
    tag: "project",
    pinned: true,
    messages: [
      {
        id: "m1", senderId: "me", senderName: "James Chen, PE", senderInitials: "JC",
        content: "Mike, I've completed the structural review for 2847 Oak Ridge Dr. Everything checks out with one minor adjustment to the LVL beam specs on the second-floor corridor.",
        timestamp: "Yesterday, 11:20 AM", via: "in-app", read: true, mine: true,
      },
      {
        id: "m2", senderId: "mt", senderName: "Mike Torres", senderInitials: "MT",
        content: "Thanks James. What's the exact spec change on the beams? Need to confirm stock availability with the supplier before finalizing the order.",
        timestamp: "Yesterday, 1:00 PM", via: "in-app", read: false, mine: false,
      },
      {
        id: "m3", senderId: "mt", senderName: "Mike Torres", senderInitials: "MT",
        content: "Also — do the updated specs affect the load calculations on the foundation? The lumberyard is asking.",
        timestamp: "Yesterday, 1:04 PM", via: "email", read: false, mine: false,
      },
    ],
  },
  {
    id: "conv-2",
    participantName: "Platform Support",
    participantOrg: "Lumberyard App",
    participantRole: "Support",
    participantInitials: "PS",
    participantColor: "bg-slate-500",
    subject: "Architect Account Verified",
    lastMessage: "Your PE license has been verified. You can now collaborate on contractor projects.",
    lastMessageTime: "Jan 30",
    unread: 0,
    tag: "support",
    messages: [
      {
        id: "m1", senderId: "ps", senderName: "Platform Support", senderInitials: "PS",
        content: "Your architect account for James Chen, PE has been verified. Your PE license and service area are on file. You can now collaborate on contractor projects and submit structural reviews through the platform.",
        timestamp: "Jan 30, 9:00 AM", via: "email", read: true, mine: false,
      },
    ],
  },
];

const homeownerConversations: Conversation[] = [
  {
    id: "conv-1",
    participantName: "Platform Support",
    participantOrg: "Lumberyard App",
    participantRole: "Support",
    participantInitials: "PS",
    participantColor: "bg-green-600",
    subject: "Welcome, Emily!",
    lastMessage: "Your project has been created. Next step: upload your plans to generate a Smart Takeoff.",
    lastMessageTime: "Feb 5",
    unread: 1,
    tag: "support",
    messages: [
      {
        id: "m1", senderId: "ps", senderName: "Platform Support", senderInitials: "PS",
        content: "Welcome to Lumberyard App, Emily! Your homeowner account is ready. Your next step is to upload your project plans — we'll generate a Smart Takeoff and connect you with local suppliers automatically.",
        timestamp: "Feb 5, 10:00 AM", via: "email", read: false, mine: false,
      },
    ],
  },
];

const conversationsByRole: Record<UserRole, Conversation[]> = {
  contractor: contractorConversations,
  lumberyard: lumberyardConversations,
  architect: architectConversations,
  homeowner: homeownerConversations,
};

const roleConfig: Record<UserRole, { user: string; initials: string }> = {
  contractor: { user: "Mike Torres", initials: "MT" },
  lumberyard: { user: "Sarah Kim", initials: "SK" },
  architect: { user: "James Chen, PE", initials: "JC" },
  homeowner: { user: "Emily Davis", initials: "ED" },
};

const tagConfig: Record<string, { label: string; color: string }> = {
  project: { label: "Project", color: "bg-blue-100 text-blue-700" },
  support: { label: "Support", color: "bg-slate-100 text-slate-600" },
  platform: { label: "Platform", color: "bg-green-100 text-green-700" },
  internal: { label: "Internal", color: "bg-violet-100 text-violet-700" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ViaLabel({ via }: { via: "in-app" | "email" }) {
  if (via === "email") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 ml-1">
        <Mail size={9} /> email relay
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 ml-1">
      <Zap size={9} /> in-app
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MessagesPage({ role }: { role: UserRole }) {
  const conversations = conversationsByRole[role];
  const me = roleConfig[role];

  const [activeId, setActiveId] = useState<string>(conversations[0]?.id ?? "");
  const [filter, setFilter] = useState<"all" | "unread" | "projects" | "support">("all");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<Record<string, Message[]>>(
    Object.fromEntries(conversations.map(c => [c.id, c.messages]))
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeId);
  const messages = activeConv ? localMessages[activeId] ?? [] : [];

  // Scroll to bottom when switching conversations
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, localMessages]);

  const filtered = conversations.filter(c => {
    if (filter === "unread" && c.unread === 0) return false;
    if (filter === "projects" && c.tag !== "project") return false;
    if (filter === "support" && c.tag !== "support" && c.tag !== "platform") return false;
    if (search && !c.participantName.toLowerCase().includes(search.toLowerCase()) &&
        !c.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  const handleSend = () => {
    if (!draft.trim() || !activeId) return;
    const newMsg: Message = {
      id: `new-${Date.now()}`,
      senderId: "me",
      senderName: me.user,
      senderInitials: me.initials,
      content: draft.trim(),
      timestamp: "Just now",
      via: "in-app",
      read: true,
      mine: true,
    };
    setLocalMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), newMsg],
    }));
    setDraft("");
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">

      {/* ── Left: Conversation List ───────────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-slate-200">

        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-base font-bold text-slate-900">Messages</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {totalUnread > 0 ? `${totalUnread} unread` : "All caught up"}
              </p>
            </div>
            <button className="w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" title="New message">
              <Plus size={15} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-1 mt-2.5">
            {(["all", "unread", "projects", "support"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 text-[11px] rounded-md font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-green-600 text-white"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <MessageSquare size={28} className="text-slate-300 mb-2" />
              <p className="text-xs text-slate-400">No conversations match your filter</p>
            </div>
          )}
          {filtered.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors relative ${
                activeId === conv.id ? "bg-green-50 hover:bg-green-50" : ""
              }`}
            >
              {/* Active indicator */}
              {activeId === conv.id && (
                <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-green-500 rounded-r" />
              )}

              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full ${conv.participantColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {conv.participantInitials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs truncate ${conv.unread > 0 ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                      {conv.participantName}
                    </span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{conv.lastMessageTime}</span>
                  </div>

                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tagConfig[conv.tag].color}`}>
                      {tagConfig[conv.tag].label}
                    </span>
                    {conv.projectRef && (
                      <span className="text-[10px] text-slate-400 truncate">{conv.projectRef}</span>
                    )}
                  </div>

                  <p className={`text-xs mt-1 truncate ${conv.unread > 0 ? "text-slate-700" : "text-slate-400"}`}>
                    {conv.lastMessage}
                  </p>
                </div>

                {conv.unread > 0 && (
                  <span className="w-5 h-5 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {conv.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Email Relay Notice */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
          <div className="flex items-start gap-2">
            <Mail size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Messages are also delivered via <span className="font-medium text-slate-500">email relay</span> when recipients are offline.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: Thread View ────────────────────────────────────────────── */}
      {activeConv ? (
        <div className="flex-1 flex flex-col min-w-0">

          {/* Thread Header */}
          <div className="flex-shrink-0 h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-6">
            <div className={`w-9 h-9 rounded-full ${activeConv.participantColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {activeConv.participantInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{activeConv.participantName}</span>
                <span className="text-xs text-slate-400">{activeConv.participantOrg}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tagConfig[activeConv.tag].color}`}>
                  {tagConfig[activeConv.tag].label}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{activeConv.subject}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {activeConv.projectRef && (
                <button className="hidden sm:flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium">
                  <ArrowUpRight size={12} /> View Project
                </button>
              )}
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Email Relay Banner */}
          <div className="flex-shrink-0 flex items-center gap-2 px-6 py-2 bg-blue-50 border-b border-blue-100">
            <Mail size={12} className="text-blue-500 flex-shrink-0" />
            <p className="text-[11px] text-blue-700">
              <span className="font-semibold">Email relay active</span> — messages are also sent to {activeConv.participantName}'s email when they're not online.
            </p>
            <button className="ml-auto text-[11px] text-blue-600 hover:underline flex-shrink-0">Manage</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {messages.map((msg, idx) => {
              const showDateSep = idx === 0 || messages[idx - 1]?.timestamp.split(",")[0] !== msg.timestamp.split(",")[0];
              return (
                <React.Fragment key={msg.id}>
                  {showDateSep && (
                    <div className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[10px] text-slate-400 font-medium px-2">
                        {msg.timestamp.includes(",") ? msg.timestamp.split(",")[0] : "Today"}
                      </span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                  )}
                  <div className={`flex items-end gap-2.5 ${msg.mine ? "flex-row-reverse" : "flex-row"}`}>
                    {!msg.mine && (
                      <div className={`w-7 h-7 rounded-full ${activeConv.participantColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-1`}>
                        {msg.senderInitials}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${msg.mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.mine
                          ? "bg-green-600 text-white rounded-br-sm"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-1 px-1 ${msg.mine ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="text-[10px] text-slate-400">
                          {msg.timestamp.includes(",") ? msg.timestamp.split(", ")[1] : msg.timestamp}
                        </span>
                        <ViaLabel via={msg.via} />
                        {msg.mine && (
                          msg.read
                            ? <CheckCheck size={11} className="text-green-500" />
                            : <Check size={11} className="text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Compose */}
          <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-slate-200">
            <div className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/15 transition-all">
              <textarea
                rows={1}
                placeholder={`Reply to ${activeConv.participantName}...`}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none min-h-[20px] max-h-32"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="text-slate-400 hover:text-slate-600 transition-colors" title="Attach file">
                  <Paperclip size={15} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg flex items-center justify-center transition-colors"
                  title="Send (Enter)"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Zap size={9} className="text-green-500" /> Sent in-app
                <span className="mx-1 text-slate-300">·</span>
                <Mail size={9} className="text-blue-400" /> Also relayed to email
              </span>
              <span className="text-[10px] text-slate-400">Enter to send · Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare size={28} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Select a conversation</h3>
          <p className="text-xs text-slate-400 max-w-xs">Choose a thread from the left to start messaging. Replies are delivered in-app and via email relay.</p>
        </div>
      )}
    </div>
  );
}
