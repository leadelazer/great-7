
import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DecisionOption, DecisionCriteria, ToolKey } from '../types';
import { TOOLS_CONFIG, UI_ICONS } from '../constants';
import ToolPageLayout from '../components/ToolPageLayout';
import useLocalStorage from '../hooks/useLocalStorage';
import Tooltip from '../components/Tooltip';

const DecisionMatrixPage: React.FC = () => {
  const tool = TOOLS_CONFIG.find(t => t.key === ToolKey.DECISION_MATRIX)!;
  const [options, setOptions] = useLocalStorage<DecisionOption[]>(`great7-${ToolKey.DECISION_MATRIX}-options`, []);
  const [criteria, setCriteria] = useLocalStorage<DecisionCriteria[]>(`great7-${ToolKey.DECISION_MATRIX}-criteria`, []);
  
  const [newOptionName, setNewOptionName] = useState('');
  const [newCriteriaName, setNewCriteriaName] = useState('');
  const [newCriteriaWeight, setNewCriteriaWeight] = useState<number | string>(50);

  const inputBaseClass = "font-mono p-2.5 w-full border border-brand-border-light dark:border-brand-border-dark rounded-md focus:ring-1 focus:ring-brand-accent bg-brand-bg-light dark:bg-brand-bg-dark text-brand-text-light dark:text-brand-text-dark placeholder-brand-text-muted-light dark:placeholder-brand-text-muted-dark text-sm";
  const primaryButtonClass = "font-sans w-full px-5 py-2.5 bg-brand-accent text-brand-accent-text text-sm font-medium rounded-md transition-colors shadow-sm hover:bg-brand-accent-hover";
  const secondaryButtonClass = "p-0.5 text-brand-text-muted-light hover:text-red-500 dark:text-brand-text-muted-dark dark:hover:text-red-400";


  const addOption = useCallback(() => {
    if (newOptionName.trim() === '') return;
    const initialScores = criteria.reduce((acc, crit) => {
      acc[crit.id] = 5; 
      return acc;
    }, {} as { [key: string]: number });
    setOptions(prev => [...prev, { id: uuidv4(), name: newOptionName.trim(), scores: initialScores }]);
    setNewOptionName('');
  }, [newOptionName, criteria, setOptions]);

  const addCriteria = useCallback(() => {
    if (newCriteriaName.trim() === '' || newCriteriaWeight === '' || isNaN(Number(newCriteriaWeight))) return;
    const weight = Math.max(0, Math.min(100, Number(newCriteriaWeight)));
    const newCrit = { id: uuidv4(), name: newCriteriaName.trim(), weight: weight };
    setCriteria(prev => [...prev, newCrit]);
    setOptions(prevOpts => prevOpts.map(opt => ({
      ...opt,
      scores: { ...opt.scores, [newCrit.id]: 5 }
    })));
    setNewCriteriaName('');
    setNewCriteriaWeight(50);
  }, [newCriteriaName, newCriteriaWeight, setCriteria, setOptions]);

  const deleteOption = useCallback((id: string) => {
    setOptions(prev => prev.filter(opt => opt.id !== id));
  }, [setOptions]);

  const deleteCriteria = useCallback((id: string) => {
    setCriteria(prev => prev.filter(crit => crit.id !== id));
    setOptions(prevOpts => prevOpts.map(opt => {
      const newScores = { ...opt.scores };
      delete newScores[id];
      return { ...opt, scores: newScores };
    }));
  }, [setCriteria, setOptions]);

  const updateOptionScore = useCallback((optionId: string, criteriaId: string, scoreStr: string) => {
    const score = parseInt(scoreStr);
    if (isNaN(score) && scoreStr !== '') return; 
    const newScore = scoreStr === '' ? 0 : Math.max(1, Math.min(10, score));
    setOptions(prev => prev.map(opt => 
      opt.id === optionId ? { ...opt, scores: { ...opt.scores, [criteriaId]: newScore } } : opt
    ));
  }, [setOptions]);

  const updateCriteriaWeight = useCallback((criteriaId: string, weightStr: string) => {
     const weight = parseInt(weightStr);
    if (isNaN(weight) && weightStr !== '') return;
    const newWeight = weightStr === '' ? 0 : Math.max(0, Math.min(100, weight));
    setCriteria(prev => prev.map(crit => 
      crit.id === criteriaId ? { ...crit, weight: newWeight } : crit
    ));
  }, [setCriteria]);
  
  const totalWeight = useMemo(() => criteria.reduce((sum, c) => sum + (c.weight || 0), 0), [criteria]);

  const calculatedScores = useMemo(() => {
    return options.map(option => {
      let totalScore = 0;
      let sumOfWeightsUsed = 0;
      criteria.forEach(crit => {
        const score = option.scores[crit.id] || 0;
        const weight = crit.weight || 0;
        totalScore += (score * weight);
        sumOfWeightsUsed += weight;
      });
      const finalScore = sumOfWeightsUsed > 0 ? totalScore / sumOfWeightsUsed : (totalWeight > 0 ? totalScore / totalWeight : 0);
      return { ...option, finalScore: parseFloat(finalScore.toFixed(2)) };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }, [options, criteria, totalWeight]);

  const getShareMessage = useCallback(() => {
    if (calculatedScores.length === 0) return "My Decision Matrix is ready to weigh options!";
    const topChoice = calculatedScores[0];
    return `My Decision Matrix analysis shows '${topChoice.name}' as the top choice with a score of ${topChoice.finalScore.toFixed(1)}! ${tool.tagline}`;
  }, [calculatedScores, tool.tagline]);
  
  const getScoreColor = (score: number) => { // score 1-10
    if (score === 0) return 'bg-transparent text-brand-text-muted-light dark:text-brand-text-muted-dark'; 
    if (score >= 8) return 'bg-brand-accent text-brand-accent-text'; // Accent for high scores
    if (score >= 5) return 'bg-brand-gray-light dark:bg-brand-gray-dark text-brand-text-light dark:text-brand-text-dark'; // Neutral gray for mid scores
    return 'bg-zinc-300 dark:bg-zinc-600 text-brand-text-light dark:text-brand-text-dark'; // Lighter gray for low scores
  };


  return (
    <ToolPageLayout tool={tool} exportContentId="decision-matrix-content" getShareMessage={getShareMessage}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="p-3.5 bg-brand-card-light dark:bg-brand-card-dark rounded-lg border border-brand-border-light dark:border-brand-border-dark shadow-sm">
          <h3 className="text-md font-sans font-medium mb-2 text-brand-text-light dark:text-brand-text-dark">Add Option</h3>
          <input type="text" value={newOptionName} onChange={(e) => setNewOptionName(e.target.value)} placeholder="Option Name (e.g., Job A)" className={`${inputBaseClass} mb-2.5`} />
          <button onClick={addOption} className={primaryButtonClass}>Add Option</button>
        </div>
        <div className="p-3.5 bg-brand-card-light dark:bg-brand-card-dark rounded-lg border border-brand-border-light dark:border-brand-border-dark shadow-sm">
          <h3 className="text-md font-sans font-medium mb-2 text-brand-text-light dark:text-brand-text-dark">Add Criteria</h3>
          <input type="text" value={newCriteriaName} onChange={(e) => setNewCriteriaName(e.target.value)} placeholder="Criteria Name (e.g., Salary)" className={`${inputBaseClass} mb-2.5`} />
          <input type="number" value={newCriteriaWeight} onChange={(e) => setNewCriteriaWeight(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Weight (0-100)" min="0" max="100" className={`${inputBaseClass} mb-2.5`} />
          <button onClick={addCriteria} className={primaryButtonClass}>Add Criteria</button>
        </div>
      </div>
       {totalWeight !== 100 && totalWeight > 0 && criteria.length > 0 && (
        <div className="mb-5 p-3 bg-brand-accent/[0.08] dark:bg-brand-accent/[0.15] border-l-2 border-brand-accent rounded-r-md text-brand-accent text-xs font-mono">
          <UI_ICONS.Warning size={16} className="inline mr-1.5" />
          Total criteria weight is {totalWeight}%. For best results, weights should sum to 100%.
        </div>
      )}

      <div id="decision-matrix-content" className="p-1 sm:p-2 bg-brand-card-light dark:bg-brand-card-dark rounded-lg border border-brand-border-light dark:border-brand-border-dark shadow-sm overflow-x-auto font-mono">
        {options.length > 0 && criteria.length > 0 ? (
          <table className="w-full min-w-[600px] border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-200/[0.5] dark:bg-zinc-700/[0.5]">
                <th className="p-2.5 border border-brand-border-light dark:border-brand-border-dark text-left font-sans text-brand-text-light dark:text-brand-text-dark sticky left-0 z-10 bg-brand-card-light dark:bg-brand-card-dark whitespace-nowrap">Option</th>
                {criteria.map(c => (
                  <th key={c.id} className="p-2.5 border border-brand-border-light dark:border-brand-border-dark text-center font-sans text-brand-text-light dark:text-brand-text-dark whitespace-nowrap">
                    <div className="flex flex-col items-center">
                      <span>{c.name}</span>
                      <input 
                        type="number" 
                        value={c.weight}
                        min="0" max="100"
                        onChange={(e) => updateCriteriaWeight(c.id, e.target.value)}
                        className="font-mono w-16 mt-1 p-1 text-xs text-center border border-brand-border-light dark:border-brand-border-dark rounded bg-brand-bg-light dark:bg-brand-bg-dark focus:ring-1 focus:ring-brand-accent"
                        title="Edit weight (0-100)"
                        aria-label={`Weight for ${c.name}`}
                      />
                       <Tooltip text="Delete criteria">
                            <button onClick={() => deleteCriteria(c.id)} className={`${secondaryButtonClass} mt-1`} aria-label={`Delete criteria ${c.name}`}>
                                <UI_ICONS.Delete size={12} />
                            </button>
                        </Tooltip>
                    </div>
                  </th>
                ))}
                <th className="p-2.5 border border-brand-border-light dark:border-brand-border-dark text-center font-sans text-brand-text-light dark:text-brand-text-dark whitespace-nowrap">Total Score</th>
              </tr>
            </thead>
            <tbody>
              {calculatedScores.map((option, optIndex) => (
                <tr key={option.id} className={`${optIndex === 0 && calculatedScores.length > 1 ? 'bg-brand-accent/[0.05] dark:bg-brand-accent/[0.1]' : 'hover:bg-zinc-200/[0.3] dark:hover:bg-zinc-700/[0.3]'} transition-colors group`}>
                  <td className="p-2.5 border border-brand-border-light dark:border-brand-border-dark text-brand-text-light dark:text-brand-text-dark font-medium font-mono sticky left-0 z-10 bg-brand-card-light dark:bg-brand-card-dark group-hover:bg-opacity-50 whitespace-nowrap">
                    {option.name}
                    <Tooltip text="Delete option">
                        <button onClick={() => deleteOption(option.id)} className={`${secondaryButtonClass} ml-1.5`} aria-label={`Delete option ${option.name}`}>
                            <UI_ICONS.Delete size={12} />
                        </button>
                    </Tooltip>
                  </td>
                  {criteria.map(c => (
                    <td key={c.id} className={`p-0 border border-brand-border-light dark:border-brand-border-dark text-center ${getScoreColor(option.scores[c.id] || 0)}`}>
                      <input
                        type="number"
                        min="1" max="10"
                        value={option.scores[c.id] || ''}
                        onChange={(e) => updateOptionScore(option.id, c.id, e.target.value)}
                        className={`w-full h-full p-2.5 text-center bg-transparent border-none focus:ring-1 focus:ring-white focus:outline-none rounded-none text-xs font-mono ${(option.scores[c.id]||0) < 5 && (option.scores[c.id]||0) > 0 ? 'text-brand-text-light dark:text-brand-text-dark' : (option.scores[c.id]||0) >= 8 ? 'text-brand-accent-text' : 'text-brand-text-light dark:text-brand-text-dark'}`}
                        title={`Score for ${option.name} on ${c.name} (1-10)`}
                        aria-label={`Score for ${option.name} on ${c.name}`}
                      />
                    </td>
                  ))}
                  <td className={`p-2.5 border border-brand-border-light dark:border-brand-border-dark text-center font-semibold text-md font-mono ${optIndex === 0 && calculatedScores.length > 1 ? 'text-brand-accent' : 'text-brand-text-light dark:text-brand-text-dark'}`}>
                    {option.finalScore.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark py-10 text-sm">Add options and criteria to build your decision matrix.</p>
        )}
      </div>
      {calculatedScores.length > 0 && (
        <div className="mt-6 p-4 bg-brand-card-light dark:bg-brand-card-dark rounded-lg border border-brand-border-light dark:border-brand-border-dark shadow-sm text-center">
          <h4 className="text-md font-sans font-semibold text-brand-text-light dark:text-brand-text-dark">
            Top Choice: <span className="text-brand-accent">{calculatedScores[0].name}</span> (Score: {calculatedScores[0].finalScore.toFixed(1)})
          </h4>
        </div>
      )}
    </ToolPageLayout>
  );
};

export default DecisionMatrixPage;
