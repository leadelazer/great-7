import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell, Line } from 'recharts';
import { ParetoTask, ToolKey } from '../types';
import { TOOLS_CONFIG, UI_ICONS, EDUCATIONAL_CONTENT, BRAND_THEME_COLORS } from '../constants';
import ToolPageLayout from '../components/ToolPageLayout';
import useLocalStorage from '../hooks/useLocalStorage';
import { exportToCSV } from '../services/exportService';
import TooltipComponent from '../components/Tooltip';

const ParetoChartPage: React.FC = () => {
  const tool = TOOLS_CONFIG.find(t => t.key === ToolKey.PARETO_CHART)!;
  const education = EDUCATIONAL_CONTENT[tool.key]!;
  const [tasks, setTasks] = useLocalStorage<ParetoTask[]>(`great7-${ToolKey.PARETO_CHART}-tasks`, []);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskImpact, setNewTaskImpact] = useState<number | string>(5);

  const inputBaseClass = "font-mono p-2.5 w-full border border-brand-border-light dark:border-brand-border-dark rounded-md focus:ring-1 focus:ring-brand-accent bg-brand-bg-light dark:bg-brand-bg-dark text-brand-text-light dark:text-brand-text-dark placeholder-brand-text-muted-light dark:placeholder-brand-text-muted-dark text-sm";
  const primaryButtonClass = "font-sans px-5 py-2.5 bg-brand-accent text-brand-accent-text text-sm font-medium rounded-md transition-colors shadow-sm hover:bg-brand-accent-hover flex items-center justify-center";
  const secondaryButtonClass = "font-sans px-4 py-2 bg-brand-card-light dark:bg-brand-card-dark border border-brand-border-light dark:border-brand-border-dark text-brand-text-light dark:text-brand-text-dark text-xs font-medium rounded-md transition-colors shadow-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center";


  const addTask = useCallback(() => {
    if (newTaskName.trim() === '' || newTaskImpact === '' || isNaN(Number(newTaskImpact))) return;
    const impact = Math.max(1, Math.min(10, Number(newTaskImpact)));
    setTasks(prevTasks => [...prevTasks, { id: uuidv4(), name: newTaskName.trim(), impactScore: impact }]);
    setNewTaskName('');
    setNewTaskImpact(5);
  }, [newTaskName, newTaskImpact, setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, [setTasks]);
  
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.impactScore - a.impactScore);
  }, [tasks]);

  const chartData = useMemo(() => {
    let cumulativePercentage = 0;
    const totalImpact = sortedTasks.reduce((sum, task) => sum + task.impactScore, 0);
    if (totalImpact === 0) return [];

    return sortedTasks.map(task => {
      const percentage = (task.impactScore / totalImpact) * 100;
      cumulativePercentage += percentage;
      return {
        name: task.name, // This is the "Cause / Task / Effort"
        impact: task.impactScore, // This is the "Effect / Impact Value"
        percentage: parseFloat(percentage.toFixed(1)),
        cumulativePercentage: parseFloat(cumulativePercentage.toFixed(1)),
        id: task.id
      };
    });
  }, [sortedTasks]);

  const vitalFewCutoffIndex = useMemo(() => {
    let runningTotalPercentage = 0;
    for (let i = 0; i < chartData.length; i++) {
        runningTotalPercentage += chartData[i].percentage;
        if (runningTotalPercentage >= 80) {
            return i + 1; 
        }
    }
    return chartData.length;
  }, [chartData]);


  const getShareMessage = useCallback(() => {
    if (chartData.length === 0) return "My Pareto Chart is ready to find high-impact tasks!";
    const topTasks = chartData.slice(0, vitalFewCutoffIndex).map(t => t.name);
    if (topTasks.length === 0) return "Focusing on what matters with my Pareto Chart.";
    return `My Pareto Chart highlights these key causes/tasks (${topTasks.length}/${chartData.length}): ${topTasks.join(', ')}. ${tool.tagline}`;
  }, [chartData, vitalFewCutoffIndex, tool.tagline]);

  const handleExportCSVData = () => {
    const csvData = [
      ['Cause / Task / Effort', 'Effect / Impact Value', 'Individual %', 'Cumulative %'],
      ...chartData.map(d => [d.name, d.impact, `${d.percentage.toFixed(1)}%`, `${d.cumulativePercentage.toFixed(1)}%`])
    ];
    exportToCSV(csvData, 'pareto-chart-data.csv');
  };
  
  const isDarkMode = document.documentElement.classList.contains('dark');
  const axisColor = isDarkMode ? BRAND_THEME_COLORS.textMutedDark : BRAND_THEME_COLORS.textMutedLight;
  const gridColor = isDarkMode ? BRAND_THEME_COLORS.borderDark : BRAND_THEME_COLORS.borderLight;
  const tooltipBg = isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.95)'; // Using specific RGB for brand dark/light
  const tooltipBorder = isDarkMode ? BRAND_THEME_COLORS.borderDark : BRAND_THEME_COLORS.borderLight;
  const vitalFewColor = BRAND_THEME_COLORS.accent;
  const trivialManyColor = BRAND_THEME_COLORS.gray;


  return (
    <ToolPageLayout 
      tool={tool} 
      exportContentId="pareto-chart-content" 
      getShareMessage={getShareMessage}
      customActions={
        tasks.length > 0 ? (
          <button
            onClick={handleExportCSVData}
            className={secondaryButtonClass}
          >
            <UI_ICONS.Export size={14} className="mr-1.5"/> Export Data (CSV)
          </button>
        ) : null
      }
    >
      <div className="mb-5 p-3.5 bg-brand-card-light dark:bg-brand-card-dark rounded-lg border border-brand-border-light dark:border-brand-border-dark shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Enter Cause / Task / Effort"
            className={`${inputBaseClass} flex-grow`}
            aria-label="New Pareto task name"
          />
          <input
            type="number"
            value={newTaskImpact}
            onChange={(e) => setNewTaskImpact(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Effect / Impact Value (1-10)"
            min="1" max="10"
            className={`${inputBaseClass} w-full sm:w-56`}
            aria-label="New Pareto task impact value"
          />
        </div>
        <button
          onClick={addTask}
          className={`${primaryButtonClass} w-full sm:w-auto`}
          aria-label="Add Pareto task"
        >
          <UI_ICONS.Add size={18} className="mr-1.5" /> Add Cause/Effort
        </button>
      </div>

      <div id="pareto-chart-content" className="p-1 sm:p-2 bg-brand-card-light dark:bg-brand-card-dark rounded-lg border border-brand-border-light dark:border-brand-border-dark shadow-sm">
        {tasks.length > 0 ? (
          <div className="h-[400px] w-full mb-5 font-mono"> {/* Chart text should be mono */}
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 45 }} barGap={5}>
                <CartesianGrid strokeDasharray="2 2" stroke={gridColor} strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: axisColor, fontFamily: 'IBM Plex Mono' }} angle={-60} textAnchor="end" height={60} interval={0} />
                <YAxis yAxisId="left" orientation="left" stroke={axisColor} tick={{ fontSize: 9, fill: axisColor, fontFamily: 'IBM Plex Mono' }} label={{ value: 'Effect / Impact Value', angle: -90, position: 'insideLeft', fill: axisColor, fontSize:10, fontFamily: 'IBM Plex Mono', dy:60, dx: 5 }} />
                <YAxis yAxisId="right" orientation="right" stroke={vitalFewColor} tick={{ fontSize: 9, fill: vitalFewColor, fontFamily: 'IBM Plex Mono' }} domain={[0, 100]} unit="%" label={{ value: 'Cumulative %', angle: 90, position: 'insideRight', fill: vitalFewColor, fontSize:10, fontFamily: 'IBM Plex Mono', dy:-50, dx: -5 }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '0.375rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontFamily: 'IBM Plex Mono' }}
                  labelStyle={{ color: isDarkMode ? BRAND_THEME_COLORS.textDark : BRAND_THEME_COLORS.textLight, fontWeight: '500', marginBottom:'3px', fontSize:'11px', fontFamily: 'Inter, sans-serif' }} // Tooltip title can be sans
                  itemStyle={{ color: isDarkMode ? BRAND_THEME_COLORS.textMutedDark : BRAND_THEME_COLORS.textMutedLight, fontSize:'10px', fontFamily: 'IBM Plex Mono' }}
                  cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                  formatter={(value: any, name: any) => {
                    if (name === "Cumulative %") return [`${value}%`, name];
                    return [value, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontFamily: 'IBM Plex Mono' }} iconSize={8} />
                <Bar yAxisId="left" dataKey="impact" name="Effect / Impact Value" radius={[2, 2, 0, 0]}>
                   {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < vitalFewCutoffIndex ? vitalFewColor : trivialManyColor} />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" name="Cumulative %" stroke={vitalFewColor} strokeWidth={1.5} dot={{ r: 2, fill: vitalFewColor, strokeWidth:1, stroke: tooltipBg}} activeDot={{ r: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark py-10 text-sm">Add causes/tasks and their impact values to visualize the Pareto Principle.</p>
        )}
        
        <div className="mt-3">
            <h4 className="font-sans text-md font-medium text-brand-text-light dark:text-brand-text-dark mb-2">Task List (Sorted by Impact)</h4>
            {sortedTasks.length === 0 ? <p className="text-xs font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark">No tasks added yet.</p> :
            <ul className="space-y-1.5 max-h-60 overflow-y-auto p-0.5 font-mono">
                {sortedTasks.map((task, index) => (
                    <li key={task.id} className={`flex justify-between items-center p-2 rounded-md text-xs ${index < vitalFewCutoffIndex ? 'bg-brand-accent/[0.08] dark:bg-brand-accent/[0.15] text-brand-accent' : 'bg-brand-card-light dark:bg-brand-card-dark border border-brand-border-light dark:border-brand-border-dark'}`}>
                        <span className={`font-medium ${index < vitalFewCutoffIndex ? '' : 'text-brand-text-light dark:text-brand-text-dark'}`}>{task.name} (Impact: {task.impactScore})</span>
                        <TooltipComponent text="Delete task">
                            <button onClick={() => deleteTask(task.id)} className={`p-0.5 ${index < vitalFewCutoffIndex ? 'text-brand-accent hover:text-red-500' : 'text-brand-text-muted-light hover:text-red-500 dark:text-brand-text-muted-dark dark:hover:text-red-400'}`} aria-label={`Delete task ${task.name}`}>
                                <UI_ICONS.Delete size={14} />
                            </button>
                        </TooltipComponent>
                    </li>
                ))}
            </ul>
            }
        </div>
        {education.tooltip && <p className="mt-4 text-xs font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark p-2 bg-brand-card-light dark:bg-brand-card-dark border-l-2 border-brand-accent rounded-r-sm">{education.tooltip}</p>}
      </div>
    </ToolPageLayout>
  );
};

export default ParetoChartPage;