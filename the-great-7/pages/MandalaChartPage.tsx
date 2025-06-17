
import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ToolKey, MandalaChartData, MandalaCell, MANDALA_MAIN_CENTER_ID, MANDALA_GRID_SIZE } from '../types';
import { TOOLS_CONFIG, UI_ICONS, BRAND_THEME_COLORS } from '../constants';
import ToolPageLayout from '../components/ToolPageLayout';
import useLocalStorage from '../hooks/useLocalStorage';
import { ArrowLeft, Maximize2, Minimize2, Home } from 'lucide-react';
import Tooltip from '../components/Tooltip';

const DEFAULT_MAIN_THEME_TEXT = 'Main Theme';
const getDefaultSubThemeText = (r: number, c: number) => `Sub-theme ${r * MANDALA_GRID_SIZE + c + 1}`;
const getDefaultItemText = (r: number, c: number) => `Item ${r * MANDALA_GRID_SIZE + c + 1}`;


const createInitialMandalaData = (): MandalaChartData => {
  const cells: Record<string, MandalaCell> = {};
  const mainCenterId = MANDALA_MAIN_CENTER_ID;

  cells[mainCenterId] = {
    id: mainCenterId,
    parentId: null,
    text: DEFAULT_MAIN_THEME_TEXT,
    isCenterTopic: true,
    isExpandable: false, 
  };

  for (let r = 0; r < MANDALA_GRID_SIZE; r++) {
    for (let c = 0; c < MANDALA_GRID_SIZE; c++) {
      if (r === Math.floor(MANDALA_GRID_SIZE / 2) && c === Math.floor(MANDALA_GRID_SIZE / 2)) continue;
      const cellId = `${mainCenterId}_${r}_${c}`;
      cells[cellId] = {
        id: cellId,
        parentId: mainCenterId,
        text: getDefaultSubThemeText(r, c),
        isCenterTopic: false,
        isExpandable: true,
        gridRow: r,
        gridCol: c,
      };
    }
  }
  return { cells, activeCenterId: mainCenterId };
};

