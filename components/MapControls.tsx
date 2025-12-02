
import React, { useState } from 'react';
import { Group } from '../App';


// Presets Definition
const PRESETS = {
  MEA: ["DZ","EG","LY","MA","TN","SA","AE","QA","BH","KW","OM","YE","IQ","JO","LB"],
  LATAM: ["AR","BO","BR","CL","CO","CR","CU","DO","EC","SV","GT","HN","MX","NI","PA","PY","PE","UY","VE"],
  EU: ["AL","AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","MD","NL","PL","PT","RO","SK","SI","ES","SE"],
  CEE: ["AL","BA","BG","HR","CZ","EE","HU","LV","LT","PL","RO","RS","SK","SI","MK","ME","XK"],
  GCC: ["SA","AE","QA","BH","KW","OM"],
  GLOBAL_SOUTH: ["AF","NG","ZA","KE","TZ","UG","GH","DZ","MA","TN","EG","BD","PK","IN","PH","ID","BR","MX","CO","PE"],
};

interface MapControlsProps {
  mode: 'single' | 'multi';
  setMode: (m: 'single' | 'multi') => void;

  // Single Mode Props
  singleText: string;
  setSingleText: (t: string) => void;
  singleColor: string;
  setSingleColor: (c: string) => void;

  // Multi Mode Props
  groups: Group[];
  updateGroup: (id: string, field: keyof Group, value: any) => void;
  addGroup: () => void;
  removeGroup: (id: string) => void;

