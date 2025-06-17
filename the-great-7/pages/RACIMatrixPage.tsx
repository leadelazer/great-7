import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RACITask, RACITeamMember, RACIRole, ToolKey, RACITaskAssignment } from '../types';
import { TOOLS_CONFIG, UI_ICONS, RACI_ROLE_DEFINITIONS } from '../constants';
import ToolPageLayout from '../components/ToolPageLayout';
import useLocalStorage from '../hooks/useLocalStorage';
import Tooltip from '../components/Tooltip';

const RACIMatrixPage: React.FC = () => {
  const tool = TOOLS_CONFIG.find(t => t.key === ToolKey.RACI_MATRIX)!;
  const [tasks, setTasks] = useLocalStorage<RACITask[]>(`great7-${ToolKey.RACI_MATRIX}-tasks`, []);
  const [teamMembers, setTeamMembers] = useLocalStorage<RACITeamMember[]>(`great7-${ToolKey.RACI_MATRIX}-members`, []);
  
  const [newTaskName, setNewTaskName] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [conflictAlerts, setConflictAlerts] = useState<string[]>([]);

  const inputBaseClass = "font-mono p-3 w-full border border-brand-border-light dark:border-brand-border-dark rounded-lg focus:ring-1 focus:ring-brand-accent bg-brand-bg-light dark:bg-brand-bg-dark text-brand-text-light dark:text-brand-text-dark placeholder-brand-text-muted-light dark:placeholder-brand-text-muted-dark";
  const primaryButtonClass = "font-sans w-full px-6 py-3 bg-brand-accent text-brand-accent-text font-semibold rounded-lg transition-colors shadow-md hover:bg-brand-accent-hover";


  const addTask = useCallback(() => {
    if (newTaskName.trim() === '') return;
    const initialAssignments: RACITaskAssignment = teamMembers.reduce((acc, member) => {
      acc[member.id] = undefined;
      return acc;
    }, {} as RACITaskAssignment);
    setTasks(prev => [...prev, { id: uuidv4(), name: newTaskName.trim(), assignments: initialAssignments }]);
    setNewTaskName('');
  }, [newTaskName, teamMembers, setTasks]);

  const addTeamMember = useCallback(() => {
    if (newMemberName.trim() === '') return;
    const newMember = { id: uuidv4(), name: newMemberName.trim() };
    setTeamMembers(prev => [...prev, newMember]);
    setTasks(prevTasks => prevTasks.map(task => ({
      ...task,
      assignments: { ...task.assignments, [newMember.id]: undefined }
    })));
    setNewMemberName('');
  }, [newMemberName, setTeamMembers, setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [setTasks]);

  const deleteTeamMember = useCallback((id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
    setTasks(prevTasks => prevTasks.map(task => {
      const newAssignments = { ...task.assignments };
      delete newAssignments[id];
      return { ...task, assignments: newAssignments };
    }));
  }, [setTeamMembers, setTasks]);

  const updateTaskAssignment = useCallback((taskId: string, memberId: string, role: RACIRole | undefined) => {
    setTasks(prevTasks => {
        const newTasks = prevTasks.map(task => 
          task.id === taskId ? { ...task, assignments: { ...task.assignments, [memberId]: role } } : task
        );
        return newTasks;
    });
  }, [setTasks]);

  const checkConflicts = useCallback((currentTasks: RACITask[]) => {
    const alerts: string[] = [];
    currentTasks.forEach(task => {
      const assignments = Object.values(task.assignments);
      const responsibleCount = assignments.filter(r => r === RACIRole.RESPONSIBLE).length;
      const accountableCount = assignments.filter(r => r === RACIRole.ACCOUNTABLE).length;

      if (responsibleCount > 1) alerts.push(`Task "${task.name}" has >1 Responsible (R). Aim for one.`);
      if (accountableCount > 1) alerts.push(`Task "${task.name}" has >1 Accountable (A). Strictly one is best.`);
      if (accountableCount === 0 && teamMembers.length > 0) alerts.push(`Task "${task.name}" must have one Accountable (A).`);
    });
    setConflictAlerts(alerts);
  }, [setConflictAlerts, teamMembers.length]); 
  
  React.useEffect(() => {
    checkConflicts(tasks);
  }, [tasks, checkConflicts]);


  const getShareMessage = useCallback(() => {
    if (tasks.length === 0 || teamMembers.length === 0) return "My RACI Matrix is getting set up for clear roles!";
    const assignedTasks = tasks.filter(t => Object.values(t.assignments).some(role => role !== undefined)).length;
    return `My RACI Matrix clarifies ${assignedTasks} tasks among ${teamMembers.length} team members. ${tool.tagline}`;
  }, [tasks, teamMembers, tool.tagline]);
  
  const raciRolesArray = Object.values(RACIRole);

  return (
    <ToolPageLayout tool={tool} exportContentId="raci-matrix-content" getShareMessage={getShareMessage}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-5 bg-brand-card-light dark:bg-brand-card-dark rounded-xl shadow-lg">
          <h3 className="text-lg font-sans font-semibold mb-3 text-brand-text-light dark:text-brand-text-dark">Add Task</h3>
          <input type="text" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} placeholder="Task Name" className={`${inputBaseClass} mb-3 text-sm`} aria-label="New task name" />
          <button onClick={addTask} className={primaryButtonClass}>Add Task</button>
        </div>
        <div className="p-5 bg-brand-card-light dark:bg-brand-card-dark rounded-xl shadow-lg">
          <h3 className="text-lg font-sans font-semibold mb-3 text-brand-text-light dark:text-brand-text-dark">Add Team Member</h3>
          <input type="text" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder="Team Member Name" className={`${inputBaseClass} mb-3 text-sm`} aria-label="New team member name"/>
          <button onClick={addTeamMember} className={primaryButtonClass}>Add Team Member</button>
        </div>
      </div>

      {conflictAlerts.length > 0 && (
        <div className="mb-6 p-4 bg-amber-500/10 dark:bg-amber-500/20 border-l-4 border-amber-500 rounded-r-lg">
          <h4 className="font-sans font-semibold text-amber-700 dark:text-amber-300 flex items-center mb-1"><UI_ICONS.Conflict size={20} className="mr-2"/> RACI Suggestions:</h4>
          <ul className="list-disc list-inside text-amber-600 dark:text-amber-400 text-sm space-y-0.5 font-mono">
            {conflictAlerts.map((alert, idx) => <li key={idx}>{alert}</li>)}
          </ul>
        </div>
      )}

      <div id="raci-matrix-content" className="p-1 sm:p-4 bg-brand-card-light dark:bg-brand-card-dark rounded-xl shadow-lg overflow-x-auto font-mono">
        {tasks.length > 0 && teamMembers.length > 0 ? (
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="bg-brand-border-light/[0.2] dark:bg-brand-border-dark/[0.2]">
                <th className="p-3 border border-brand-border-light dark:border-brand-border-dark text-left font-sans text-brand-text-light dark:text-brand-text-dark sticky left-0 z-10 bg-brand-card-light dark:bg-brand-card-dark min-w-[200px]">Task</th>
                {teamMembers.map(member => (
                  <th key={member.id} className="p-3 border border-brand-border-light dark:border-brand-border-dark text-center font-sans text-brand-text-light dark:text-brand-text-dark whitespace-nowrap min-w-[150px]">
                    {member.name}
                    <Tooltip text="Delete member">
                        <button onClick={() => deleteTeamMember(member.id)} className="ml-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" aria-label={`Delete member ${member.name}`}><UI_ICONS.Delete size={14}/></button>
                    </Tooltip>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-brand-border-light/[0.1] dark:hover:bg-brand-border-dark/[0.1] transition-colors group">
                  <td className="p-3 border border-brand-border-light dark:border-brand-border-dark text-brand-text-light dark:text-brand-text-dark font-medium font-mono sticky left-0 z-10 bg-brand-card-light dark:bg-brand-card-dark group-hover:bg-brand-border-light/[0.1] dark:group-hover:bg-brand-border-dark/[0.1] transition-colors">
                    {task.name}
                     <Tooltip text="Delete task">
                        <button onClick={() => deleteTask(task.id)} className="ml-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" aria-label={`Delete task ${task.name}`}><UI_ICONS.Delete size={14}/></button>
                    </Tooltip>
                  </td>
                  {teamMembers.map(member => (
                    <td key={member.id} className="p-1.5 border border-brand-border-light dark:border-brand-border-dark text-center">
                      <select 
                        value={task.assignments[member.id] || ''} 
                        onChange={e => updateTaskAssignment(task.id, member.id, e.target.value as RACIRole || undefined)}
                        className="font-mono w-full p-2 text-xs border border-brand-border-light dark:border-brand-border-dark rounded-md bg-brand-bg-light dark:bg-brand-bg-dark text-brand-text-light dark:text-brand-text-dark focus:ring-1 focus:ring-brand-accent"
                        title={`Assign role for ${member.name} on task ${task.name}`}
                        aria-label={`Role for ${member.name} on task ${task.name}`}
                      >
                        <option value="">- None -</option>
                        {raciRolesArray.map(roleKey => (
                          <option key={roleKey} value={roleKey}>
                            {RACI_ROLE_DEFINITIONS[roleKey].icon} {roleKey}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark py-10">Add tasks and team members to build your RACI matrix.</p>
        )}
      </div>
       <div className="mt-8 p-6 bg-brand-card-light dark:bg-brand-card-dark rounded-xl shadow-lg">
            <h4 className="text-xl font-sans font-semibold text-brand-text-light dark:text-brand-text-dark mb-4">RACI Key</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm font-mono">
                {Object.entries(RACI_ROLE_DEFINITIONS).map(([key, value]) => (
                    <li key={key} className="flex items-start p-2 rounded-md hover:bg-brand-border-light/[0.1] dark:hover:bg-brand-border-dark/[0.1]">
                        <span className="text-2xl mr-2.5 mt-0.5">{value.icon}</span>
                        <div>
                            <span className="font-sans font-semibold text-brand-text-light dark:text-brand-text-dark">{key} - {value.name}</span>
                            <p className="text-brand-text-muted-light dark:text-brand-text-muted-dark text-xs">{value.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </ToolPageLayout>
  );
};

export default RACIMatrixPage;