const MandalaChartPage: React.FC = () => {
  const tool = TOOLS_CONFIG.find(t => t.key === ToolKey.MANDALA_CHART)!;
  const [data, setData] = useLocalStorage<MandalaChartData>(
    `great7-${ToolKey.MANDALA_CHART}-data`,
    createInitialMandalaData()
  );
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const inputBaseClass = "font-mono p-2 w-full h-full text-center border-none focus:ring-2 focus:ring-brand-accent bg-transparent text-brand-text-light dark:text-brand-text-dark placeholder-brand-text-muted-light dark:placeholder-brand-text-muted-dark text-xs resize-none";
  const cellBaseClass = "aspect-square flex items-center justify-center p-1 border border-brand-border-light dark:border-brand-border-dark rounded-md shadow-sm transition-all";

  const activeGridCells = useMemo(() => {
    const grid: (MandalaCell | null)[][] = Array(MANDALA_GRID_SIZE).fill(null).map(() => Array(MANDALA_GRID_SIZE).fill(null));
    const centerCell = data.cells[data.activeCenterId];
    if (!centerCell) return grid;

    grid[Math.floor(MANDALA_GRID_SIZE / 2)][Math.floor(MANDALA_GRID_SIZE / 2)] = centerCell;

    Object.values(data.cells).forEach(cell => {
      if (cell.parentId === data.activeCenterId && cell.gridRow !== undefined && cell.gridCol !== undefined) {
        if(grid[cell.gridRow] && grid[cell.gridRow][cell.gridCol] === null) { 
            grid[cell.gridRow][cell.gridCol] = cell;
        }
      }
    });
    return grid;
  }, [data.cells, data.activeCenterId]);
  
  const startEditing = (cell: MandalaCell) => {
    setEditingCellId(cell.id);
    const isDefaultMain = cell.id === MANDALA_MAIN_CENTER_ID && cell.text === DEFAULT_MAIN_THEME_TEXT;
    const isDefaultSub = cell.parentId === MANDALA_MAIN_CENTER_ID && cell.text === getDefaultSubThemeText(cell.gridRow!, cell.gridCol!);
    // Check if the cell is a grandchild and if its text is the default "Item X"
    const parentCell = cell.parentId ? data.cells[cell.parentId] : null;
    const isDefaultItem = parentCell && parentCell.parentId === MANDALA_MAIN_CENTER_ID && // Ensure it's a grandchild of main for "Item X"
                          cell.text === getDefaultItemText(cell.gridRow!, cell.gridCol!);


    if (isDefaultMain || isDefaultSub || isDefaultItem) {
      setEditingText('');
    } else {
      setEditingText(cell.text);
    }
  };

  const finishEditing = useCallback(() => {
    if (editingCellId) {
      let textToSave = editingText.trim();
      const originalCell = data.cells[editingCellId];

      if (textToSave === "") { // Revert to default placeholder if empty
        if (originalCell.id === MANDALA_MAIN_CENTER_ID) {
          textToSave = DEFAULT_MAIN_THEME_TEXT;
        } else if (originalCell.parentId === MANDALA_MAIN_CENTER_ID) { // Child of main center
          textToSave = getDefaultSubThemeText(originalCell.gridRow!, originalCell.gridCol!);
        } else { // Grandchild or deeper
          textToSave = getDefaultItemText(originalCell.gridRow!, originalCell.gridCol!);
        }
      }
      
      setData(prevData => ({
        ...prevData,
        cells: {
          ...prevData.cells,
          [editingCellId]: { ...prevData.cells[editingCellId], text: textToSave },
        },
      }));
    }
    setEditingCellId(null);
    setEditingText('');
  }, [editingCellId, editingText, data.cells, setData]);
  
  const navigateToGrid = useCallback((targetCenterId: string) => {
    if (editingCellId === targetCenterId) { // If trying to expand the cell currently being edited
        finishEditing(); // Save it first
    } else if (editingCellId) { // If editing another cell
        finishEditing();
    }


    setData(prevData => {
      const newCells = { ...prevData.cells };
  
      if (!newCells[targetCenterId]) {
        console.error("Target center cell for navigation not found:", targetCenterId);
        return prevData;
      }
      
      newCells[targetCenterId] = { 
        ...newCells[targetCenterId], 
        isCenterTopic: true, 
        isExpandable: false 
      };
  
      for (let r = 0; r < MANDALA_GRID_SIZE; r++) {
        for (let c = 0; c < MANDALA_GRID_SIZE; c++) {
          if (r === Math.floor(MANDALA_GRID_SIZE / 2) && c === Math.floor(MANDALA_GRID_SIZE / 2)) {
            continue; 
          }
  
          const childCellId = `${targetCenterId}_${r}_${c}`;
          if (!newCells[childCellId]) { 
            newCells[childCellId] = {
              id: childCellId,
              parentId: targetCenterId,
              text: getDefaultItemText(r,c), 
              isCenterTopic: false,
              isExpandable: true,   
              gridRow: r,
              gridCol: c,
            };
          } else {
            newCells[childCellId] = {
              ...newCells[childCellId],
              parentId: targetCenterId, 
              isCenterTopic: false,    
              isExpandable: true,    
            };
          }
        }
      }
      return { ...prevData, cells: newCells, activeCenterId: targetCenterId };
    });
  }, [setData, editingCellId, finishEditing]); 
  
  const goBack = useCallback(() => {
    if (editingCellId) finishEditing();

    setData(prevData => {
      const currentActiveCell = prevData.cells[prevData.activeCenterId];
      if (!currentActiveCell || !currentActiveCell.parentId) return prevData; 
  
      const newParentCenterId = currentActiveCell.parentId;
      const newCells = { ...prevData.cells };
  
      newCells[newParentCenterId] = {
        ...newCells[newParentCenterId],
        isCenterTopic: true,
        isExpandable: false,
      };
  
      newCells[currentActiveCell.id] = {
        ...newCells[currentActiveCell.id],
        isCenterTopic: false,
        isExpandable: true, 
      };
  
      return { ...prevData, cells: newCells, activeCenterId: newParentCenterId };
    });
  }, [setData, editingCellId, finishEditing]); 
  
  const goToMain = useCallback(() => {
    if (editingCellId) finishEditing();
     setData(prevData => {
      if (prevData.activeCenterId === MANDALA_MAIN_CENTER_ID) return prevData; 

      const newCells = { ...prevData.cells };
      
      if (newCells[prevData.activeCenterId]) {
         newCells[prevData.activeCenterId] = {
          ...newCells[prevData.activeCenterId],
          isCenterTopic: false,
          isExpandable: true,
        };
      }
       
      newCells[MANDALA_MAIN_CENTER_ID] = {
        ...newCells[MANDALA_MAIN_CENTER_ID],
        isCenterTopic: true,
        isExpandable: false,
      };
      return { ...prevData, cells: newCells, activeCenterId: MANDALA_MAIN_CENTER_ID };
     });
  }, [setData, editingCellId, finishEditing]);

  const getShareMessage = useCallback(() => {
    const centerCell = data.cells[data.activeCenterId];
    if (!centerCell) return "Exploring ideas with my Mandala Chart!";
    return `My Mandala Chart is centered on "${centerCell.text}". ${tool.tagline}`;
  }, [data.cells, data.activeCenterId, tool.tagline]);
  
  const currentCenterCell = data.cells[data.activeCenterId];

  const handleCellClick = (cell: MandalaCell) => {
    if (editingCellId === cell.id) return; 
    if (editingCellId) finishEditing(); 
    startEditing(cell);
  };

  const handleCellDoubleClick = (cell: MandalaCell) => {
    if (cell.isExpandable && cell.id !== data.activeCenterId) {
        navigateToGrid(cell.id);
    } else if (cell.id === data.activeCenterId && editingCellId !== cell.id) { // Allow double click to edit center if not already editing
        startEditing(cell);
    }
  };

  const hasNonDefaultChildren = (cellId: string): boolean => {
    return Object.values(data.cells).some(c => {
        if (c.parentId !== cellId) return false;
        // Check if it's a direct child of the main center (uses getDefaultSubThemeText)
        if (cellId === MANDALA_MAIN_CENTER_ID) {
            return c.text !== getDefaultSubThemeText(c.gridRow!, c.gridCol!) && c.text.trim() !== "";
        }
        // Otherwise, it's a child of another sub-theme (uses getDefaultItemText)
        return c.text !== getDefaultItemText(c.gridRow!, c.gridCol!) && c.text.trim() !== "";
    });
  };


  return (
    <ToolPageLayout tool={tool} exportContentId="mandala-chart-content" getShareMessage={getShareMessage}>
      <div className="mb-4 flex items-center justify-between">
        <div>
        {currentCenterCell && currentCenterCell.parentId && (
          <button
            onClick={goBack}
            className="font-sans px-3 py-1.5 bg-brand-card-light dark:bg-brand-card-dark border border-brand-border-light dark:border-brand-border-dark text-brand-text-light dark:text-brand-text-dark text-xs font-medium rounded-md transition-colors shadow-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center"
          >
            <ArrowLeft size={14} className="mr-1" /> Back to "{data.cells[currentCenterCell.parentId]?.text || 'Parent'}"
          </button>
        )}
        </div>
        <h2 className="text-lg font-sans font-semibold text-brand-text-light dark:text-brand-text-dark text-center flex-grow px-2 truncate" title={currentCenterCell?.text}>
          {currentCenterCell?.text || "Mandala View"}
        </h2>
         <div>
         {currentCenterCell && currentCenterCell.id !== MANDALA_MAIN_CENTER_ID && (
           <button
            onClick={goToMain}
            className="font-sans px-3 py-1.5 bg-brand-card-light dark:bg-brand-card-dark border border-brand-border-light dark:border-brand-border-dark text-brand-text-light dark:text-brand-text-dark text-xs font-medium rounded-md transition-colors shadow-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center"
          >
            <Home size={14} className="mr-1" /> Go to Main Theme
          </button>
         )}
         </div>
      </div>
      <div id="mandala-chart-content" className="p-2 bg-brand-bg-light dark:bg-brand-bg-dark rounded-lg">
        <div className={`grid grid-cols-${MANDALA_GRID_SIZE} gap-2 max-w-md sm:max-w-xl mx-auto`}>
          {activeGridCells.map((row, rIndex) =>
            row.map((cell, cIndex) => {
              if (!cell) {
                return <div key={`empty-${rIndex}-${cIndex}`} className={`${cellBaseClass} bg-brand-border-light/[0.2] dark:bg-brand-border-dark/[0.2]`}></div>;
              }
              const isCenterOfDisplayedGrid = cell.id === data.activeCenterId;
              
              return (
                <div
                  key={cell.id}
                  className={`${cellBaseClass} 
                    ${isCenterOfDisplayedGrid ? 'bg-brand-accent/[0.15] dark:bg-brand-accent/[0.25] border-brand-accent scale-105 shadow-lg' : 'bg-brand-card-light dark:bg-brand-card-dark hover:shadow-md'}
                    ${cell.isExpandable && !isCenterOfDisplayedGrid ? 'cursor-pointer hover:ring-2 hover:ring-brand-accent/[0.5]' : ''}
                    ${!cell.isExpandable && !isCenterOfDisplayedGrid ? 'cursor-text' : ''} 
                  `}
                  onClick={() => handleCellClick(cell)}
                  onDoubleClick={() => handleCellDoubleClick(cell)}
                  title={isCenterOfDisplayedGrid ? cell.text : (cell.isExpandable ? `${cell.text} (Double-click to expand)` : cell.text)}
                >
                  {editingCellId === cell.id ? (
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault(); 
                           finishEditing();
                        }
                      }}
                      autoFocus
                      className={inputBaseClass}
                    />
                  ) : (
                    <span className={`font-mono text-xs text-center break-words line-clamp-3 ${isCenterOfDisplayedGrid ? 'font-semibold text-brand-accent' : 'text-brand-text-light dark:text-brand-text-dark'}`}>
                      {cell.text || (isCenterOfDisplayedGrid ? DEFAULT_MAIN_THEME_TEXT : (cell.parentId === MANDALA_MAIN_CENTER_ID ? getDefaultSubThemeText(cell.gridRow!, cell.gridCol!) : getDefaultItemText(cell.gridRow!, cell.gridCol!)))}
                    </span>
                  )}
                  {cell.isExpandable && !isCenterOfDisplayedGrid && hasNonDefaultChildren(cell.id) && (
                     <div className="absolute bottom-1 right-1">
                      <Tooltip text="Contains further details" position="top">
                        <Maximize2 size={12} className="text-brand-text-muted-light dark:text-brand-text-muted-dark opacity-70" />
                      </Tooltip>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
       <p className="text-xs text-center font-mono text-brand-text-muted-light dark:text-brand-text-muted-dark mt-4 max-w-xl mx-auto">
        Click a cell to edit its text. Double-click a surrounding cell to expand it.
        The <Maximize2 size={10} className="inline align-middle"/> icon indicates a cell has been expanded and contains details.
      </p>
    </ToolPageLayout>
  );
};

export default MandalaChartPage;
    