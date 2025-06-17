
import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SWOTItem, SWOTCategory, ToolKey } from '../types';
import { TOOLS_CONFIG, SWOT_CATEGORY_ICONS, SWOT_CATEGORY_COLORS, UI_ICONS, EDUCATIONAL_CONTENT } from '../constants';
import ToolPageLayout from '../components/ToolPageLayout';
import useLocalStorage from '../hooks/useLocalStorage';
import Tooltip from '../components/Tooltip';

const SWOTAnalysisPage: React.FC = () => {
  const tool = TOOLS_CONFIG.find(t => t.key === ToolKey.SWOT_ANALYSIS)!;
  const [items, setItems] = useLocalStorage<SWOTItem[]>(`great7-${ToolKey.SWOT_ANALYSIS}-items`, []);
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SWOTCategory>(SWOTCategory.STRENGTHS);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const inputBaseClass = "font-mono p-2.5 w-full border border-brand-border-light dark:border-brand-border-dark rounded-md focus:ring-1 focus:ring-brand-accent bg-brand-bg-light dark:bg-brand-bg-dark text-brand-text-light dark:text-brand-text-dark placeholder-brand-text-muted-light dark:placeholder-brand-text-muted-dark text-sm";
  const primaryButtonClass = "font-sans px-5 py-2.5 bg-brand-accent text-brand-accent-text text-sm font-medium rounded-md transition-colors shadow-sm hover:bg-brand-accent-hover flex items-center justify-center";
  const selectBaseClass = "font-mono p-2.5 border border-brand-border-light dark:border-brand-border-dark rounded-md focus:ring-1 focus:ring-brand-accent bg-brand-bg-light dark:bg-brand-bg-dark text-brand-text-light dark:text-brand-text-dark text-sm";


  const addItem = useCallback(() => {
    if (newItemText.trim() === '') return;
    setItems(prevItems => [...prevItems, { id: uuidv4(), text: newItemText.trim(), category: selectedCategory }]);
    setNewItemText('');
  }, [newItemText, selectedCategory, setItems]);

  const deleteItem = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, [setItems]);

  const startEditItem = useCallback((item: SWOTItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  }, []);

  const saveEditItem = useCallback((id: string) => {
    if (editingText.trim() === '') {
      deleteItem(id);
    } else {
      setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, text: editingText.trim() } : item));
    }
    setEditingItemId(null);
    setEditingText('');
  }, [editingText, setItems, deleteItem]);

  const categories = useMemo(() => [
    SWOTCategory.STRENGTHS,
    SWOTCategory.WEAKNESSES,
    SWOTCategory.OPPORTUNITIES,
    SWOTCategory.THREATS
  ], []);

  const itemsByCategory = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat] = items.filter(item => item.category === cat);
      return acc;
    }, {} as Record<SWOTCategory, SWOTItem[]>);
  }, [items, categories]);

  const calculateSwotScore = useCallback(() => {
    const strengthsCount = itemsByCategory[SWOTCategory.STRENGTHS].length;
    const opportunitiesCount = itemsByCategory[SWOTCategory.OPPORTUNITIES].length;
    const weaknessesCount = itemsByCategory[SWOTCategory.WEAKNESSES].length;
    const threatsCount = itemsByCategory[SWOTCategory.THREATS].length;
    
    const totalItems = items.length;
    if (totalItems === 0) return "0/10";

    // Base score on proportion of positive factors
    let score = ((strengthsCount + opportunitiesCount) / totalItems) * 10;

    // Penalize if weaknesses/threats are significant
    if (weaknessesCount > strengthsCount && strengthsCount > 0) score -= 1.5;
    else if (weaknessesCount > 0) score -= 0.5 * weaknessesCount;

    if (threatsCount > opportunitiesCount && opportunitiesCount > 0) score -= 1.5;
    else if (threatsCount > 0) score -= 0.5 * threatsCount;
    
    return `${Math.max(0, Math.min(10, parseFloat(score.toFixed(1))))}/10`;
  }, [itemsByCategory, items.length]);

  const swotScore = useMemo(() => calculateSwotScore(), [calculateSwotScore]);

  const getShareMessage = useCallback(() => {
    if (items.length === 0) return "My SWOT Analysis is ready for insights!";
    return `My SWOT Analysis (${swotScore}): Strengths (${itemsByCategory[SWOTCategory.STRENGTHS].length}), Weaknesses (${itemsByCategory[SWOTCategory.WEAKNESSES].length}), Opportunities (${itemsByCategory[SWOTCategory.OPPORTUNITIES].length}), Threats (${itemsByCategory[SWOTCategory.THREATS].length}). ${tool.tagline}`;
  }, [items.length, swotScore, itemsByCategory, tool.tagline]);

  return (
    <ToolPageLayout 
      tool={tool} 
      exportContentId="swot-analysis-content" 
      getShareMessage={getShareMessage}
    >
      <div className="mb-5 flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Enter item (e.g., 'Strong brand recognition')"
          className={`${inputBaseClass} flex-grow`}
          aria-label="New SWOT item text"
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as SWOTCategory)}
          className={`${selectBaseClass} sm:w-auto`}
          aria-label="Select SWOT category"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={addItem}
          className={primaryButtonClass}
          aria-label="Add SWOT item"
        >
          <UI_ICONS.Add size={18} className="mr-1.5" /> Add Item
        </button>
      </div>

      <div id="swot-analysis-content" className="p-1 sm:p-2">
        {items.length > 0 && (
            <div className="mb-5 text-center p-3 bg-brand-accent/[0.05] dark:bg-brand-accent/[0.1] border border-brand-accent rounded-md">
                <h3 className="font-sans text-lg font-semibold text-brand-accent">
                    SWOT Score: <span className="font-bold">{swotScore}</span>
                </h3>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {categories.map((categoryName) => {
            const CategoryIcon = SWOT_CATEGORY_ICONS[categoryName];
            return (
              <div
                key={categoryName}
                className={`${SWOT_CATEGORY_COLORS[categoryName]} p-3.5 rounded-lg border-2 min-h-[200px] shadow-sm flex flex-col`}
              >
                <h3 className="font-sans text-lg font-medium mb-3 flex items-center text-brand-text-light dark:text-brand-text-dark">
                  <CategoryIcon className="mr-2 h-5 w-5 text-brand-accent" />
                  {categoryName}
                </h3>
                <div className="space-y-2 flex-grow overflow-y-auto pr-0.5 max-h-60 sm:max-h-none font-mono">
                  {itemsByCategory[categoryName].map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-brand-bg-light dark:bg-zinc-900 border border-brand-border-light dark:border-brand-border-dark rounded-md shadow-subtle text-brand-text-light dark:text-brand-text-dark group text-sm"
                    >
                      {editingItemId === item.id ? (
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={() => saveEditItem(item.id)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEditItem(item.id)}
                            autoFocus
                            className="flex-grow text-xs bg-transparent border-b border-brand-border-dark focus:outline-none focus:border-brand-accent font-mono"
                          />
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="break-words w-[calc(100%-3.5rem)] text-xs font-mono">{item.text}</span>
                          <div className="flex space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip text="Edit item">
                              <button onClick={() => startEditItem(item)} className="p-1 hover:text-brand-accent" aria-label={`Edit ${item.text}`}>
                                <UI_ICONS.Edit size={14} />
                              </button>
                            </Tooltip>
                            <Tooltip text="Delete item">
                              <button onClick={() => deleteItem(item.id)} className="p-1 hover:text-red-500 dark:hover:text-red-400" aria-label={`Delete ${item.text}`}>
                                <UI_ICONS.Delete size={14} />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                   {itemsByCategory[categoryName].length === 0 && (
                    <p className="text-xs font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark mt-3 text-center italic flex-grow flex items-center justify-center">No items added to {categoryName}.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default SWOTAnalysisPage;
