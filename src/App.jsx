import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, RotateCcw, CheckCircle2, ListTodo, Calendar,
  Timer as TimerIcon, Plus, X, Trash2, GripVertical, Check,
  Lightbulb, Rocket, Link as LinkIcon, Tag, Sliders,
  MoreHorizontal, Flag, Layout, List, PlusCircle, ChevronDown,
  Search, Pin, ArrowRightCircle,
  Book, FolderOpen, FileText, Star, Sidebar as SidebarIcon,
  Share2, ArrowLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- UPDATED HOOK: POMODORO (With Custom Time) ---
const usePomodoro = () => {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  // Custom Focus Duration (in minutes) - Default 25
  const [customFocusTime, setCustomFocusTime] = useState(25);

  const modes = {
    focus: { label: 'Focus', time: customFocusTime * 60, color: 'text-rose-600' },
    short: { label: 'Short Break', time: 5 * 60, color: 'text-teal-600' },
    long: { label: 'Long Break', time: 15 * 60, color: 'text-blue-600' },
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'focus') setCycles((c) => c + 1);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].time);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(modes[newMode].time);
  };

  // Update time when user changes custom duration (only if currently in focus mode & paused)
  const updateCustomTime = (newMinutes) => {
    const safeMinutes = Math.max(1, Math.min(120, newMinutes)); // Limit 1-120 mins
    setCustomFocusTime(safeMinutes);
    if (mode === 'focus' && !isActive) {
      setTimeLeft(safeMinutes * 60);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    mode, modes, timeLeft, isActive, cycles,
    toggleTimer, resetTimer, switchMode, formatTime,
    customFocusTime, updateCustomTime
  };
};

