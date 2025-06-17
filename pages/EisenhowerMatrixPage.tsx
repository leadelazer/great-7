
import React, { useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import { EisenhowerTask, EisenhowerQuadrant, ToolKey } from '../types';
import { TOOLS_CONFIG, QUADRANT_COLORS, QUADRANT_TEXT_COLORS, UI_ICONS, EDUCATIONAL_CONTENT } from '../constants';
import ToolPageLayout from '../components/ToolPageLayout';
import useLocalStorage from '../hooks/useLocalStorage';
import Tooltip from '../components/Tooltip';

const EisenhowerMatrixPage: React.FC = () => {
  const tool = TOOLS_CONFIG.find(t => t.key === ToolKey.EISENHOWER_MATRIX)!;
  const [tasks, setTasks] = useLocalStorage<EisenhowerTask[]>(`great7-${ToolKey.EISENHOWER_MATRIX}-tasks`, []);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const inputBaseClass = "font-mono p-2.5 w-full border border-brand-border-light dark:border-brand-border-dark rounded-md focus:ring-1 focus:ring-brand-accent bg-brand-bg-light dark:bg-brand-bg-dark text-brand-text-light dark:text-brand-text-dark placeholder-brand-text-muted-light dark:placeholder-brand-text-muted-dark text-sm";
  const primaryButtonClass = "font-sans px-5 py-2.5 bg-brand-accent text-brand-accent-text text-sm font-medium rounded-md transition-colors shadow-sm hover:bg-brand-accent-hover flex items-center justify-center";

  const addTask = useCallback(() => {
    if (newTaskText.trim() === '') return;
    setTasks(prevTasks => [...prevTasks, { id: uuidv4(), text: newTaskText.trim(), quadrant: EisenhowerQuadrant.DO_NOW }]);
    setNewTaskText('');
  }, [newTaskText, setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, [setTasks]);

  const startEditTask = useCallback((task: EisenhowerTask) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  }, []);

  const saveEditTask = useCallback((id: string) => {
    if (editingText.trim() === '') {
      deleteTask(id); 
    } else {
      setTasks(prevTasks => prevTasks.map(task => task.id === id ? { ...task, text: editingText.trim() } : task));
    }
    setEditingTaskId(null);
    setEditingText('');
  }, [editingText, setTasks, deleteTask]);

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const taskId = result.draggableId;
    const newQuadrant = destination.droppableId as EisenhowerQuadrant;

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, quadrant: newQuadrant } : task
      )
    );
  }, [setTasks]);

  const quadrants = useMemo(() => [
    EisenhowerQuadrant.DO_NOW,
    EisenhowerQuadrant.SCHEDULE,
    EisenhowerQuadrant.DELEGATE,
    EisenhowerQuadrant.ELIMINATE
  ], []);
  
  const tasksByQuadrant = useMemo(() => {
    return quadrants.reduce((acc, q) => {
      acc[q] = tasks.filter(task => task.quadrant === q);
      return acc;
    }, {} as Record<EisenhowerQuadrant, EisenhowerTask[]>);
  }, [tasks, quadrants]);

  const getShareMessage = useCallback(() => {
    const totalTasks = tasks.length;
    if (totalTasks === 0) return "My Eisenhower Matrix is empty, ready for action!";
    const doNowCount = tasksByQuadrant[EisenhowerQuadrant.DO_NOW].length;
    const eliminatedCount = tasksByQuadrant[EisenhowerQuadrant.ELIMINATE].length;
    let message = `My Eisenhower Matrix: ${doNowCount} tasks to DO NOW!`;
    if (eliminatedCount > 0) {
      message += ` I've eliminated ${eliminatedCount} distractions (${Math.round((eliminatedCount/totalTasks)*100)}%)!`;
    }
    return message;
  }, [tasks, tasksByQuadrant]);

  const educationInfo = EDUCATIONAL_CONTENT[ToolKey.EISENHOWER_MATRIX];

  return (
    <ToolPageLayout 
      tool={tool} 
      exportContentId="eisenhower-matrix-content" 
      getShareMessage={getShareMessage}
    >
      <div id="eisenhower-matrix-content" className="p-1 sm:p-2">
        <div className="mb-5 flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Enter new task..."
            className={`${inputBaseClass} flex-grow`}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            aria-label="New task input"
          />
          <button
            onClick={addTask}
            className={primaryButtonClass}
            aria-label="Add new task"
          >
            <UI_ICONS.Add size={18} className="mr-1.5" /> Add Task
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {quadrants.map((quadrantName) => (
              <Droppable key={quadrantName} droppableId={quadrantName}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`${QUADRANT_COLORS[quadrantName]} p-3.5 rounded-lg border-2 
                                ${snapshot.isDraggingOver ? 'ring-2 ring-offset-1 ring-brand-accent dark:ring-offset-brand-bg-dark' : ''}
                                transition-all duration-150 ease-in-out flex flex-col min-h-[220px] shadow-sm`}
                  >
                    <h3 className={`font-sans text-lg font-medium mb-3 flex items-center justify-between ${QUADRANT_TEXT_COLORS[quadrantName]}`}>
                      <span className="flex items-center">
                        {quadrantName === EisenhowerQuadrant.DO_NOW && <UI_ICONS.Urgent className="mr-1.5 h-4 w-4" />}
                        {quadrantName === EisenhowerQuadrant.SCHEDULE && <UI_ICONS.Important className="mr-1.5 h-4 w-4" />}
                        {quadrantName === EisenhowerQuadrant.DELEGATE && <UI_ICONS.Timeline className="mr-1.5 h-4 w-4" />}
                        {quadrantName === EisenhowerQuadrant.ELIMINATE && <UI_ICONS.Delete className="mr-1.5 h-4 w-4" />}
                        {quadrantName}
                      </span>
                      {educationInfo?.tooltip && quadrantName === EisenhowerQuadrant.DO_NOW && ( 
                        <Tooltip text={educationInfo.tooltip}>
                           <UI_ICONS.Info size={16} className="opacity-60 hover:opacity-100 cursor-help" />
                        </Tooltip>
                       )}
                    </h3>
                    <div className="space-y-2.5 flex-grow overflow-y-auto pr-0.5 max-h-60 sm:max-h-none font-mono">
                      {tasksByQuadrant[quadrantName].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(providedDraggable, snapshotDraggable) => (
                            <div
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                              className={`p-2.5 bg-brand-bg-light dark:bg-zinc-900 border border-brand-border-light dark:border-brand-border-dark rounded-md shadow-subtle 
                                          ${snapshotDraggable.isDragging ? 'opacity-90 shadow-md scale-102' : ''}
                                          text-brand-text-light dark:text-brand-text-dark group transition-all duration-150 ease-in-out text-sm`}
                              aria-label={`Task: ${task.text}`}
                            >
                              {editingTaskId === task.id ? (
                                <div className="flex items-center">
                                  <input
                                    type="text"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    onBlur={() => saveEditTask(task.id)}
                                    onKeyPress={(e) => e.key === 'Enter' && saveEditTask(task.id)}
                                    autoFocus
                                    className="flex-grow text-xs bg-transparent border-b border-brand-border-dark focus:outline-none focus:border-brand-accent font-mono"
                                    aria-label={`Editing task: ${task.text}`}
                                  />
                                </div>
                              ) : (
                                <div className="flex justify-between items-center">
                                  <span className="break-words w-[calc(100%-3.5rem)] text-xs font-mono">{task.text}</span>
                                  <div className="flex space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip text="Edit task">
                                      <button onClick={() => startEditTask(task)} className="p-1 hover:text-brand-accent" aria-label="Edit task">
                                        <UI_ICONS.Edit size={14} />
                                      </button>
                                    </Tooltip>
                                    <Tooltip text="Delete task">
                                      <button onClick={() => deleteTask(task.id)} className="p-1 hover:text-red-500 dark:hover:text-red-400" aria-label="Delete task">
                                        <UI_ICONS.Delete size={14} />
                                      </button>
                                    </Tooltip>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                     {tasksByQuadrant[quadrantName].length === 0 && (
                        <p className={`text-xs font-mono ${QUADRANT_TEXT_COLORS[quadrantName]} opacity-70 mt-3 text-center italic flex-grow flex items-center justify-center`}>Drag tasks here.</p>
                      )}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </ToolPageLayout>
  );
};

export default EisenhowerMatrixPage;
