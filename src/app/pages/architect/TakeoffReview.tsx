import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, CheckCircle, AlertTriangle, MessageSquare, Send,
  FileText, ChevronDown, ChevronRight, Search, Clock, User,
  DollarSign, MapPin, Edit2, X,
} from "lucide-react";
import { mockTakeoffReviews, mockTakeoffItems } from "../../data/mockData";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  "pending": { label: "Pending Review", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  "in-review": { label: "In Review", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  "approved": { label: "Approved", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  "revision-needed": { label: "Revision Needed", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

interface ItemNote {
  itemId: string;
  note: string;
  type: "info" | "warning" | "approved";
}

export function TakeoffReview() {
  const navigate = useNavigate();
  const [selectedReview, setSelectedReview] = useState(mockTakeoffReviews[0]);
  const [expanded, setExpanded] = useState<string[]>(["Framing Lumber"]);
  const [notes, setNotes] = useState<ItemNote[]>([
    { itemId: "t-010", note: "Verify LVL spec — should be 3.5\" × 14\" per span table for 20' span", type: "warning" },
    { itemId: "t-012", note: "HardiePlank currently on backorder at supplier. Confirm availability.", type: "info" },
  ]);
  const [globalNote, setGlobalNote] = useState("");
  const [itemNote, setItemNote] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);

  const categories = [...new Set(mockTakeoffItems.map(i => i.category))];

  const toggleCat = (cat: string) => {
    setExpanded(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const itemNoteMap = Object.fromEntries(notes.map(n => [n.itemId, n]));
  const total = mockTakeoffItems.reduce((s, i) => s + i.totalPrice, 0);

  const addItemNote = (itemId: string) => {
    if (!itemNote.trim()) return;
    setNotes(prev => {
      const existing = prev.find(n => n.itemId === itemId);
      if (existing) return prev.map(n => n.itemId === itemId ? { ...n, note: itemNote } : n);
      return [...prev, { itemId, note: itemNote, type: "warning" }];
    });
    setItemNote("");
    setSelectedItem(null);
    setShowNoteInput(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex-shrink-0 bg-white border-b border-slate-100 px-6 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/architect")} className="text-slate-500 hover:text-slate-700">
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="text-xs text-slate-500">Takeoff Review Queue</div>
              <div className="text-sm font-bold text-slate-900">{selectedReview.projectName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 text-xs px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              onClick={() => {}}
            >
              <AlertTriangle size={13} /> Request Revision
            </button>
            <button
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium"
              onClick={() => {}}
            >
              <CheckCircle size={13} /> Approve Takeoff
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Review List */}
        <div className="hidden xl:flex flex-col w-64 border-r border-slate-100 bg-slate-50 overflow-y-auto">
          <div className="p-3">
            <div className="relative mb-3">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search..." className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-500 bg-white" />
            </div>
            <div className="space-y-2">
              {mockTakeoffReviews.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReview(r)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${selectedReview.id === r.id ? "bg-white shadow-sm border border-violet-200" : "hover:bg-white"}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-900 leading-tight truncate">{r.projectName}</span>
                    <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${statusConfig[r.status].color}`}>
                      <span className={`w-1 h-1 rounded-full ${statusConfig[r.status].dot}`} />
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{r.contractorName}</div>
                  <div className="text-xs text-slate-400">{r.itemCount} items · ${(r.estimatedValue / 1000).toFixed(0)}K</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main: Items */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Project Info */}
          <div className="flex-shrink-0 bg-slate-50 px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-6 flex-wrap text-xs">
              <div className="flex items-center gap-1.5"><User size={11} className="text-slate-400" /><span className="text-slate-600">{selectedReview.contractorName}</span></div>
              <div className="flex items-center gap-1.5"><MapPin size={11} className="text-slate-400" /><span className="text-slate-600">{selectedReview.address}</span></div>
              <div className="flex items-center gap-1.5"><FileText size={11} className="text-slate-400" /><span className="text-slate-600">{selectedReview.itemCount} items</span></div>
              <div className="flex items-center gap-1.5"><DollarSign size={11} className="text-slate-400" /><span className="font-semibold text-slate-700">${selectedReview.estimatedValue.toLocaleString()}</span></div>
              <div className="flex items-center gap-1.5"><Clock size={11} className="text-slate-400" /><span className="text-slate-500">Submitted {new Date(selectedReview.submittedAt).toLocaleDateString()}</span></div>
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ml-auto ${statusConfig[selectedReview.status].color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[selectedReview.status].dot}`} />
                {statusConfig[selectedReview.status].label}
              </span>
            </div>
          </div>

          {/* Material Items */}
          <div className="flex-1 overflow-y-auto">
            {categories.map(cat => {
              const items = mockTakeoffItems.filter(i => i.category === cat);
              const isExp = expanded.includes(cat);
              const hasIssues = items.some(i => itemNoteMap[i.id]);
              return (
                <div key={cat} className="border-b border-slate-100">
                  <button
                    onClick={() => toggleCat(cat)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    {isExp ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                    <span className="flex-1 text-sm font-semibold text-slate-900 text-left">{cat}</span>
                    {hasIssues && <AlertTriangle size={13} className="text-amber-500" />}
                    <span className="text-xs text-slate-400">{items.length} items</span>
                  </button>
                  {isExp && (
                    <div className="bg-slate-50/30">
                      {items.map(item => {
                        const note = itemNoteMap[item.id];
                        const isEditing = selectedItem === item.id && showNoteInput;
                        return (
                          <div key={item.id} className="border-t border-slate-100">
                            <div className="flex items-center gap-3 px-5 py-3 group hover:bg-white transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-slate-700">{item.description}</div>
                                <div className="text-xs text-slate-400">{item.subcategory}</div>
                              </div>
                              <div className="text-xs font-semibold text-slate-700 w-20 text-right">
                                {item.quantity} {item.unit}
                              </div>
                              <div className="text-xs text-slate-500 w-24 text-right">
                                ${item.totalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => { setSelectedItem(item.id); setShowNoteInput(!isEditing || selectedItem !== item.id); }}
                                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-violet-100 text-slate-400 hover:text-violet-600 transition-colors"
                                  title="Add note"
                                >
                                  <MessageSquare size={12} />
                                </button>
                                <button
                                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-green-100 text-slate-400 hover:text-green-600 transition-colors"
                                  title="Mark OK"
                                >
                                  <CheckCircle size={12} />
                                </button>
                              </div>
                            </div>
                            {note && (
                              <div className={`mx-5 mb-3 px-3 py-2 rounded-lg border text-xs flex items-start gap-2 ${
                                note.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-700" :
                                note.type === "approved" ? "bg-green-50 border-green-200 text-green-700" :
                                "bg-blue-50 border-blue-200 text-blue-700"
                              }`}>
                                {note.type === "warning" ? <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" /> :
                                 note.type === "approved" ? <CheckCircle size={11} className="flex-shrink-0 mt-0.5" /> :
                                 <MessageSquare size={11} className="flex-shrink-0 mt-0.5" />}
                                {note.note}
                                <button
                                  onClick={() => setNotes(prev => prev.filter(n => n.itemId !== item.id))}
                                  className="ml-auto flex-shrink-0"
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            )}
                            {isEditing && (
                              <div className="mx-5 mb-3 flex gap-2">
                                <input
                                  autoFocus
                                  type="text"
                                  placeholder="Add a review note..."
                                  value={itemNote}
                                  onChange={e => setItemNote(e.target.value)}
                                  onKeyDown={e => e.key === "Enter" && addItemNote(item.id)}
                                  className="flex-1 px-3 py-1.5 text-xs border border-violet-300 rounded-lg focus:outline-none focus:border-violet-500"
                                />
                                <button onClick={() => addItemNote(item.id)} className="px-3 py-1.5 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-700">Add</button>
                                <button onClick={() => { setShowNoteInput(false); setSelectedItem(null); }} className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs rounded-lg hover:bg-slate-50">Cancel</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Global Notes */}
          <div className="flex-shrink-0 border-t border-slate-100 p-4">
            <div className="flex gap-2">
              <textarea
                rows={2}
                placeholder="Add overall review notes (visible to contractor)..."
                value={globalNote}
                onChange={e => setGlobalNote(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 resize-none"
              />
              <div className="flex flex-col gap-1">
                <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-medium transition-colors">
                  Revision
                </button>
                <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-colors">
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