// --- COMPONENT: TIMER VIEW (Fixed & Customizable) ---
const TimerView = ({ state, tasks, setTasks, note, setNote }) => {

  // Helper for Task List
  const ListCard = ({ title, icon: Icon, items = [], setItems, placeholder }) => {
    const [newItem, setNewItem] = useState("");

    const addItem = () => {
      if (!newItem.trim()) return;
      setItems([...items, { id: Date.now(), text: newItem, done: false }]);
      setNewItem("");
    };

    const toggleItem = (id) => {
      setItems(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
    };

    const deleteItem = (id) => {
      setItems(items.filter(i => i.id !== id));
    };

    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-rose-100/50 shadow-sm flex flex-col h-96">
        <div className="flex items-center gap-2 mb-4 text-rose-950 font-bold">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-500"><Icon size={18} /></div>
          <span>{title}</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
          {items.length === 0 && (
            <div className="text-center text-rose-300 text-xs mt-10 italic">No items yet...</div>
          )}
          {items.map(item => (
            <div key={item.id} className="group flex items-center gap-3 text-sm text-slate-600 bg-white/50 p-2 rounded-xl border border-transparent hover:border-rose-100 transition-all">
              <button
                onClick={() => toggleItem(item.id)}
                className={clsx("w-5 h-5 rounded-full border flex items-center justify-center transition-colors", item.done ? "bg-rose-400 border-rose-400 text-white" : "border-rose-200 hover:border-rose-400")}
              >
                {item.done && <Check size={12} strokeWidth={3} />}
              </button>
              <span className={clsx("flex-1 truncate", item.done && "line-through text-rose-200")}>{item.text}</span>
              <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-red-400"><X size={14} /></button>
            </div>
          ))}
        </div>

        <div className="mt-4 relative">
          <input
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder={placeholder}
            className="w-full bg-white border border-rose-100 rounded-xl py-2 pl-3 pr-8 text-sm outline-none focus:border-rose-300 placeholder:text-rose-200 text-rose-900"
          />
          <button onClick={addItem} className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-400 hover:bg-rose-50 p-1 rounded-md"><Plus size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar h-full">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-24">

        {/* 1. CLOCK SECTION */}
        <div className="flex flex-col items-center justify-center py-12">

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 bg-white/50 rounded-full border border-rose-100 mb-8 shadow-sm">
            {['focus', 'short', 'long'].map((mode) => (
              <button
                key={mode}
                onClick={() => state.switchMode(mode)} // <--- FIXED: uses switchMode now
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize",
                  state.mode === mode
                    ? `bg-white shadow-sm ${state.modes[mode].color}`
                    : "text-rose-300 hover:text-rose-500"
                )}
              >
                {state.modes[mode].label}
              </button>
            ))}
          </div>

          {/* Time Display */}
          <div className="relative group">
            <div className="text-[9rem] font-bold text-rose-950 font-mono tracking-tighter leading-none select-none drop-shadow-sm">
              {state.formatTime(state.timeLeft)}
            </div>

            {/* Custom Time Controls (Visible when paused in Focus mode) */}
            {state.mode === 'focus' && !state.isActive && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-rose-100 shadow-sm">
                <button onClick={() => state.updateCustomTime(state.customFocusTime - 5)} className="text-rose-400 hover:bg-rose-100 p-1 rounded-full text-[10px] font-bold">-5</button>
                <span className="text-xs font-bold text-rose-600 w-12 text-center">{state.customFocusTime} min</span>
                <button onClick={() => state.updateCustomTime(state.customFocusTime + 5)} className="text-rose-400 hover:bg-rose-100 p-1 rounded-full text-[10px] font-bold">+5</button>
              </div>
            )}
          </div>

          <div className="text-rose-300 font-bold tracking-widest text-xs uppercase mt-8 mb-10 animate-pulse">
            {state.isActive ? 'Focusing...' : 'Ready to Start'}
          </div>

          {/* Play Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={state.toggleTimer}
              className="w-24 h-24 bg-rose-500 hover:bg-rose-600 rounded-[2.5rem] text-white flex items-center justify-center shadow-2xl shadow-rose-400/50 transition-all hover:scale-105 active:scale-95"
            >
              {state.isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={state.resetTimer} className="w-16 h-16 bg-white hover:bg-rose-50 text-rose-300 border border-rose-100 rounded-[1.8rem] flex items-center justify-center transition-all">
              <RotateCcw size={22} />
            </button>
          </div>
        </div>

        {/* 2. TASKS & PLAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
          <ListCard
            title="Focus Session Tasks"
            icon={ListTodo}
            items={tasks} setItems={setTasks}
            placeholder="What to do now..."
          />

          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-rose-100/50 shadow-sm flex flex-col h-96">
            <div className="flex items-center gap-2 mb-4 text-rose-950 font-bold">
              <div className="p-2 bg-rose-100 rounded-xl text-rose-500"><Calendar size={18} /></div>
              <span>Daily Intention</span>
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="• Morning Goal...&#10;• Afternoon Goal...&#10;• Evening Relax..."
              className="flex-1 w-full bg-transparent resize-none outline-none text-sm text-slate-600 leading-relaxed placeholder:text-rose-200/60 custom-scrollbar"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

// 2. IDEAS VIEW (Full Screen)
const IdeasView = ({ ideas, setIdeas, categories, setCategories, projects, setProjects }) => {
  const [activeId, setActiveId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [selectedCat, setSelectedCat] = useState(categories[0] || "General");

  const activeIdea = ideas.find(i => i.id === activeId);

  const createIdea = () => {
    if (!newTitle.trim()) return;
    const newIdea = {
      id: Date.now(),
      title: newTitle,
      body: "",
      category: selectedCat,
      connections: [],
      isPinned: false
    };
    setIdeas([newIdea, ...ideas]);
    setNewTitle("");
    setActiveId(newIdea.id);
  };

  const updateIdea = (id, field, value) => {
    setIdeas(ideas.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const togglePin = (e, id) => {
    e.stopPropagation();
    setIdeas(ideas.map(i => i.id === id ? { ...i, isPinned: !i.isPinned } : i));
  };

  const promoteToProject = () => {
    if (!activeIdea) return;
    if (confirm(`Promote "${activeIdea.title}" to a Project?`)) {
      setProjects([...projects, {
        id: Date.now(),
        title: activeIdea.title,
        status: "Planning",
        priority: "Medium",
        deadline: "",
        progress: 0,
        steps: [],
        notes: activeIdea.body
      }]);
      setIdeas(ideas.filter(i => i.id !== activeIdea.id));
      setActiveId(null);
    }
  };

  const deleteIdea = (e, id) => {
    e.stopPropagation();
    setIdeas(ideas.filter(i => i.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const addCategory = () => {
    if (newCatName.trim()) {
      setCategories([...categories, newCatName]);
      setSelectedCat(newCatName);
      setNewCatName("");
      setIsAddingCat(false);
    }
  };

  const filteredIdeas = ideas
    .filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.category.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (b.isPinned === a.isPinned) ? 0 : b.isPinned ? 1 : -1);

  return (
    <div className="w-full h-full flex gap-6 animate-in slide-in-from-right-8 duration-500 pb-20 md:pb-0">
      {/* LEFT LIST */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-rose-950 flex items-center gap-2">
            <Lightbulb className="text-amber-400" size={18} /> Idea Bank
          </h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-300" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-rose-50/50 pl-9 pr-3 py-2 rounded-xl text-xs outline-none text-rose-800 placeholder:text-rose-300 border border-transparent focus:border-rose-200 transition-all"
            />
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-rose-100 shadow-sm">
          <div className="flex gap-2 mb-2">
            <input
              value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createIdea()}
              placeholder="New Idea..."
              className="flex-1 text-xs font-medium text-rose-900 placeholder:text-rose-300 outline-none border-b border-rose-100 pb-1"
            />
            <button onClick={createIdea} className="bg-rose-500 text-white p-1 rounded-lg hover:bg-rose-600"><Plus size={14} /></button>
          </div>
          <div className="flex items-center gap-2">
            {!isAddingCat ? (
              <div className="relative group w-full">
                <select
                  value={selectedCat}
                  onChange={(e) => e.target.value === 'ADD_NEW' ? setIsAddingCat(true) : setSelectedCat(e.target.value)}
                  className="w-full appearance-none bg-rose-50 text-rose-500 text-[10px] font-bold px-2 py-1.5 rounded-lg outline-none cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="ADD_NEW">+ New Tag...</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1 w-full">
                <input autoFocus value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Tag..." className="flex-1 text-[10px] border border-rose-200 rounded px-1 py-1 outline-none" />
                <button onClick={addCategory} className="text-emerald-500"><Check size={12} /></button>
                <button onClick={() => setIsAddingCat(false)} className="text-rose-400"><X size={12} /></button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
          {filteredIdeas.map(idea => (
            <div
              key={idea.id}
              onClick={() => setActiveId(idea.id)}
              className={cn(
                "group relative p-3 rounded-2xl border cursor-pointer transition-all",
                activeId === idea.id
                  ? "bg-white border-rose-300 shadow-md scale-[1.02]"
                  : "bg-white/60 border-transparent hover:bg-white hover:border-rose-100"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{idea.category}</span>
                {idea.isPinned && <Pin size={10} className="text-amber-400 fill-amber-400" />}
              </div>
              <div className="text-sm font-bold text-rose-900 leading-tight mb-1">{idea.title}</div>
              <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                {idea.body || "No details..."}
              </div>
              <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => togglePin(e, idea.id)} className="p-1 hover:bg-amber-50 rounded text-slate-300 hover:text-amber-500"><Pin size={12} /></button>
                <button onClick={(e) => deleteIdea(e, idea.id)} className="p-1 hover:bg-red-50 rounded text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT EDITOR (Hidden on mobile if no active selection, handled via simple CSS/logic for now, usually needs dedicated mobile view but keeping simple for split view) */}
      <div className={cn("hidden md:flex flex-1 bg-white rounded-[2rem] border border-rose-100 shadow-sm p-8 flex-col relative overflow-hidden", activeId && "flex fixed inset-0 z-50 md:static md:inset-auto")}>
        {activeId && (
          <button onClick={() => setActiveId(null)} className="md:hidden absolute top-4 left-4 p-2 bg-rose-50 text-rose-500 rounded-full"><ArrowLeft size={20} /></button>
        )}
        {activeIdea ? (
          <>
            <div className="flex justify-between items-start mb-6 border-b border-rose-50 pb-4 mt-8 md:mt-0">
              <div className="w-full">
                <input
                  value={activeIdea.title}
                  onChange={e => updateIdea(activeIdea.id, 'title', e.target.value)}
                  className="text-2xl font-bold text-rose-950 bg-transparent outline-none placeholder:text-rose-200 w-full"
                  placeholder="Untitled Idea"
                />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md font-semibold">{activeIdea.category}</span>
                </div>
              </div>
              <button
                onClick={promoteToProject}
                className="hidden md:flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition-all active:scale-95"
              >
                <Rocket size={14} /> Promote
              </button>
            </div>
            <textarea
              value={activeIdea.body}
              onChange={e => updateIdea(activeIdea.id, 'body', e.target.value)}
              placeholder="Expand on your idea..."
              className="flex-1 w-full resize-none bg-transparent outline-none text-base text-slate-600 leading-relaxed custom-scrollbar font-medium"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-rose-200 opacity-50">
            <Lightbulb size={64} className="mb-4 text-rose-100" />
            <p className="text-lg font-bold">Select an idea</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. PROJECTS VIEW (Full Screen)
const ProjectsView = ({ projects, setProjects }) => {
  const [activeId, setActiveId] = useState(null);
  const [newProjName, setNewProjName] = useState("");
  const [newStep, setNewStep] = useState("");

  const updateProject = (id, field, value) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const activeProject = projects.find(p => p.id === activeId);

  const addStep = () => {
    if (!newStep.trim()) return;
    const currentSteps = activeProject.steps || [];
    const newStepObj = { id: Date.now(), text: newStep, done: false };
    updateProject(activeId, 'steps', [...currentSteps, newStepObj]);
    setNewStep("");
  };

  const toggleStep = (stepId) => {
    const currentSteps = activeProject.steps || [];
    const updatedSteps = currentSteps.map(s => s.id === stepId ? { ...s, done: !s.done } : s);
    updateProject(activeId, 'steps', updatedSteps);
    const doneCount = updatedSteps.filter(s => s.done).length;
    const progress = Math.round((doneCount / updatedSteps.length) * 100);
    updateProject(activeId, 'progress', progress);
  };

  const deleteStep = (stepId) => {
    const currentSteps = activeProject.steps || [];
    updateProject(activeId, 'steps', currentSteps.filter(s => s.id !== stepId));
  };

  const addProject = () => {
    if (!newProjName.trim()) return;
    setProjects([...projects, {
      id: Date.now(),
      title: newProjName,
      status: "Planning",
      deadline: "",
      progress: 0,
      steps: [],
      notes: ""
    }]);
    setNewProjName("");
  };

  return (
    <div className="w-full h-full flex flex-col animate-in slide-in-from-right-8 duration-500 pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-rose-950 flex items-center gap-2">
          <Layout className="text-rose-400" size={24} />
          {activeProject ? activeProject.title : "Project Board"}
        </h2>
        {activeProject && (
          <button onClick={() => setActiveId(null)} className="text-xs bg-rose-50 text-rose-500 px-3 py-1 rounded-full border border-rose-100 hover:bg-rose-100">
            ← Back
          </button>
        )}
      </div>

      {!activeProject ? (
        <div className="flex-1 bg-white/40 border border-white rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col backdrop-blur-sm">
          <div className="hidden md:grid grid-cols-12 gap-4 text-[10px] uppercase font-bold text-slate-400 px-4 mb-3">
            <div className="col-span-5">Project Name</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Deadline</div>
            <div className="col-span-2 text-right">Progress</div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-0">
            {projects.map(p => (
              <div
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center bg-white border border-rose-50 p-4 rounded-xl cursor-pointer hover:border-rose-300 hover:shadow-md transition-all group"
              >
                <div className="col-span-5 font-bold text-rose-900 flex items-center gap-2">
                  <Rocket size={16} className="text-rose-300" />
                  {p.title}
                </div>
                <div className="col-span-2 flex items-center justify-between md:justify-start">
                  <span className="md:hidden text-xs text-slate-400">Status:</span>
                  <span className={cn("text-[10px] px-2 py-1 rounded-full font-bold uppercase",
                    p.status === 'Active' ? "bg-emerald-100 text-emerald-600" :
                      p.status === 'Done' ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-600"
                  )}>
                    {p.status}
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-rose-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-rose-400">{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 bg-white p-2 rounded-xl border border-dashed border-rose-200 shrink-0">
            <Plus size={18} className="text-rose-400 ml-2" />
            <input
              value={newProjName}
              onChange={e => setNewProjName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addProject()}
              placeholder="Start a new project..."
              className="bg-transparent outline-none text-sm text-rose-600 placeholder:text-rose-300 w-full"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
          <div className="flex-1 bg-white rounded-3xl border border-rose-100 p-6 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-rose-950 flex items-center gap-2">
                <ListTodo size={18} className="text-rose-400" /> Action Plan
              </h3>
              <span className="text-xs text-rose-400 font-mono bg-rose-50 px-2 py-1 rounded-lg">
                {(activeProject.steps || []).filter(s => s.done).length} / {(activeProject.steps || []).length}
              </span>
            </div>
            <div className="flex gap-2 mb-4 shrink-0">
              <input
                value={newStep} onChange={e => setNewStep(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addStep()}
                placeholder="Next step..."
                className="flex-1 bg-rose-50/50 border border-rose-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-rose-300"
              />
              <button onClick={addStep} className="bg-rose-500 text-white px-3 rounded-xl hover:bg-rose-600"><Plus size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2 min-h-0">
              {(activeProject.steps || []).map(step => (
                <div key={step.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                      step.done ? "bg-emerald-500 border-emerald-500" : "border-rose-200 hover:border-rose-400"
                    )}
                  >
                    {step.done && <Check size={12} className="text-white" />}
                  </button>
                  <span className={cn("flex-1 text-sm text-slate-700", step.done && "line-through text-slate-400")}>
                    {step.text}
                  </span>
                  <button onClick={() => deleteStep(step.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm">
              <label className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-2 block">Status</label>
              <select
                value={activeProject.status}
                onChange={(e) => updateProject(activeId, 'status', e.target.value)}
                className="w-full bg-rose-50 border border-rose-100 text-rose-800 text-sm font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Done">Completed</option>
              </select>
            </div>
            <div className="flex-1 bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex flex-col min-h-[150px]">
              <label className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-2 block">Notes</label>
              <textarea
                value={activeProject.notes || ""}
                onChange={(e) => updateProject(activeId, 'notes', e.target.value)}
                placeholder="Details..."
                className="flex-1 w-full resize-none bg-transparent outline-none text-sm text-slate-600 leading-relaxed custom-scrollbar"
              />
            </div>
            <button
              onClick={() => {
                if (confirm("Delete this project?")) {
                  setProjects(projects.filter(p => p.id !== activeId));
                  setActiveId(null);
                }
              }}
              className="w-full py-3 rounded-2xl border border-red-100 text-red-400 hover:bg-red-50 text-xs font-bold transition-colors shrink-0"
            >
              Delete Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: NOTES VIEW (With Connections & Linking) ---
const NotesView = ({ notes, setNotes, categories, setCategories, activeNoteId, setActiveNoteId, isMobile }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [linkSearch, setLinkSearch] = useState("");
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const activeNote = notes.find(n => n.id === activeNoteId);

  // --- ACTIONS ---
  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: "Untitled",
      category: selectedCategory === "All" ? categories[0] : selectedCategory,
      body: "",
      updatedAt: new Date().toLocaleDateString(),
      links: []
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const createSonNote = () => {
    if (!activeNote) return;
    const newSonId = Date.now();
    const newSon = {
      id: newSonId,
      title: `Child of ${activeNote.title}`,
      category: activeNote.category,
      body: "",
      updatedAt: new Date().toLocaleDateString(),
      links: [activeNote.id] // Auto-link to parent
    };

    // 1. Add son to notes list
    // 2. Add son's ID to parent's link list
    setNotes(prev => {
      const withSon = [newSon, ...prev];
      return withSon.map(n => n.id === activeNote.id ? { ...n, links: [...(n.links || []), newSonId] } : n);
    });
    setActiveNoteId(newSonId);
  };

  const updateNote = (id, field, value) => {
    setNotes(notes.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const deleteNote = (e, id) => {
    e.stopPropagation();
    setNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const toggleLink = (targetId) => {
    if (!activeNote) return;
    const isLinked = (activeNote.links || []).includes(targetId);

    // Bi-directional linking (Updates both notes)
    setNotes(notes.map(n => {
      if (n.id === activeNote.id) {
        return { ...n, links: isLinked ? n.links.filter(l => l !== targetId) : [...(n.links || []), targetId] };
      }
      if (n.id === targetId) {
        return { ...n, links: isLinked ? n.links.filter(l => l !== activeNote.id) : [...(n.links || []), activeNote.id] };
      }
      return n;
    }));
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === "ADD_NEW_CAT_OPTION") {
      setIsCreatingCat(true);
      setNewCatName("");
    } else {
      updateNote(activeNote.id, 'category', val);
    }
  };

  const saveNewCategory = () => {
    if (newCatName.trim()) {
      if (!categories.includes(newCatName)) {
        setCategories([...categories, newCatName]);
      }
      updateNote(activeNote.id, 'category', newCatName);
    }
    setIsCreatingCat(false);
  };

  // --- FILTERING ---
  const filteredNotes = notes.filter(note => {
    const matchesCategory = selectedCategory === "All" ? true : note.category === selectedCategory;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const showList = !isMobile || (isMobile && !activeNoteId);
  const showEditor = !isMobile || (isMobile && activeNoteId);

  return (
    <div className={clsx("w-full h-full flex gap-6 animate-in fade-in duration-500", !isMobile && "pb-24")}>

      {/* 1. LIST SIDEBAR */}
      {showList && (
        <div className={clsx("flex flex-col gap-4", isMobile ? "w-full" : "w-64")}>
          {!isMobile && (
            <div className="flex items-center gap-2 px-2 text-rose-950/50">
              <Book size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Library</span>
            </div>
          )}

          <div className="bg-white/60 rounded-2xl border border-rose-100/50 p-3 space-y-1">
            <button onClick={() => setSelectedCategory("All")} className={clsx("w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors", selectedCategory === "All" ? "bg-white text-rose-600 shadow-sm" : "text-slate-400 hover:bg-rose-50")}>
              All Notes
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={clsx("w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors", selectedCategory === cat ? "bg-white text-rose-600 shadow-sm" : "text-slate-400 hover:bg-rose-50")}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white/60 rounded-2xl border border-rose-100/50 p-3 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-[10px] font-bold text-rose-300 uppercase">{filteredNotes.length} Notes</span>
              <button onClick={createNote} className="text-rose-400 hover:bg-rose-100 p-1 rounded"><Plus size={14} /></button>
            </div>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-white/50 border border-rose-100 rounded-lg px-2 py-1.5 text-xs outline-none text-rose-800 placeholder:text-rose-300 mb-2" />
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
              {filteredNotes.map(note => (
                <div key={note.id} onClick={() => setActiveNoteId(note.id)} className={clsx("group flex justify-between p-2 rounded-lg cursor-pointer transition-all", activeNoteId === note.id ? "bg-white shadow-sm text-rose-600" : "hover:bg-white/50 text-slate-600")}>
                  <span className="text-xs font-bold truncate">{note.title || "Untitled"}</span>
                  {activeNoteId === note.id && <button onClick={(e) => deleteNote(e, note.id)} className="text-rose-300 hover:text-red-400"><Trash2 size={12} /></button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. EDITOR + CONNECTIONS PANEL */}
      {showEditor && (
        <div className={clsx("flex-1 bg-white rounded-[2rem] border border-rose-100 shadow-sm p-6 flex flex-col md:flex-row gap-8 overflow-hidden relative", isMobile && "fixed inset-0 z-[200] rounded-none p-4 overflow-y-auto")}>

          {/* Mobile Back Button */}
          {isMobile && (
            <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
              <button onClick={() => setActiveNoteId(null)} className="bg-rose-50 text-rose-500 p-2 rounded-full hover:bg-rose-100 border border-rose-100 shadow-sm">
                <ArrowLeft size={20} />
              </button>
            </div>
          )}

          {activeNote ? (
            <>
              {/* LEFT: WRITING AREA */}
              <div className={clsx("flex-1 flex flex-col h-full", isMobile && "mt-12 min-h-[500px]")}>
                {/* Header Metadata */}
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-6">
                  {isCreatingCat ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveNewCategory()}
                        placeholder="New Category..."
                        className="bg-rose-50 border border-rose-200 text-rose-600 px-2 py-1 rounded text-[10px] font-bold outline-none w-32"
                      />
                      <button onClick={saveNewCategory} className="text-emerald-500 hover:bg-emerald-50 p-1 rounded"><Check size={12} /></button>
                    </div>
                  ) : (
                    <div className="relative group">
                      <select
                        value={activeNote.category}
                        onChange={handleCategoryChange}
                        className="appearance-none bg-rose-50 hover:bg-rose-100 text-rose-500 px-3 py-1 rounded-md font-bold cursor-pointer outline-none transition-colors pr-6"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="ADD_NEW_CAT_OPTION">+ New...</option>
                      </select>
                      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" />
                    </div>
                  )}
                  <span>{activeNote.updatedAt}</span>
                </div>

                <input
                  value={activeNote.title}
                  onChange={e => updateNote(activeNote.id, 'title', e.target.value)}
                  className="text-3xl font-bold text-rose-950 outline-none bg-transparent mb-4 placeholder:text-rose-200"
                  placeholder="Untitled Note"
                />
                <textarea
                  value={activeNote.body}
                  onChange={e => updateNote(activeNote.id, 'body', e.target.value)}
                  placeholder="Start writing..."
                  className="flex-1 w-full resize-none outline-none text-base text-slate-600 leading-7 custom-scrollbar bg-transparent font-medium"
                />
              </div>

              {/* RIGHT: CONNECTIONS PANEL */}
              <div className={clsx("border-l border-rose-50 pl-6 flex flex-col", isMobile ? "w-full border-l-0 border-t pl-0 pt-6 mt-6 h-80 shrink-0" : "w-64 h-full")}>
                <div className="flex items-center gap-2 text-xs font-bold text-rose-950 mb-4">
                  <LinkIcon size={14} className="text-rose-400" /> Connections
                </div>

                {/* Create Child Button */}
                <button onClick={createSonNote} className="w-full mb-4 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-rose-100">
                  <Rocket size={14} /> Create Child Note
                </button>

                {/* Link Search */}
                <div className="relative mb-3">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-300" />
                  <input
                    value={linkSearch}
                    onChange={e => setLinkSearch(e.target.value)}
                    placeholder="Link to other note..."
                    className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-transparent focus:border-rose-200 rounded-xl text-[10px] outline-none transition-all"
                  />
                </div>

                {/* Navigator / Link List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                  {notes
                    .filter(n => n.id !== activeNote.id) // Don't link to self
                    .filter(n => n.title.toLowerCase().includes(linkSearch.toLowerCase()))
                    .map(other => {
                      const isLinked = (activeNote.links || []).includes(other.id);
                      return (
                        <button
                          key={other.id}
                          onClick={() => toggleLink(other.id)}
                          className={clsx(
                            "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between group",
                            isLinked ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-white text-slate-500 border border-transparent hover:bg-rose-50"
                          )}
                        >
                          <span className="truncate flex-1">{other.title || "Untitled"}</span>
                          {isLinked ? (
                            <Check size={12} className="text-rose-500" />
                          ) : (
                            <Plus size={12} className="opacity-0 group-hover:opacity-100 text-rose-300" />
                          )}
                        </button>
                      );
                    })
                  }
                  {notes.length <= 1 && (
                    <div className="text-center text-[10px] text-slate-300 italic mt-4">
                      No other notes to link.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-rose-200 opacity-50">
              <Book size={64} className="mb-4" />
              <p className="font-bold uppercase tracking-widest text-sm">Select a note</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: GRAPH VIEW (Fixed Physics) ---
const GraphView = ({ notes = [], setNotes, activeNoteId, setActiveNoteId, setView, isMobile }) => {
  const nodeRefs = useRef({});
  const linkRefs = useRef({});
  const containerRef = useRef(null);
  const simulationNodes = useRef([]);
  const requestRef = useRef();

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [selectedNode, setSelectedNode] = useState(null);
  const dragRef = useRef({ active: false, type: null, startX: 0, startY: 0, nodeId: null });

  // 1. Initialize Nodes
  useEffect(() => {
    const safeNotes = Array.isArray(notes) ? notes : [];
    simulationNodes.current = safeNotes.map(note => {
      const existing = simulationNodes.current.find(n => n.id === note.id);
      // Keep existing physics state (x, y, vx, vy) to prevent "resetting" jumps
      return existing ? { ...existing, ...note } : {
        ...note,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        vx: 0, vy: 0
      };
    });
  }, [notes]);

  // 2. The Physics Engine
  useEffect(() => {
    const tick = () => {
      const nodes = simulationNodes.current;
      if (!nodes) return;

      // --- RESTORED PHYSICS CONSTANTS ---
      const REPULSION = isMobile ? 4000 : 6000;
      const SPRING_LEN = 100;      // <--- Was missing in last version
      const SPRING_K = 0.005;      // <--- Was missing in last version
      const CENTER_GRAVITY = 0.0005;
      const DAMPING = 0.88;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (dragRef.current.active && dragRef.current.type === 'NODE' && dragRef.current.nodeId === node.id) continue;

        // Center Gravity (Pull to middle)
        node.vx -= node.x * CENTER_GRAVITY;
        node.vy -= node.y * CENTER_GRAVITY;

        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          // Repulsion (Push apart)
          if (dist < 500) {
            const force = REPULSION / (dist * dist);
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          }

          // Group Attraction (Pull similar categories slightly)
          if (node.category === other.category) {
            node.vx -= dx * 0.0002;
            node.vy -= dy * 0.0002;
          }
        }

        // Links (Springs)
        if (Array.isArray(node.links)) {
          node.links.forEach(linkId => {
            const target = nodes.find(n => n.id === linkId);
            if (target) {
              const dx = node.x - target.x;
              const dy = node.y - target.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const displacement = dist - SPRING_LEN;
              const force = displacement * SPRING_K;

              node.vx -= (dx / dist) * force;
              node.vy -= (dy / dist) * force;
            }
          });
        }
      }

      // Update Positions & DOM
      nodes.forEach(node => {
        if (!dragRef.current.active || dragRef.current.nodeId !== node.id) {
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= DAMPING;
          node.vy *= DAMPING;
        }

        const nodeEl = nodeRefs.current[node.id];
        if (nodeEl) {
          const size = Math.min(80, 24 + ((node.links?.length || 0) * 8));
          nodeEl.style.transform = `translate3d(${node.x - size / 2}px, ${node.y - size / 2}px, 0)`;
        }

        // Update Lines
        if (Array.isArray(node.links)) {
          node.links.forEach(linkId => {
            const lineEl = linkRefs.current[`${node.id}-${linkId}`];
            const target = nodes.find(n => n.id === linkId);
            if (lineEl && target) {
              lineEl.setAttribute('x1', node.x);
              lineEl.setAttribute('y1', node.y);
              lineEl.setAttribute('x2', target.x);
              lineEl.setAttribute('y2', target.y);
            }
          });
        }
      });
      requestRef.current = requestAnimationFrame(tick);
    };
    requestRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isMobile]);

  // 3. Handlers
  const handleMouseDown = (e, node = null) => {
    if (node) {
      e.stopPropagation();
      dragRef.current = { active: true, type: 'NODE', startX: e.clientX, startY: e.clientY, nodeId: node.id };
      setSelectedNode(node);
    } else {
      // Allow dragging canvas
      if (e.target.tagName !== 'DIV' && e.target.tagName !== 'svg') return;
      setSelectedNode(null);
      dragRef.current = { active: true, type: 'CANVAS', startX: e.clientX - transform.x, startY: e.clientY - transform.y, nodeId: null };
    }
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.active) return;
    if (dragRef.current.type === 'CANVAS') {
      setTransform(prev => ({ ...prev, x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY }));
    } else if (dragRef.current.type === 'NODE') {
      const node = simulationNodes.current.find(n => n.id === dragRef.current.nodeId);
      if (node && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        node.x = (e.clientX - rect.left - centerX - transform.x) / transform.scale;
        node.y = (e.clientY - rect.top - centerY - transform.y) / transform.scale;
        node.vx = 0; node.vy = 0;
      }
    }
  };

  const handleMouseUp = () => { dragRef.current.active = false; };

  if (!notes) return null;

  return (
    <div className={clsx("w-full h-full relative overflow-hidden animate-in fade-in duration-700", !isMobile && "pb-4")}>

      {/* Canvas Layer */}
      <div className={clsx("bg-slate-900 overflow-hidden relative border border-slate-800 shadow-2xl select-none flex items-center justify-center", isMobile ? "absolute inset-0 z-0" : "w-full h-full rounded-[2rem]")}>

        {/* HUD Controls */}
        <div className="absolute top-6 right-6 z-50 flex flex-col gap-2 bg-slate-800/80 backdrop-blur p-2 rounded-xl border border-slate-700 shadow-xl">
          <button onClick={() => setTransform(t => ({ ...t, scale: t.scale + 0.2 }))} className="p-2 text-white hover:bg-slate-700 rounded-lg"><Plus size={20} /></button>
          <button onClick={() => setTransform(t => ({ ...t, scale: Math.max(0.1, t.scale - 0.2) }))} className="p-2 text-white hover:bg-slate-700 rounded-lg flex items-center justify-center h-9 w-9 font-bold text-lg">-</button>
          <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="p-2 text-rose-400 hover:bg-slate-700 rounded-lg"><RotateCcw size={20} /></button>
        </div>

        {/* Interactive Area */}
        <div
          ref={containerRef}
          onMouseDown={(e) => handleMouseDown(e, null)}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          // Add touch support for mobile
          onTouchStart={(e) => { const t = e.touches[0]; handleMouseDown({ ...e, clientX: t.clientX, clientY: t.clientY, target: e.target }, null); }}
          onTouchMove={(e) => { const t = e.touches[0]; handleMouseMove({ ...e, clientX: t.clientX, clientY: t.clientY }); }}
          onTouchEnd={handleMouseUp}
          className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center touch-none"
        >
          <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: 'center center' }} className="relative w-0 h-0 flex items-center justify-center">

            {/* Lines */}
            <svg className="overflow-visible absolute top-0 left-0 pointer-events-none">
              {notes.map(node => ((Array.isArray(node.links) ? node.links : []).map(linkId => (<line key={`${node.id}-${linkId}`} ref={el => linkRefs.current[`${node.id}-${linkId}`] = el} stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />))))}
            </svg>

            {/* Nodes */}
            {notes.map(node => {
              const linkCount = Array.isArray(node.links) ? node.links.length : 0;
              const size = Math.min(80, 32 + (linkCount * 8));
              return (
                <div
                  key={node.id}
                  ref={el => nodeRefs.current[node.id] = el}
                  onMouseDown={(e) => handleMouseDown(e, node)}
                  onTouchStart={(e) => { e.stopPropagation(); const t = e.touches[0]; handleMouseDown({ ...e, clientX: t.clientX, clientY: t.clientY }, node); }}
                  style={{ width: size, height: size }}
                  className={clsx("absolute left-0 top-0 rounded-full flex items-center justify-center border shadow-[0_0_20px_rgba(0,0,0,0.3)] cursor-pointer transition-colors duration-200", selectedNode?.id === node.id ? "bg-rose-500 border-rose-300 z-50 ring-4 ring-rose-500/20" : "bg-slate-800 border-slate-600")}
                >
                  <div className={clsx("absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap border border-slate-700 shadow-xl z-50 pointer-events-none transition-opacity", (selectedNode?.id === node.id || !isMobile) ? "opacity-100" : "opacity-0")}>{node.title}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Inspector Panel */}
      <div className={clsx("bg-white shadow-2xl flex flex-col transition-all duration-300 ease-out z-[100]", isMobile ? "fixed bottom-0 left-0 right-0 rounded-t-[2rem] border-t border-rose-100" : "absolute right-4 top-4 bottom-4 w-80 rounded-[2rem] border border-rose-100 p-6 animate-in slide-in-from-right-4", (isMobile && !selectedNode) ? "translate-y-[120%]" : "translate-y-0")} style={isMobile ? { maxHeight: '50vh' } : {}}>
        {selectedNode && (
          <div className="p-6 h-full flex flex-col">
            {isMobile && <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />}
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{selectedNode.category}</div>
                <h2 className="text-xl font-bold text-rose-950 my-1 leading-tight line-clamp-2">{selectedNode.title}</h2>
              </div>
              {isMobile && <button onClick={() => setSelectedNode(null)} className="p-1 bg-slate-100 rounded-full text-slate-400"><X size={16} /></button>}
            </div>
            <div className="text-xs text-slate-500 leading-relaxed my-4 line-clamp-4 bg-slate-50 p-3 rounded-xl border border-rose-50/50">{selectedNode.body || <span className="italic opacity-50">No details...</span>}</div>
            <button onClick={() => { setActiveNoteId(selectedNode.id); setView('notes'); }} className="mt-auto w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2">Open Full Note <ArrowRightCircle size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MOBILE HELPER & NAV ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

const MobileNav = ({ view, setView }) => {
  const navItems = [
    { id: 'projects', icon: Rocket, label: 'Projects' },
    { id: 'ideas', icon: Lightbulb, label: 'Ideas' },
    { id: 'timer', icon: TimerIcon, label: 'Focus' },
    { id: 'notes', icon: Book, label: 'Notes' },
    { id: 'graph', icon: Share2, label: 'Graph' },
  ];
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-rose-100 p-2 pb-6 z-[100] flex justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {navItems.map(item => (
        <button key={item.id} onClick={() => setView(item.id)} className={clsx("flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16", view === item.id ? "text-rose-500 bg-rose-50" : "text-slate-400 hover:text-slate-600")}>
          <item.icon size={20} strokeWidth={view === item.id ? 3 : 2} />
          <span className="text-[9px] font-bold uppercase tracking-wide">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- DATA HOOK ---
const useStickyState = (defaultValue, key, userId) => {
  const specificKey = `${userId}-${key}`;
  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(specificKey);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  useEffect(() => { window.localStorage.setItem(specificKey, JSON.stringify(value)); }, [specificKey, value]);
  return [value, setValue];
};

const LoginView = ({ onLogin }) => {
  const [name, setName] = useState("");
  return (
    <div className="h-screen bg-[#fff5f7] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-rose-200 selection:text-rose-900">
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-200/40 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <div className="mb-6 p-4 bg-white rounded-full shadow-xl shadow-rose-100/50 text-rose-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-rose-950 tracking-tight">Welcome Back</h1>
        <p className="text-rose-400 mb-10 text-sm font-medium uppercase tracking-widest opacity-80">Who is focusing today?</p>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && name.trim() && onLogin(name)} placeholder="Your Name..." className="w-80 bg-white border-2 border-rose-100 text-rose-900 text-center text-xl font-bold placeholder:text-rose-200 rounded-3xl py-5 px-6 outline-none focus:border-rose-300 focus:shadow-xl focus:shadow-rose-200/40 transition-all duration-300" />
        <button onClick={() => name.trim() && onLogin(name)} disabled={!name.trim()} className="mt-8 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-2xl shadow-xl shadow-rose-300/40 transition-all active:scale-95 flex items-center gap-2">Enter Workspace <ArrowRightCircle size={16} /></button>
      </div>
      <div className="absolute bottom-8 text-rose-300/50 text-xs font-bold uppercase tracking-widest">Productivity OS • v2.0</div>
    </div>
  );
};

// --- APP LAYOUT ---
function Dashboard({ currentUser, onLogout }) {
  const [view, setView] = useState('timer');
  const isMobile = useIsMobile();

  const timerState = usePomodoro();
  const [categories, setCategories] = useStickyState(["General", "Personal"], "pomodoro-categories", currentUser);
  const [tasks, setTasks] = useStickyState([], "pomodoro-tasks", currentUser);
  const [note, setNote] = useStickyState("", "pomodoro-daily-note", currentUser);
  const [notes, setNotes] = useStickyState([], "pomodoro-notes-library", currentUser);
  const [projects, setProjects] = useStickyState([], "pomodoro-projects", currentUser);
  const [ideas, setIdeas] = useStickyState([], "pomodoro-ideas", currentUser);
  const [activeNoteId, setActiveNoteId] = useState(null);

  return (
    <div className="flex h-screen w-full bg-[#fff5f7] p-4 md:p-8 gap-8 relative overflow-hidden font-sans selection:bg-rose-200 selection:text-rose-900">
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-200/40 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px] pointer-events-none" />

      {!isMobile && (
        <aside className="w-24 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-sm flex flex-col items-center py-8 z-50">
          <div className="mb-8 p-3 bg-rose-100 text-rose-500 rounded-2xl"><TimerIcon size={24} /></div>
          <nav className="flex-1 flex flex-col gap-6 w-full px-4">
            {[
              { id: 'timer', icon: TimerIcon },
              { id: 'projects', icon: Rocket },
              { id: 'ideas', icon: Lightbulb },
              { id: 'notes', icon: Book },
              { id: 'graph', icon: Share2 }
            ].map(item => (
              <button key={item.id} onClick={() => setView(item.id)} className={clsx("p-3 rounded-xl transition-all", view === item.id ? "bg-rose-50 text-rose-500 shadow-sm" : "text-slate-400 hover:bg-white hover:text-rose-400")}>
                <item.icon size={20} />
              </button>
            ))}
          </nav>
          <button onClick={onLogout} className="mt-auto p-3 text-slate-300 hover:text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={20} /></button>
        </aside>
      )}

      <main className={clsx("flex-1 relative z-10 flex flex-col min-h-0", isMobile && "pb-20")}>
        {isMobile && (
          <div className="flex justify-between items-center mb-4 px-2">
            <h1 className="text-xl font-bold text-rose-950 capitalize flex items-center gap-2">
              {view === 'timer' && <><TimerIcon size={20} /> Focus</>}
              {view === 'projects' && <><Rocket size={20} /> Projects</>}
              {view === 'ideas' && <><Lightbulb size={20} /> Ideas</>}
              {view === 'notes' && <><Book size={20} /> Notes</>}
              {view === 'graph' && <><Share2 size={20} /> Graph</>}
            </h1>
            <button onClick={onLogout} className="text-[10px] font-bold text-rose-400 bg-white px-3 py-1.5 rounded-full border border-rose-100 shadow-sm">Log Out</button>
          </div>
        )}

        {view === 'timer' && <TimerView state={timerState} tasks={tasks} setTasks={setTasks} note={note} setNote={setNote} />}
        {view === 'projects' && <ProjectsView projects={projects} setProjects={setProjects} />}
        {view === 'ideas' && <IdeasView ideas={ideas} setIdeas={setIdeas} categories={categories} setCategories={setCategories} projects={projects} setProjects={setProjects} />}
        {view === 'notes' && <NotesView notes={notes} setNotes={setNotes} categories={categories} setCategories={setCategories} activeNoteId={activeNoteId} setActiveNoteId={setActiveNoteId} isMobile={isMobile} />}
        {view === 'graph' && <GraphView notes={notes} setNotes={setNotes} activeNoteId={activeNoteId} setActiveNoteId={setActiveNoteId} setView={setView} isMobile={isMobile} />}
      </main>

      {isMobile && <MobileNav view={view} setView={setView} />}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => window.localStorage.getItem("last-user") || null);
  const handleLogin = (username) => { setUser(username); window.localStorage.setItem("last-user", username); };
  const handleLogout = () => { setUser(null); window.localStorage.removeItem("last-user"); };
  if (!user) return <LoginView onLogin={handleLogin} />;
  return <Dashboard key={user} currentUser={user} onLogout={handleLogout} />;
}

export default App;