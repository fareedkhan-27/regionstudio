
import React from 'react';

interface LegendProps {
  mode: 'single' | 'multi';
  groups: { id: string; name: string; color: string; ids: string[] }[];
  singleColor: string;
  isDarkMode: boolean;
}

const Legend: React.FC<LegendProps> = ({ mode, groups, singleColor, isDarkMode }) => {
  const textColor = isDarkMode ? 'text-slate-300' : 'text-gray-700';

  return (
    <div className={`w-full flex flex-wrap items-center gap-4 py-3 px-4 border-t ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
      <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
        Legend
      </span>
      
      {mode === 'single' && (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: singleColor }}></span>
          <span className={`text-sm font-medium ${textColor}`}>Selected Countries</span>
        </div>
      )}

      {mode === 'multi' && groups.map(group => (
        <div key={group.id} className="flex items-center gap-2">
          <span className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: group.color }}></span>
          <span className={`text-sm font-medium ${textColor}`}>
             {group.name || 'Untitled Group'} 
             <span className="opacity-50 ml-1 text-xs">({group.ids.length})</span>
          </span>
        </div>
      ))}
      
      {mode === 'multi' && groups.length === 0 && (
         <span className="text-sm text-gray-400 italic">No groups defined</span>
      )}
    </div>
  );
};

export default Legend;
