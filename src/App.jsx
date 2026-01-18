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

// --- HOOKS ---
const usePomodoro = () => {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  const modes = {
    focus: { label: 'Focus', time: 25 * 60, color: 'text-rose-600' },
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return { mode, modes, timeLeft, isActive, cycles, toggleTimer, resetTimer, switchMode, formatTime };
};

// --- VIEWS ---

// 1. TIMER VIEW (Refined & Centered)
const TimerView = ({ timerState }) => {
  const { mode, modes, timeLeft, isActive, cycles, toggleTimer, resetTimer, switchMode, formatTime } = timerState;

  return (
    <div className="flex flex-col items-center animate-in fade-in duration-700 w-full max-w-sm mx-auto">
      {/* Mode Tabs */}
      <div className="flex bg-rose-100/50 p-1.5 rounded-full mb-10 shadow-inner">
        {Object.keys(modes).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              "px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300",
              mode === m
                ? "bg-white text-rose-600 shadow-sm transform scale-105"
                : "text-rose-400 hover:text-rose-500"
            )}
          >
            {modes[m].label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative mb-10 text-center">
        <div className="text-[7rem] leading-none font-mono font-bold tracking-tighter text-rose-950/90 tabular-nums select-none drop-shadow-sm">
          {formatTime(timeLeft)}
        </div>
        <p className="text-rose-400 font-medium mt-2 tracking-widest uppercase text-xs opacity-60">
          {isActive ? 'Staying Focused' : 'Ready to Start'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mb-8">
        <button
          onClick={toggleTimer}
          className={cn(
            "w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-rose-200/50 transition-all hover:scale-105 active:scale-95",
            isActive ? "bg-rose-400" : "bg-rose-500"
          )}
        >
          {isActive ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" className="ml-1" size={28} />}
        </button>

        <button
          onClick={resetTimer}
          className="w-14 h-14 rounded-2xl bg-white border-2 border-rose-50 text-rose-300 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors shadow-sm"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Session Counter */}
      <div className="bg-white/60 px-4 py-2 rounded-full border border-rose-100/50 flex items-center gap-2 text-rose-900/40 text-xs font-bold">
        <CheckCircle2 size={14} />
        <span>{cycles} SESSIONS DONE</span>
      </div>
    </div>
  );
};

// 2. TASKS VIEW (Fully Functional)
const TasksView = ({ tasks, setTasks }) => {
  const [inputValue, setInputValue] = useState("");

  const addTask = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      setTasks([...tasks, { id: Date.now(), text: inputValue, done: false }]);
      setInputValue("");
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="w-full max-w-sm mx-auto h-[400px] flex flex-col animate-in slide-in-from-right-8 duration-500">
      <h2 className="text-2xl font-bold text-rose-950 mb-6 text-center">Focus Tasks</h2>

      {/* Input */}
      <div className="relative mb-6 group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={addTask}
          placeholder="What needs to be done?"
          className="w-full bg-white px-5 py-4 rounded-2xl border-2 border-rose-50 outline-none text-rose-900 placeholder:text-rose-300 focus:border-rose-200 focus:shadow-lg focus:shadow-rose-100/50 transition-all"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-200 group-focus-within:text-rose-400">
          <Plus size={20} />
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {tasks.length === 0 && (
          <div className="text-center text-rose-300/50 mt-10 text-sm">No tasks yet. Stay focused!</div>
        )}

        {tasks.map(task => (
          <div key={task.id} className="group flex items-center gap-3 bg-white/40 hover:bg-white p-3 rounded-xl transition-all border border-transparent hover:border-rose-100 hover:shadow-sm">
            <button
              onClick={() => toggleTask(task.id)}
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                task.done ? "bg-rose-400 border-rose-400" : "border-rose-200 hover:border-rose-300"
              )}
            >
              {task.done && <Check size={12} className="text-white" />}
            </button>
            <span className={cn("flex-1 text-sm text-rose-900 font-medium transition-opacity", task.done && "line-through opacity-40")}>
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-rose-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. PLAN VIEW (Goals & Notes)
const PlanView = ({ note, setNote }) => {
  return (
    <div className="w-full max-w-sm mx-auto h-[400px] flex flex-col animate-in slide-in-from-right-8 duration-500">
      <h2 className="text-2xl font-bold text-rose-950 mb-6 text-center">Daily Plan</h2>

      <div className="flex-1 bg-white p-6 rounded-3xl border-2 border-rose-50 shadow-sm relative overflow-hidden group">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What is your main intention for today?&#10;&#10;• Morning: ...&#10;• Afternoon: ...&#10;• Evening: ..."
          className="w-full h-full resize-none outline-none text-rose-900 placeholder:text-rose-300/50 bg-transparent text-sm leading-relaxed"
        />
        <div className="absolute bottom-4 right-4 text-rose-200 pointer-events-none">
          <Calendar size={20} />
        </div>
      </div>
      <p className="text-center text-rose-300 text-[10px] mt-4 font-medium uppercase tracking-widest">
        Design your day
      </p>
    </div>
  );
};

// --- UPGRADED IDEAS VIEW (Split Screen) ---
const IdeasView = ({ ideas, setIdeas, categories, setCategories, projects, setProjects }) => {
  const [activeId, setActiveId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Category Logic
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [selectedCat, setSelectedCat] = useState(categories[0] || "General");

  const activeIdea = ideas.find(i => i.id === activeId);

  // --- ACTIONS ---
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
    setActiveId(newIdea.id); // Auto-select the new idea
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
        notes: activeIdea.body // Transfer notes too!
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

  // Filter Logic
  const filteredIdeas = ideas
    .filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.category.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (b.isPinned === a.isPinned) ? 0 : b.isPinned ? 1 : -1);

  return (
    <div className="w-full h-[600px] flex gap-6 animate-in slide-in-from-right-8 duration-500">

      {/* --- LEFT COLUMN: SIDEBAR LIST --- */}
      <div className="w-1/3 flex flex-col gap-4">

        {/* Header & Search */}
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

        {/* Quick Add Box */}
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
          {/* Mini Dropdown */}
          <div className="flex items-center gap-2">
            {!isAddingCat ? (
              <div className="relative group w-full">
                <select
                  value={selectedCat}
                  onChange={(e) => e.target.value === 'ADD_NEW' ? setIsAddingCat(true) : setSelectedCat(e.target.value)}
                  className="w-full appearance-none bg-rose-50 text-rose-500 text-[10px] font-bold px-2 py-1.5 rounded-lg outline-none cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="ADD_NEW">+ New...</option>
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

        {/* The List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
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
                {idea.body || "No additional details..."}
              </div>

              {/* Hover Actions */}
              <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => togglePin(e, idea.id)} className="p-1 hover:bg-amber-50 rounded text-slate-300 hover:text-amber-500"><Pin size={12} /></button>
                <button onClick={(e) => deleteIdea(e, idea.id)} className="p-1 hover:bg-red-50 rounded text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT COLUMN: EDITOR CANVAS --- */}
      <div className="w-2/3 bg-white rounded-[2rem] border border-rose-100 shadow-sm p-8 flex flex-col relative overflow-hidden">
        {activeIdea ? (
          <>
            {/* Toolbar */}
            <div className="flex justify-between items-start mb-6 border-b border-rose-50 pb-4">
              <div>
                <input
                  value={activeIdea.title}
                  onChange={e => updateIdea(activeIdea.id, 'title', e.target.value)}
                  className="text-2xl font-bold text-rose-950 bg-transparent outline-none placeholder:text-rose-200 w-full"
                  placeholder="Untitled Idea"
                />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md font-semibold">{activeIdea.category}</span>
                  <span className="text-[10px] text-slate-300">Edited just now</span>
                </div>
              </div>

              <button
                onClick={promoteToProject}
                className="flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition-all active:scale-95"
              >
                <Rocket size={14} /> Promote to Project
              </button>
            </div>

            {/* Main Text Area */}
            <textarea
              value={activeIdea.body}
              onChange={e => updateIdea(activeIdea.id, 'body', e.target.value)}
              placeholder="Start typing your master plan..."
              className="flex-1 w-full resize-none bg-transparent outline-none text-base text-slate-600 leading-relaxed custom-scrollbar font-medium"
            />

            {/* Footer / Connections */}
            <div className="mt-4 pt-4 border-t border-rose-50 flex items-center gap-2 text-slate-300">
              <LinkIcon size={14} />
              <span className="text-xs">Linked to:</span>
              {/* You can add your Connection Bubbles here if you want to keep that feature */}
              <button className="text-[10px] border border-dashed border-slate-300 px-2 py-1 rounded-full hover:border-rose-400 hover:text-rose-400 transition-colors">
                + Add Connection
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-rose-200 opacity-50">
            <Lightbulb size={64} className="mb-4 text-rose-100" />
            <p className="text-lg font-bold">Select an idea to expand it</p>
          </div>
        )}
      </div>

    </div>
  );
};

// --- UPGRADED PROJECT WORKSPACE ---
const ProjectsView = ({ projects, setProjects }) => {
  const [activeId, setActiveId] = useState(null); // ID of the project we are working on
  const [newProjName, setNewProjName] = useState("");
  const [newStep, setNewStep] = useState(""); // For adding sub-tasks

  // Helper to update specific project fields
  const updateProject = (id, field, value) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const activeProject = projects.find(p => p.id === activeId);

  // --- LOGIC: SUB-TASKS ---
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

    // Auto-calculate Progress % based on tasks done!
    const doneCount = updatedSteps.filter(s => s.done).length;
    const progress = Math.round((doneCount / updatedSteps.length) * 100);
    updateProject(activeId, 'progress', progress);
  };

  const deleteStep = (stepId) => {
    const currentSteps = activeProject.steps || [];
    updateProject(activeId, 'steps', currentSteps.filter(s => s.id !== stepId));
  };

  // --- LOGIC: CREATE PROJECT ---
  const addProject = () => {
    if (!newProjName.trim()) return;
    setProjects([...projects, {
      id: Date.now(),
      title: newProjName,
      status: "Planning",
      deadline: "",
      progress: 0,
      steps: [], // Start with empty steps
      notes: ""  // Start with empty notes
    }]);
    setNewProjName("");
  };

  return (
    <div className="w-full h-[600px] flex flex-col animate-in slide-in-from-right-8 duration-500">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-rose-950 flex items-center gap-2">
          <Layout className="text-rose-400" size={24} />
          {activeProject ? activeProject.title : "Project Dashboard"}
        </h2>
        {activeProject && (
          <button onClick={() => setActiveId(null)} className="text-xs bg-rose-50 text-rose-500 px-3 py-1 rounded-full border border-rose-100 hover:bg-rose-100">
            ← Back to Board
          </button>
        )}
      </div>

      {/* VIEW 1: THE DASHBOARD (Table) */}
      {!activeProject ? (
        <div className="flex-1 bg-white/40 border border-white rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col backdrop-blur-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 text-[10px] uppercase font-bold text-slate-400 px-4 mb-3">
            <div className="col-span-5">Project Name</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Deadline</div>
            <div className="col-span-2 text-right">Progress</div>
          </div>

          {/* Table Rows */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {projects.map(p => (
              <div
                key={p.id}
                onClick={() => setActiveId(p.id)} // Click row to open details
                className="grid grid-cols-12 gap-4 items-center bg-white border border-rose-50 p-4 rounded-xl cursor-pointer hover:border-rose-300 hover:shadow-md transition-all group"
              >
                <div className="col-span-5 font-bold text-rose-900 flex items-center gap-2">
                  <Rocket size={16} className="text-rose-300" />
                  {p.title}
                </div>

                <div className="col-span-2">
                  <span className={cn("text-[10px] px-2 py-1 rounded-full font-bold uppercase",
                    p.status === 'Active' ? "bg-emerald-100 text-emerald-600" :
                      p.status === 'Done' ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-600"
                  )}>
                    {p.status}
                  </span>
                </div>

                <div className="col-span-3 text-xs text-slate-500 font-mono">
                  {p.deadline || "--/--/--"}
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

          {/* Quick Add Row */}
          <div className="mt-4 flex items-center gap-2 bg-white p-2 rounded-xl border border-dashed border-rose-200">
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
        /* VIEW 2: THE ACTIVE WORKSPACE (Deep Work Mode) */
        <div className="flex-1 flex gap-6 overflow-hidden">

          {/* Left Col: Steps & Tasks */}
          <div className="flex-1 bg-white rounded-3xl border border-rose-100 p-6 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-rose-950 flex items-center gap-2">
                <ListTodo size={18} className="text-rose-400" /> Action Plan
              </h3>
              <span className="text-xs text-rose-400 font-mono bg-rose-50 px-2 py-1 rounded-lg">
                {(activeProject.steps || []).filter(s => s.done).length} / {(activeProject.steps || []).length} DONE
              </span>
            </div>

            {/* Step Input */}
            <div className="flex gap-2 mb-4">
              <input
                value={newStep} onChange={e => setNewStep(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addStep()}
                placeholder="Next step? (e.g. 'Create Repo')"
                className="flex-1 bg-rose-50/50 border border-rose-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-rose-300"
              />
              <button onClick={addStep} className="bg-rose-500 text-white px-3 rounded-xl hover:bg-rose-600"><Plus size={18} /></button>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {(activeProject.steps || []).length === 0 && (
                <div className="text-center text-rose-200 text-xs italic mt-10">No steps yet. Break it down!</div>
              )}
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

          {/* Right Col: Context & Meta */}
          <div className="w-1/3 flex flex-col gap-4">

            {/* Status Card */}
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

            {/* Notes Card */}
            <div className="flex-1 bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex flex-col">
              <label className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-2 block">Project Notes</label>
              <textarea
                value={activeProject.notes || ""}
                onChange={(e) => updateProject(activeId, 'notes', e.target.value)}
                placeholder="Links, ideas, or quick specs..."
                className="flex-1 w-full resize-none bg-transparent outline-none text-sm text-slate-600 leading-relaxed custom-scrollbar"
              />
            </div>

            {/* Danger Zone */}
            <button
              onClick={() => {
                if (confirm("Delete this project?")) {
                  setProjects(projects.filter(p => p.id !== activeId));
                  setActiveId(null);
                }
              }}
              className="w-full py-3 rounded-2xl border border-red-100 text-red-400 hover:bg-red-50 text-xs font-bold transition-colors"
            >
              Delete Project
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: NOTES VIEW (Mobile Responsive) ---
const NotesView = ({ notes, setNotes, categories, setCategories, activeNoteId, setActiveNoteId, isMobile }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [linkSearch, setLinkSearch] = useState("");

  // Category Creation State
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
      links: [activeNote.id]
    };
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

  // --- MOBILE LOGIC ---
  const showList = !isMobile || (isMobile && !activeNoteId);
  const showEditor = !isMobile || (isMobile && activeNoteId);

  return (
    <div className={clsx("w-full h-full flex gap-6 animate-in fade-in duration-500", !isMobile && "pb-24")}>

      {/* 1. LIST SIDEBAR (Shows on Desktop OR Mobile-List-View) */}
      {showList && (
        <div className={clsx("flex flex-col gap-4", isMobile ? "w-full" : "w-64")}>
          {!isMobile && (
            <div className="flex items-center gap-2 px-2 text-rose-950/50">
              <Book size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Library</span>
            </div>
          )}

          {/* Category Filters */}
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

          {/* Note List */}
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

      {/* 2. EDITOR (Shows on Desktop OR Mobile-Detail-View) */}
      {showEditor && (
        <div className={clsx("flex-1 bg-white rounded-[2rem] border border-rose-100 shadow-sm p-6 flex gap-8 overflow-hidden relative", isMobile && "fixed inset-0 z-[200] rounded-none p-4")}>

          {/* MOBILE BACK BUTTON */}
          {isMobile && (
            <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
              <button onClick={() => setActiveNoteId(null)} className="bg-rose-50 text-rose-500 p-2 rounded-full hover:bg-rose-100 border border-rose-100 shadow-sm">
                <ArrowLeft size={20} />
              </button>
            </div>
          )}

          {activeNote ? (
            <>
              <div className={clsx("flex-1 flex flex-col h-full", isMobile && "mt-12")}>
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
                      <button onClick={() => setIsCreatingCat(false)} className="text-rose-400 hover:bg-rose-50 p-1 rounded"><X size={12} /></button>
                    </div>
                  ) : (
                    <div className="relative group">
                      <select
                        value={activeNote.category}
                        onChange={handleCategoryChange}
                        className="appearance-none bg-rose-50 hover:bg-rose-100 text-rose-500 px-3 py-1 rounded-md font-bold cursor-pointer outline-none transition-colors pr-6"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        <option disabled>──────────</option>
                        <option value="ADD_NEW_CAT_OPTION">+ Create New...</option>
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

              {/* Right Panel: Connections (Hidden on Mobile to save space, or stacked) */}
              {!isMobile && (
                <div className="w-64 border-l border-rose-50 pl-6 flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-950 mb-4">
                    <LinkIcon size={14} className="text-rose-400" /> Connections
                  </div>
                  <button onClick={createSonNote} className="w-full mb-4 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                    <Rocket size={12} /> Create Child Note
                  </button>
                  <div className="relative mb-2">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-rose-300" />
                    <input value={linkSearch} onChange={e => setLinkSearch(e.target.value)} placeholder="Link to..." className="w-full pl-7 pr-2 py-1.5 bg-slate-50 border border-transparent focus:border-rose-200 rounded-lg text-[10px] outline-none transition-all" />
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                    {notes
                      .filter(n => n.id !== activeNote.id)
                      .filter(n => n.title.toLowerCase().includes(linkSearch.toLowerCase()))
                      .map(other => {
                        const isLinked = (activeNote.links || []).includes(other.id);
                        return (
                          <button key={other.id} onClick={() => toggleLink(other.id)} className={clsx("w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between", isLinked ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-slate-50 text-slate-500 border border-transparent hover:bg-rose-50")}>
                            <span className="truncate">{other.title || "Untitled"}</span>
                            {isLinked && <Check size={12} />}
                          </button>
                        );
                      })
                    }
                  </div>
                </div>
              )}
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


// --- COMPONENT: GRAPH VIEW (Fixed Visual Alignment & Safe Mode) ---
const GraphView = ({ notes = [], setNotes, activeNoteId, setActiveNoteId, setView }) => {
  // 1. Direct DOM Access
  const nodeRefs = useRef({});
  const linkRefs = useRef({});
  const containerRef = useRef(null);

  // Physics State
  const simulationNodes = useRef([]);
  const requestRef = useRef();

  // Viewport State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [selectedNode, setSelectedNode] = useState(null);
  const dragRef = useRef({ active: false, type: null, startX: 0, startY: 0, nodeId: null });

  // 2. Data Sync
  useEffect(() => {
    const safeNotes = Array.isArray(notes) ? notes : [];

    simulationNodes.current = safeNotes.map(note => {
      const existing = simulationNodes.current.find(n => n.id === note.id);
      return existing
        ? { ...existing, ...note }
        : {
          ...note,
          x: Math.random() * 200 - 100,
          y: Math.random() * 200 - 100,
          vx: 0, vy: 0
        };
    });
  }, [notes]);

  // 3. Physics Engine
  useEffect(() => {
    const tick = () => {
      const nodes = simulationNodes.current;
      if (!nodes) return;

      // --- SETTINGS ---
      const REPULSION = 6000;
      const SPRING_LEN = 120;
      const SPRING_K = 0.005;
      const CENTER_GRAVITY = 0.0005;
      const DAMPING = 0.88;

      // PHASE 1: MATH
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (dragRef.current.active && dragRef.current.type === 'NODE' && dragRef.current.nodeId === node.id) continue;

        // Center Gravity
        node.vx -= node.x * CENTER_GRAVITY;
        node.vy -= node.y * CENTER_GRAVITY;

        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          // Repulsion
          if (dist < 500) {
            const force = REPULSION / (dist * dist);
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          }

          // Attraction
          if (node.category === other.category) {
            node.vx -= dx * 0.0005;
            node.vy -= dy * 0.0005;
          }
        }

        // Links
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

      // PHASE 2: UPDATE DOM
      nodes.forEach(node => {
        // Apply Velocity
        if (!dragRef.current.active || dragRef.current.nodeId !== node.id) {
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= DAMPING;
          node.vy *= DAMPING;
        }

        // Move Node Element
        const nodeEl = nodeRefs.current[node.id];
        if (nodeEl) {
          const size = Math.min(80, 24 + ((node.links?.length || 0) * 8));
          // transform-origin is top-left, so we subtract size/2 to center it
          nodeEl.style.transform = `translate3d(${node.x - size / 2}px, ${node.y - size / 2}px, 0)`;
        }

        // Move Lines
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
  }, []);

  // --- HANDLERS ---
  const handleWheel = (e) => {
    const zoomSensitivity = 0.001;
    const newScale = Math.max(0.1, Math.min(3, transform.scale - e.deltaY * zoomSensitivity));
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleMouseDown = (e, node = null) => {
    e.stopPropagation();
    if (node) {
      dragRef.current = { active: true, type: 'NODE', startX: e.clientX, startY: e.clientY, nodeId: node.id };
      setSelectedNode(node);
    } else {
      if (e.target.tagName !== 'DIV' && e.target.tagName !== 'svg') return;
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

        // Direct update
        node.x = (e.clientX - rect.left - centerX - transform.x) / transform.scale;
        node.y = (e.clientY - rect.top - centerY - transform.y) / transform.scale;
        node.vx = 0; node.vy = 0;
      }
    }
  };

  const handleMouseUp = () => {
    dragRef.current.active = false;
  };

  // Safety return
  if (!notes) return null;

  return (
    <div className="w-full h-full flex gap-4 animate-in fade-in duration-700">

      {/* CANVAS */}
      <div className="flex-1 bg-slate-900 rounded-[2rem] overflow-hidden relative border border-slate-800 shadow-2xl select-none flex items-center justify-center">

        {/* HUD */}
        <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-xl">
          <button onClick={() => setTransform(t => ({ ...t, scale: t.scale + 0.2 }))} className="p-2 text-white hover:bg-slate-700 rounded-lg"><Plus size={16} /></button>
          <button onClick={() => setTransform(t => ({ ...t, scale: Math.max(0.1, t.scale - 0.2) }))} className="p-2 text-white hover:bg-slate-700 rounded-lg flex items-center justify-center h-8 w-8 font-bold">-</button>
          <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="p-2 text-rose-400 hover:bg-slate-700 rounded-lg"><RotateCcw size={16} /></button>
        </div>

        {/* INTERACTIVE AREA */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={(e) => handleMouseDown(e, null)}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        >
          <div style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: 'center center'
          }} className="relative w-0 h-0 flex items-center justify-center">

            {/* LINES */}
            <svg className="overflow-visible absolute top-0 left-0 pointer-events-none">
              {notes.map(node => (
                (Array.isArray(node.links) ? node.links : []).map(linkId => (
                  <line
                    key={`${node.id}-${linkId}`}
                    ref={el => linkRefs.current[`${node.id}-${linkId}`] = el}
                    stroke="white"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                  />
                ))
              ))}
            </svg>

            {/* NODES */}
            {notes.map(node => {
              const linkCount = Array.isArray(node.links) ? node.links.length : 0;
              const size = Math.min(80, 24 + (linkCount * 8));

              return (
                <div
                  key={node.id}
                  ref={el => nodeRefs.current[node.id] = el}
                  onMouseDown={(e) => handleMouseDown(e, node)}
                  onDoubleClick={(e) => { e.stopPropagation(); setActiveNoteId(node.id); setView('notes'); }}
                  style={{ width: size, height: size }}
                  className={cn(
                    // FIX: Added 'left-0 top-0' to prevent flexbox double-centering
                    "absolute left-0 top-0 rounded-full flex items-center justify-center border shadow-[0_0_20px_rgba(0,0,0,0.3)] cursor-pointer hover:scale-110 transition-colors duration-200",
                    selectedNode?.id === node.id
                      ? "bg-rose-500 border-rose-300 z-50 ring-4 ring-rose-500/20"
                      : "bg-slate-800 border-slate-600 hover:bg-slate-700"
                  )}
                >
                  <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700 shadow-xl z-50">
                    {node.title}
                  </div>
                </div>
              )
            })}

          </div>
        </div>
      </div>

      {/* INSPECTOR */}
      <div className="w-80 bg-white rounded-[2rem] border border-rose-100 shadow-sm p-6 flex flex-col animate-in slide-in-from-right-4 duration-500">
        {selectedNode ? (
          <>
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{selectedNode.category}</div>
            <h2 className="text-xl font-bold text-rose-950 my-2 leading-tight">{selectedNode.title}</h2>
            <div className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-6 bg-slate-50 p-3 rounded-xl border border-rose-50/50">
              {selectedNode.body || <span className="italic opacity-50">No additional details...</span>}
            </div>
            <button
              onClick={() => { setActiveNoteId(selectedNode.id); setView('notes'); }}
              className="mt-4 w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Open Full Note <ArrowRightCircle size={14} />
            </button>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-rose-200 opacity-60">
            <Share2 size={48} className="mb-4" />
            <div className="text-xs font-bold uppercase tracking-widest text-center">Select a node<br />to preview</div>
          </div>
        )}
      </div>

    </div>
  );
};

// --- MAIN NAV COMPONENT ---
const NavBar = ({ currentView, setView }) => {
  const navItems = [
    { id: 'ideas', icon: Lightbulb, label: 'Ideas' },
    { id: 'projects', icon: Rocket, label: 'Projects' },
    { id: 'timer', icon: TimerIcon, label: 'Focus' },
    { id: 'todo', icon: ListTodo, label: 'Tasks' },
    { id: 'plan', icon: Calendar, label: 'Plan' },
    { id: 'notes', icon: Book, label: 'Notes' },
    { id: 'graph', icon: Share2, label: 'Graph' }, // <--- Add this line
  ];
  // ... rest of NavBar code

  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-rose-100 p-2 rounded-full shadow-2xl shadow-rose-900/5 z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={cn(
            "relative px-6 py-3 rounded-full flex items-center justify-center transition-all duration-300 ease-out",
            currentView === item.id
              ? "bg-rose-100 text-rose-600"
              : "text-slate-400 hover:text-rose-400 hover:bg-rose-50"
          )}
        >
          <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
          {currentView === item.id && (
            <span className="ml-2 text-xs font-bold animate-in fade-in zoom-in duration-300">
              {item.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// --- UPDATED HOOK: USER STORAGE ---
const useStickyState = (defaultValue, key, userId) => {
  // We prefix the key with the userId (e.g., "john-pomodoro-tasks")
  const specificKey = `${userId}-${key}`;

  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(specificKey);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(specificKey, JSON.stringify(value));
  }, [specificKey, value]);

  return [value, setValue];
};

const LoginView = ({ onLogin }) => {
  const [name, setName] = useState("");

  return (
    <div className="h-screen bg-[#fff5f7] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-rose-200 selection:text-rose-900">

      {/* 1. Background Ambience (Matches Main App) */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-200/40 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px] pointer-events-none" />

      {/* 2. Login Card */}
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">

        {/* Icon */}
        <div className="mb-6 p-4 bg-white rounded-full shadow-xl shadow-rose-100/50 text-rose-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold mb-2 text-rose-950 tracking-tight">Welcome Back</h1>
        <p className="text-rose-400 mb-10 text-sm font-medium uppercase tracking-widest opacity-80">Who is focusing today?</p>

        <div className="group relative">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onLogin(name)}
            placeholder="Your Name..."
            className="w-80 bg-white border-2 border-rose-100 text-rose-900 text-center text-xl font-bold placeholder:text-rose-200 rounded-3xl py-5 px-6 outline-none focus:border-rose-300 focus:shadow-xl focus:shadow-rose-200/40 transition-all duration-300"
          />
        </div>

        <button
          onClick={() => name.trim() && onLogin(name)}
          disabled={!name.trim()}
          className="mt-8 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-2xl shadow-xl shadow-rose-300/40 transition-all active:scale-95 flex items-center gap-2"
        >
          Enter Workspace
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-8 text-rose-300/50 text-xs font-bold uppercase tracking-widest">
        Productivity OS • v2.0
      </div>

    </div>
  );
};

// --- MOBILE HELPER: Detect Screen Size ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

// --- COMPONENT: MOBILE BOTTOM NAV ---
const MobileNav = ({ view, setView }) => {
  const navItems = [
    { id: 'timer', icon: TimerIcon, label: 'Focus' },
    { id: 'notes', icon: Book, label: 'Notes' },
    { id: 'graph', icon: Share2, label: 'Graph' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-rose-100 p-2 pb-6 z-[100] flex justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={clsx(
            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20",
            view === item.id
              ? "text-rose-500 bg-rose-50"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          <item.icon size={20} strokeWidth={view === item.id ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- APP LAYOUT ---
function Dashboard({ currentUser, onLogout }) {
  const [view, setView] = useState('timer');
  const isMobile = useIsMobile(); // <--- Detects Mobile

  // STATE MANAGEMENT
  const timerState = usePomodoro();
  const [categories, setCategories] = useStickyState(["General", "Personal"], "pomodoro-categories", currentUser);
  const [tasks, setTasks] = useStickyState([], "pomodoro-tasks", currentUser);
  const [note, setNote] = useStickyState("", "pomodoro-daily-note", currentUser);
  const [notes, setNotes] = useStickyState([], "pomodoro-notes-library", currentUser);
  const [activeNoteId, setActiveNoteId] = useState(null);

  return (
    <div className="flex h-screen w-full bg-[#fff5f7] p-4 md:p-8 gap-8 relative overflow-hidden font-sans selection:bg-rose-200 selection:text-rose-900">

      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-200/40 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px] pointer-events-none" />

      {/* 1. DESKTOP SIDEBAR (Hidden on Mobile) */}
      {!isMobile && (
        <aside className="w-24 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-sm flex flex-col items-center py-8 z-50">
          <div className="mb-8 p-3 bg-rose-100 text-rose-500 rounded-2xl">
            <TimerIcon size={24} />
          </div>

          <nav className="flex-1 flex flex-col gap-6 w-full px-4">
            <button onClick={() => setView('timer')} className={clsx("p-3 rounded-xl transition-all", view === 'timer' ? "bg-rose-50 text-rose-500 shadow-sm" : "text-slate-400 hover:bg-white hover:text-rose-400")}>
              <TimerIcon size={20} />
            </button>
            <button onClick={() => setView('notes')} className={clsx("p-3 rounded-xl transition-all", view === 'notes' ? "bg-rose-50 text-rose-500 shadow-sm" : "text-slate-400 hover:bg-white hover:text-rose-400")}>
              <Book size={20} />
            </button>
            <button onClick={() => setView('graph')} className={clsx("p-3 rounded-xl transition-all", view === 'graph' ? "bg-rose-50 text-rose-500 shadow-sm" : "text-slate-400 hover:bg-white hover:text-rose-400")}>
              <Share2 size={20} />
            </button>
          </nav>

          <button onClick={onLogout} className="mt-auto p-3 text-slate-300 hover:text-rose-400 hover:bg-rose-50 rounded-xl transition-all">
            <Trash2 size={20} />
          </button>
        </aside>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <main className={clsx("flex-1 relative z-10 flex flex-col min-h-0", isMobile && "pb-20")}>

        {/* Mobile Header */}
        {isMobile && (
          <div className="flex justify-between items-center mb-4 px-2">
            <h1 className="text-xl font-bold text-rose-950 capitalize flex items-center gap-2">
              {view === 'timer' && <><TimerIcon size={20} /> Focus</>}
              {view === 'notes' && <><Book size={20} /> Notes</>}
              {view === 'graph' && <><Share2 size={20} /> Graph</>}
            </h1>
            <button onClick={onLogout} className="text-[10px] font-bold text-rose-400 bg-white px-3 py-1.5 rounded-full border border-rose-100 shadow-sm">
              Log Out
            </button>
          </div>
        )}

        {/* VIEWS */}
        {view === 'timer' && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-24">

            {/* 1. FIX: Changed 'state' to 'timerState' so it doesn't crash */}
            <TimerView timerState={timerState} />

            {/* 2. FIX: Added these back so you can actually see your Tasks and Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TasksView tasks={tasks} setTasks={setTasks} />
              <PlanView note={note} setNote={setNote} />
            </div>

          </div>
        )}

        {view === 'notes' && (
          <NotesView
            notes={notes} setNotes={setNotes}
            categories={categories} setCategories={setCategories}
            activeNoteId={activeNoteId} setActiveNoteId={setActiveNoteId}

            isMobile={isMobile} // <--- CRITICAL: Passing the mobile state!
          />
        )}

        {view === 'graph' && (
          <GraphView
            notes={notes} setNotes={setNotes}
            activeNoteId={activeNoteId} setActiveNoteId={setActiveNoteId}
            setView={setView}
          />
        )}
      </main>

      {/* 3. MOBILE BOTTOM NAV (Visible only on Mobile) */}
      {isMobile && <MobileNav view={view} setView={setView} />}

    </div>
  );
}

function App() {
  // We store the current user in a simple state
  const [user, setUser] = useState(() => window.localStorage.getItem("last-user") || null);

  const handleLogin = (username) => {
    setUser(username);
    window.localStorage.setItem("last-user", username);
  };

  const handleLogout = () => {
    setUser(null);
    window.localStorage.removeItem("last-user");
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  // KEY TRICK: The 'key={user}' prop forces React to completely destroy 
  // and recreate the Dashboard when the user changes. 
  // This ensures the hooks reload data for the NEW user immediately.
  return <Dashboard key={user} currentUser={user} onLogout={handleLogout} />;
}

export default App;