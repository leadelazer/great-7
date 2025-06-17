
import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GanttTask, ToolKey } from '../types';
import { TOOLS_CONFIG, UI_ICONS, BRAND_THEME_COLORS } from '../constants';
import ToolPageLayout from '../components/ToolPageLayout';
import useLocalStorage from '../hooks/useLocalStorage';
import Tooltip from '../components/Tooltip';
import { exportToCSV } from '../services/exportService';

const formatDateForInput = (isoDate: string) => {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toISOString().split('T')[0];
  } catch (e) { return '';}
};

const GanttChartPage: React.FC = () => {
  const tool = TOOLS_CONFIG.find(t => t.key === ToolKey.GANTT_CHART)!;
  const [tasks, setTasks] = useLocalStorage<GanttTask[]>(`great7-${ToolKey.GANTT_CHART}-tasks`, []);
  
  const [newTaskName, setNewTaskName] = useState('');
  const [newStartDate, setNewStartDate] = useState(formatDateForInput(new Date().toISOString()));
  const [newEndDate, setNewEndDate] = useState(formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()));
  const [newDependencies, setNewDependencies] = useState<string[]>([]);
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskData, setEditTaskData] = useState<Partial<GanttTask>>({});

  const inputBaseClass = "font-mono p-3 w-full border border-brand-border-light dark:border-brand-border-dark rounded-lg focus:ring-1 focus:ring-brand-accent bg-brand-bg-light dark:bg-brand-card-dark text-brand-text-light dark:text-brand-text-dark placeholder-brand-text-muted-light dark:placeholder-brand-text-muted-dark";
  const dateInputClass = `${inputBaseClass} dark:[color-scheme:dark]`;
  const primaryButtonClass = "font-sans px-6 py-3 bg-brand-accent text-brand-accent-text font-semibold rounded-lg transition-colors shadow-md hover:bg-brand-accent-hover";
  const secondaryButtonClass = "font-sans px-4 py-2 bg-brand-card-light dark:bg-brand-card-dark border border-brand-border-light dark:border-brand-border-dark text-brand-text-light dark:text-brand-text-dark rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm";
  const ganttSaveButtonClass = "font-sans px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm";


  const addTask = useCallback(() => {
    if (newTaskName.trim() === '' || !newStartDate || !newEndDate) {
        alert("Task name, start date, and end date are required.");
        return;
    }
    if (new Date(newStartDate) > new Date(newEndDate)) {
      alert("Start date cannot be after end date.");
      return;
    }
    const newTask: GanttTask = { 
      id: uuidv4(), 
      name: newTaskName.trim(), 
      startDate: new Date(newStartDate).toISOString(), 
      endDate: new Date(newEndDate).toISOString(),
      dependencies: newDependencies,
      color: `hsl(${Math.random() * 360}, 70%, 70%)` // Keep random color for variety, or use BRAND_THEME_COLORS.accent
    };
    setTasks(prev => [...prev, newTask].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
    setNewTaskName('');
    setNewStartDate(formatDateForInput(new Date().toISOString()));
    setNewEndDate(formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()));
    setNewDependencies([]);
  }, [newTaskName, newStartDate, newEndDate, newDependencies, setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id).map(task => ({
        ...task,
        dependencies: task.dependencies.filter(depId => depId !== id)
    })));
  }, [setTasks]);

  const startEdit = (task: GanttTask) => {
    setEditingTaskId(task.id);
    setEditTaskData({ ...task, startDate: formatDateForInput(task.startDate), endDate: formatDateForInput(task.endDate) });
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTaskData({});
  };

  const saveEdit = () => {
    if (!editingTaskId || !editTaskData.name || !editTaskData.startDate || !editTaskData.endDate) return;
     if (new Date(editTaskData.startDate) > new Date(editTaskData.endDate)) {
      alert("Start date cannot be after end date for the edited task.");
      return;
    }
    setTasks(prev => prev.map(t => t.id === editingTaskId ? 
        { ...t, ...editTaskData, 
            startDate: new Date(editTaskData.startDate!).toISOString(), 
            endDate: new Date(editTaskData.endDate!).toISOString() 
        } as GanttTask 
        : t).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    );
    cancelEdit();
  };
  
  const handleEditInputChange = (field: keyof GanttTask, value: any) => {
    setEditTaskData(prev => ({ ...prev, [field]: value }));
  };
  
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [tasks]);

  const getShareMessage = useCallback(() => {
    if (sortedTasks.length === 0) return "My Gantt Chart is ready for project planning!";
    const projectEndDate = sortedTasks.length > 0 ? new Date(Math.max(...sortedTasks.map(t => new Date(t.endDate).getTime()))).toLocaleDateString() : 'N/A';
    return `My project, planned with a Gantt Chart, has ${sortedTasks.length} tasks and is scheduled to finish by ${projectEndDate}. ${tool.tagline}`;
  }, [sortedTasks, tool.tagline]);
  
  const handleExportCSVData = () => {
    const csvData = [
      ['ID', 'Task Name', 'Start Date', 'End Date', 'Dependencies (Names)'],
      ...sortedTasks.map(task => [
        task.id,
        task.name,
        new Date(task.startDate).toLocaleDateString(),
        new Date(task.endDate).toLocaleDateString(),
        task.dependencies.map(depId => sortedTasks.find(t => t.id === depId)?.name || depId).join('; ')
      ])
    ];
    exportToCSV(csvData, 'gantt-chart-tasks.csv');
  };

  const projectStartDate = useMemo(() => tasks.length > 0 ? new Date(Math.min(...tasks.map(t => new Date(t.startDate).getTime()))) : new Date(), [tasks]);
  const projectEndDate = useMemo(() => tasks.length > 0 ? new Date(Math.max(...tasks.map(t => new Date(t.endDate).getTime()))) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), [tasks]);
  const vizEndDate = new Date(projectEndDate.getTime() + 3 * 24 * 60 * 60 * 1000); // Add a small buffer for visualization
  const totalDays = useMemo(() => Math.max(1, (vizEndDate.getTime() - projectStartDate.getTime()) / (1000 * 3600 * 24)), [projectStartDate, vizEndDate]);


  return (
    <ToolPageLayout 
        tool={tool} 
        exportContentId="gantt-chart-content" 
        getShareMessage={getShareMessage}
        customActions={
             sortedTasks.length > 0 && (
                <button
                onClick={handleExportCSVData}
                className={secondaryButtonClass}
                >
                <UI_ICONS.Export size={16} className="mr-2"/> Export Tasks (CSV)
                </button>
            )
        }
    >
      <div className="p-5 bg-brand-card-light dark:bg-brand-card-dark rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-sans font-semibold mb-4 text-brand-text-light dark:text-brand-text-dark">Add New Task</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <input type="text" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} placeholder="Task Name" className={inputBaseClass} aria-label="New task name"/>
          <input type="date" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} className={dateInputClass} title="Start Date" aria-label="New task start date"/>
          <input type="date" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} className={dateInputClass} title="End Date" aria-label="New task end date"/>
          <select multiple value={newDependencies} onChange={e => setNewDependencies(Array.from(e.target.selectedOptions, option => option.value))} className={`${inputBaseClass} h-28`} title="Dependencies (Ctrl/Cmd+Click for multiple)" aria-label="New task dependencies">
             <option value="" disabled className="italic text-brand-text-muted-light dark:text-brand-text-muted-dark">No dependencies</option>
            {tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <button onClick={addTask} className={primaryButtonClass}>Add Task</button>
      </div>

      <div id="gantt-chart-content" className="p-1 sm:p-4 bg-brand-card-light dark:bg-brand-card-dark rounded-xl shadow-lg overflow-x-auto">
        <h3 className="text-2xl font-sans font-semibold mb-6 text-brand-text-light dark:text-brand-text-dark">Task List & Timeline</h3>
        {sortedTasks.length > 0 ? (
          <div className="space-y-4 font-mono">
            {sortedTasks.map((task) => {
              const taskStartDay = Math.max(0, (new Date(task.startDate).getTime() - projectStartDate.getTime()) / (1000 * 3600 * 24));
              const taskDurationDays = Math.max(1, (new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 3600 * 24) + 1);
              const barOffset = Math.max(0, (taskStartDay / totalDays) * 100);
              const barWidth = Math.max(0.5, (taskDurationDays / totalDays) * 100); 

              const isEditingThis = editingTaskId === task.id;

              return (
              <div key={task.id} className="p-4 bg-brand-bg-light dark:bg-brand-card-dark rounded-lg shadow-subtle border border-brand-border-light dark:border-brand-border-dark">
                {isEditingThis ? (
                    <div className="space-y-3">
                        <input type="text" value={editTaskData.name || ''} onChange={e => handleEditInputChange('name', e.target.value)} className={inputBaseClass} aria-label={`Edit task name for ${task.name}`} />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="date" value={editTaskData.startDate || ''} onChange={e => handleEditInputChange('startDate', e.target.value)} className={dateInputClass} aria-label={`Edit start date for ${task.name}`}/>
                            <input type="date" value={editTaskData.endDate || ''} onChange={e => handleEditInputChange('endDate', e.target.value)} className={dateInputClass} aria-label={`Edit end date for ${task.name}`}/>
                        </div>
                        <select multiple value={editTaskData.dependencies || []} 
                            onChange={e => setEditTaskData(prev => ({...prev, dependencies: Array.from(e.target.selectedOptions, option => option.value)}))}
                            className={`${inputBaseClass} h-24`} aria-label={`Edit dependencies for ${task.name}`}>
                             <option value="" disabled className="italic text-brand-text-muted-light dark:text-brand-text-muted-dark">No dependencies</option>
                            {tasks.filter(t => t.id !== task.id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <div className="flex gap-2 pt-2">
                            <button onClick={saveEdit} className={ganttSaveButtonClass}>Save Changes</button>
                            <button onClick={cancelEdit} className={secondaryButtonClass}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-sans font-semibold text-brand-text-light dark:text-brand-text-dark">{task.name}</h4>
                            <div className="flex space-x-2">
                            <Tooltip text="Edit task">
                                <button onClick={() => startEdit(task)} className="p-1 text-brand-accent hover:text-brand-accent-hover" aria-label={`Edit task ${task.name}`}><UI_ICONS.Edit size={18}/></button>
                            </Tooltip>
                            <Tooltip text="Delete task">
                                <button onClick={() => deleteTask(task.id)} className="p-1 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500" aria-label={`Delete task ${task.name}`}><UI_ICONS.Delete size={18}/></button>
                            </Tooltip>
                            </div>
                        </div>
                        <p className="text-xs text-brand-text-muted-light dark:text-brand-text-muted-dark font-mono">
                            {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                            &nbsp;({taskDurationDays.toFixed(0)} day{taskDurationDays.toFixed(0) !== '1' ? 's' : ''})
                        </p>
                        {task.dependencies.length > 0 && (
                            <p className="text-xs text-brand-text-muted-light dark:text-brand-text-muted-dark mt-1 font-mono">
                            Depends on: {task.dependencies.map(depId => tasks.find(t=>t.id===depId)?.name || 'Unknown task').join(', ')}
                            </p>
                        )}
                        <div className="mt-3 h-5 w-full bg-brand-border-light/[0.5] dark:bg-brand-border-dark/[0.5] rounded-full overflow-hidden">
                            <div
                            style={{ marginLeft: `${barOffset}%`, width: `${barWidth}%`, backgroundColor: task.color || BRAND_THEME_COLORS.accent }}
                            className={`h-full rounded-full transition-all duration-300 ease-out`}
                            title={`${task.name}: ${new Date(task.startDate).toLocaleDateString()} - ${new Date(task.endDate).toLocaleDateString()}`}
                            ></div>
                        </div>
                    </>
                )}
              </div>
            )})}
          </div>
        ) : (
          <p className="text-center font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark py-10">Add tasks to visualize your project timeline.</p>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default GanttChartPage;
