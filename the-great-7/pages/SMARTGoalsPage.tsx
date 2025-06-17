

import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SMARTGoal, ToolKey } from '../types';
import { TOOLS_CONFIG, UI_ICONS, BRAND_THEME_COLORS } from '../constants';
import ToolPageLayout from '../components/ToolPageLayout';
import useLocalStorage from '../hooks/useLocalStorage';
import Tooltip from '../components/Tooltip';

const SMARTGoalsPage: React.FC = () => {
  const tool = TOOLS_CONFIG.find(t => t.key === ToolKey.SMART_GOALS)!;
  const [goals, setGoals] = useLocalStorage<SMARTGoal[]>(`great7-${ToolKey.SMART_GOALS}-goals`, []);
  
  const initialNewGoalState: Omit<SMARTGoal, 'id' | 'progress'> = { 
    mainIdea: '', specific: '', measurable: '', achievable: '', relevant: '', timeBound: ''
  };
  const [newGoal, setNewGoal] = useState<Omit<SMARTGoal, 'id' | 'progress'>>(initialNewGoalState);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const handleInputChange = useCallback(<K extends keyof Omit<SMARTGoal, 'id' | 'progress'>>(field: K, value: Omit<SMARTGoal, 'id' | 'progress'>[K]) => {
    setNewGoal(prev => ({ ...prev, [field]: value }));
  }, []);

  const addOrUpdateGoal = useCallback(() => {
    if (newGoal.mainIdea.trim() === '') {
      alert("Main Goal Idea cannot be empty.");
      return;
    }
    const { mainIdea, ...criteria } = newGoal;
    const allCriteriaFilled = Object.values(criteria).every(val => typeof val === 'string' && val.trim() !== '');
    if (!allCriteriaFilled) {
      alert("Please fill out all SMART criteria fields (Specific, Measurable, etc.).");
      return;
    }

    if (editingGoalId) {
      setGoals(prev => prev.map(g => g.id === editingGoalId ? { ...g, ...newGoal } : g)); 
      setEditingGoalId(null);
    } else {
      setGoals(prev => [...prev, { ...newGoal, id: uuidv4(), progress: 0 }]);
    }
    setNewGoal(initialNewGoalState);
  }, [newGoal, editingGoalId, setGoals, initialNewGoalState]);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    if (editingGoalId === id) {
        setEditingGoalId(null);
        setNewGoal(initialNewGoalState);
    }
  }, [setGoals, editingGoalId, initialNewGoalState]);

  const startEditGoal = useCallback((goal: SMARTGoal) => {
    setEditingGoalId(goal.id);
    const { id, progress, ...editableFields } = goal;
    setNewGoal(editableFields);
  }, [setNewGoal]);

  const cancelEdit = useCallback(() => {
    setEditingGoalId(null);
    setNewGoal(initialNewGoalState);
  }, [initialNewGoalState]);

  const updateProgress = useCallback((id: string, progress: number) => {
    const newProgress = Math.max(0, Math.min(100, progress));
    setGoals(prev => prev.map(g => g.id === id ? { ...g, progress: newProgress } : g));
  }, [setGoals]);

  const getShareMessage = useCallback(() => {
    if (goals.length === 0) return "Setting up my SMART Goals!";
    const firstGoal = goals[0];
    // Construct a more detailed message for sharing
    let shareText = `My SMART Goal: To achieve "${firstGoal.mainIdea}", I will ensure it's:\n`;
    shareText += `S: ${firstGoal.specific}\n`;
    shareText += `M: ${firstGoal.measurable}\n`;
    shareText += `A: ${firstGoal.achievable}\n`;
    shareText += `R: ${firstGoal.relevant}\n`;
    shareText += `T: ${firstGoal.timeBound}\n`;
    shareText += `Progress: ${firstGoal.progress}% achieved! ${tool.tagline}`;
    return shareText;
  }, [goals, tool.tagline]);
  
  const criteriaFields: Array<{ key: keyof Omit<SMARTGoal, 'id' | 'mainIdea' | 'progress'>, label: string, placeholder: string, tip: string }> = [
    { key: 'specific', label: 'S - Specific', placeholder: 'What exactly do I want to achieve?', tip: "Clearly define your goal. Who, what, where, when, why?" },
    { key: 'measurable', label: 'M - Measurable', placeholder: 'How will I know when it’s achieved?', tip: "Set concrete criteria for measuring progress." },
    { key: 'achievable', label: 'A - Achievable', placeholder: 'Is it in my power to accomplish it?', tip: "Ensure the goal is realistic and attainable." },
    { key: 'relevant', label: 'R - Relevant', placeholder: 'Does this goal matter to me/my objectives?', tip: "The goal should align with your broader ambitions." },
    { key: 'timeBound', label: 'T - Time-bound', placeholder: 'What’s the deadline?', tip: "Set a clear deadline to create urgency." },
  ];
  
  const inputBaseClass = "font-mono w-full p-3 border border-brand-border-light dark:border-brand-border-dark rounded-lg focus:ring-1 focus:ring-brand-accent bg-brand-bg-light dark:bg-brand-bg-dark text-brand-text-light dark:text-brand-text-dark placeholder-brand-text-muted-light dark:placeholder-brand-text-muted-dark";
  const labelBaseClass = "font-mono block text-sm font-medium text-brand-text-light dark:text-brand-text-dark mb-1";
  const primaryButtonClass = "font-sans px-6 py-3 bg-brand-accent text-brand-accent-text font-semibold rounded-lg transition-colors shadow-md hover:bg-brand-accent-hover";
  const secondaryButtonClass = "font-sans px-6 py-3 bg-brand-card-light dark:bg-brand-card-dark border border-brand-border-light dark:border-brand-border-dark text-brand-text-light dark:text-brand-text-dark font-medium rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700";


  return (
    <ToolPageLayout tool={tool} exportContentId="smart-goals-content" getShareMessage={getShareMessage}>
      <div className="p-5 bg-brand-card-light dark:bg-brand-card-dark rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-sans font-semibold mb-4 text-brand-text-light dark:text-brand-text-dark">{editingGoalId ? "Edit SMART Goal" : "Define New SMART Goal"}</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="mainIdea" className={labelBaseClass}>Main Goal Idea</label>
            <textarea
                id="mainIdea"
                value={newGoal.mainIdea}
                onChange={e => handleInputChange('mainIdea', e.target.value)}
                placeholder="e.g., Improve personal fitness"
                className={`${inputBaseClass} min-h-[60px] text-sm`}
                rows={2}
                aria-label="Main Goal Idea"
            />
          </div>
          {criteriaFields.map(field => (
            <div key={field.key}>
              <label htmlFor={field.key} className={labelBaseClass}>
                {field.label}
                <Tooltip text={field.tip} position="right">
                    <UI_ICONS.Info size={14} className="inline ml-1.5 text-brand-text-muted-light dark:text-brand-text-muted-dark cursor-help" />
                </Tooltip>
              </label>
              <input
                type="text" id={field.key}
                value={newGoal[field.key]}
                onChange={e => handleInputChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={`${inputBaseClass} text-sm`}
                aria-label={field.label}
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={addOrUpdateGoal} className={primaryButtonClass}>
            {editingGoalId ? 'Save Changes' : 'Add Goal'}
          </button>
          {editingGoalId && (
            <button onClick={cancelEdit} className={secondaryButtonClass}>
                Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div id="smart-goals-content">
        <h3 className="text-2xl font-sans font-semibold mb-6 text-brand-text-light dark:text-brand-text-dark">My SMART Goals</h3>
        {goals.length === 0 ? (
          <p className="font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark">No SMART goals defined yet. Start by adding one above!</p>
        ) : (
          <div className="space-y-6">
            {goals.map(goal => (
              <div key={goal.id} className="p-6 bg-brand-card-light dark:bg-brand-card-dark rounded-xl shadow-lg relative overflow-hidden group">
                <div 
                    className="absolute top-0 left-0 h-full transition-all duration-500 ease-out z-10 opacity-50 dark:opacity-60"
                    style={{ 
                        width: `${goal.progress}%`, 
                        background: goal.progress === 100 
                            ? 'linear-gradient(to right, #10b981, #34d399)' 
                            : `linear-gradient(to right, ${BRAND_THEME_COLORS.accent}, ${BRAND_THEME_COLORS.accentHover})` 
                    }}
                ></div>

                <div className="relative z-20 font-mono">
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-30">
                        <Tooltip text="Edit Goal">
                            <button onClick={() => startEditGoal(goal)} className="p-2 bg-brand-accent/80 text-white rounded-full hover:bg-brand-accent" aria-label={`Edit goal ${goal.mainIdea}`}><UI_ICONS.Edit size={16}/></button>
                        </Tooltip>
                        <Tooltip text="Delete Goal">
                            <button onClick={() => deleteGoal(goal.id)} className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500" aria-label={`Delete goal ${goal.mainIdea}`}><UI_ICONS.Delete size={16}/></button>
                        </Tooltip>
                    </div>

                    <h4 
                        className="text-xl font-sans font-bold mb-3 pr-20 text-brand-text-light dark:text-brand-text-dark"
                        style={{ mixBlendMode: 'difference' }}
                    >
                        {goal.mainIdea}
                    </h4>
                    <div 
                        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4 text-brand-text-light dark:text-brand-text-dark"
                        style={{ mixBlendMode: 'difference' }}
                    >
                      {criteriaFields.map(f => (
                          <div key={f.key}><strong className="font-sans">{f.label.charAt(0)}:</strong> <span>{goal[f.key]}</span></div>
                      ))}
                    </div>
                    
                    <div className="mt-auto">
                      <label htmlFor={`progress-${goal.id}`} className="block text-sm font-medium text-brand-text-light dark:text-brand-text-dark">Progress: {goal.progress}%</label>
                      <input
                        type="range"
                        id={`progress-${goal.id}`}
                        min="0" max="100"
                        value={goal.progress}
                        onChange={e => updateProgress(goal.id, parseInt(e.target.value))}
                        className={`w-full h-2.5 mt-1 rounded-lg appearance-none cursor-pointer accent-brand-accent
                                    bg-brand-border-light dark:bg-brand-border-dark 
                                    [&::-webkit-slider-thumb]:bg-brand-accent dark:[&::-webkit-slider-thumb]:bg-brand-accent
                                    [&::-moz-range-thumb]:bg-brand-accent dark:[&::-moz-range-thumb]:bg-brand-accent`}
                        aria-label={`Progress for goal ${goal.mainIdea}`}
                      />
                       {goal.progress === 100 && <p className="text-emerald-600 dark:text-emerald-400 font-sans font-semibold mt-2 flex items-center"><UI_ICONS.Success size={18} className="mr-1.5" />Goal Achieved! 🎉</p>}
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default SMARTGoalsPage;