  // General
  onGenerate: () => void;
  onExport: (opts: { backgroundColor: string; title: string; subtitle: string; format: 'png' | 'jpeg' }) => void;
  unknownTerms: string[];

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Preset Action
  applyPreset: (isoCodes: string[]) => void;
  clearAll: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  mode, setMode,
  singleText, setSingleText, singleColor, setSingleColor,
  groups, updateGroup, addGroup, removeGroup,
  onGenerate, onExport, unknownTerms,
  isDarkMode, toggleTheme,
  applyPreset, clearAll
}) => {
  
  // Export UI State
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportTitle, setExportTitle] = useState('');
  const [exportSubtitle, setExportSubtitle] = useState('');
  const [exportBg, setExportBg] = useState(isDarkMode ? '#1e293b' : '#ffffff');
  const [useTransparentBg, setUseTransparentBg] = useState(false);

  // Helper styles
  const inputBase = `w-full text-sm border rounded-lg p-2 outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`;
  const labelBase = `text-xs font-semibold uppercase tracking-wider mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`;
  const btnBase = `py-2 px-4 rounded-lg font-semibold text-sm transition-colors shadow-sm`;

  return (
    <div className={`flex flex-col h-full w-full md:w-96 border-b md:border-b-0 md:border-r ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-gray-200 text-gray-800'}`}>

      {/* Header */}
      <div className={`p-4 md:p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Map Controls
          </h2>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Mode Toggles */}
        <div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
          <button
            onClick={() => setMode('single')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'single' ? (isDarkMode ? 'bg-slate-600 text-white shadow' : 'bg-white text-blue-600 shadow') : 'text-gray-500 hover:text-gray-700'}`}
          >
            Single Color
          </button>
          <button
            onClick={() => setMode('multi')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'multi' ? (isDarkMode ? 'bg-slate-600 text-white shadow' : 'bg-white text-blue-600 shadow') : 'text-gray-500 hover:text-gray-700'}`}
          >
            Multi-Group
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 md:gap-6 overflow-y-auto">
        
        {/* Presets Bar */}
        <div>
           <label className={labelBase}>Quick Presets</label>
           <div className="flex flex-wrap gap-2">
             {Object.entries(PRESETS).map(([name, codes]) => (
               <button
                 key={name}
                 onClick={() => applyPreset(codes)}
                 className={`px-2 py-1 text-xs rounded border transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-200 hover:bg-gray-50'}`}
               >
                 {name.replace('_', ' ')}
               </button>
             ))}
             <button
               onClick={clearAll}
               className={`px-2 py-1 text-xs rounded border text-red-500 transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-200 hover:bg-red-50'}`}
             >
               Clear
             </button>
           </div>
        </div>

        {mode === 'single' ? (
          /* Single Mode Input */
          <div className="flex flex-col gap-4">
             <textarea
               className={`${inputBase} h-40 resize-y`}
               placeholder="e.g. United States, UAE, India..."
               value={singleText}
               onChange={(e) => setSingleText(e.target.value)}
             />
             
             <div className="flex items-center gap-3">
               <input
                 type="color"
                 value={singleColor}
                 onChange={(e) => setSingleColor(e.target.value)}
                 className="h-10 w-14 p-0 border-0 rounded cursor-pointer bg-transparent"
               />
               <span className="text-sm font-mono opacity-80">{singleColor}</span>
             </div>
          </div>
        ) : (
          /* Multi Mode Groups */
          <div className="flex flex-col gap-4">
            {groups.map((group, index) => (
              <div key={group.id} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold opacity-50">GROUP {index + 1}</span>
                  <button onClick={() => removeGroup(group.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
                
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className={`${inputBase} flex-1`}
                    placeholder="Group Name"
                    value={group.name}
                    onChange={(e) => updateGroup(group.id, 'name', e.target.value)}
                  />
                  <input
                    type="color"
                    className="h-10 w-10 rounded cursor-pointer border-0 bg-transparent"
                    value={group.color}
                    onChange={(e) => updateGroup(group.id, 'color', e.target.value)}
                  />
                </div>
                
                <textarea
                  className={`${inputBase} h-24 text-xs`}
                  placeholder="Countries..."
                  value={group.textInput}
                  onChange={(e) => updateGroup(group.id, 'textInput', e.target.value)}
                />
              </div>
            ))}
            
            <button
              onClick={addGroup}
              className={`w-full py-2 border border-dashed rounded-lg text-sm ${isDarkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-800' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
            >
              + Add Group
            </button>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          className={`${btnBase} bg-blue-600 hover:bg-blue-700 text-white w-full`}
        >
          Generate Region & Zoom
        </button>

        {/* Unknown Terms Warning */}
        {unknownTerms.length > 0 && (
          <div className={`text-xs p-3 rounded-md border ${isDarkMode ? 'bg-amber-900/20 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            <strong>Unknown:</strong> {unknownTerms.join(', ')}
          </div>
        )}

        <hr className={isDarkMode ? 'border-slate-800' : 'border-gray-200'} />

        {/* Export Section */}
        <div>
          <button 
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="flex items-center justify-between w-full text-sm font-semibold mb-3 opacity-80 hover:opacity-100"
          >
            <span>Export Options</span>
            <span>{showExportOptions ? '−' : '+'}</span>
          </button>
          
          {showExportOptions && (
             <div className="flex flex-col gap-3 mb-4 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="text" 
                  placeholder="Map Title (Optional)"
                  className={inputBase}
                  value={exportTitle}
                  onChange={e => setExportTitle(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Subtitle (Optional)"
                  className={inputBase}
                  value={exportSubtitle}
                  onChange={e => setExportSubtitle(e.target.value)}
                />
                
                <div className="flex items-center gap-3">
                   <label className="text-xs opacity-70">Background:</label>
                   <div className="flex items-center gap-2">
                     <input 
                       type="checkbox" 
                       id="transparentCheck"
                       checked={useTransparentBg}
                       onChange={e => setUseTransparentBg(e.target.checked)}
                     />
                     <label htmlFor="transparentCheck" className="text-xs">Transparent</label>
                   </div>
                   {!useTransparentBg && (
                     <input 
                       type="color" 
                       value={exportBg}
                       onChange={e => setExportBg(e.target.value)}
                       className="h-6 w-8 rounded cursor-pointer"
                     />
                   )}
                </div>
             </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onExport({ backgroundColor: useTransparentBg ? 'transparent' : exportBg, title: exportTitle, subtitle: exportSubtitle, format: 'png' })}
              className={`${btnBase} border ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              Export PNG
            </button>
            <button
              onClick={() => onExport({ backgroundColor: useTransparentBg ? 'transparent' : exportBg, title: exportTitle, subtitle: exportSubtitle, format: 'jpeg' })}
              className={`${btnBase} border ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              Export JPG
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MapControls;
