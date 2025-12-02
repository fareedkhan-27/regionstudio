
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
  // Use 16px font (text-base) on mobile to prevent auto-zoom, text-sm on desktop
  const inputBase = `w-full text-base md:text-sm border rounded-lg p-2 outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`;
  const labelBase = `text-xs font-semibold uppercase tracking-wider mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`;
  const btnBase = `py-2 px-4 rounded-lg font-semibold text-sm transition-colors shadow-sm`;

  return (
    <div className={`flex flex-col h-full w-full md:w-96 border-b md:border-b-0 md:border-r ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-gray-200 text-gray-800'}`}>

      {/* Compact Header */}
      <div className={`px-3 py-2 md:p-4 md:pb-3 border-b flex-shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
        <div className="flex justify-between items-center mb-2 md:mb-3">
          <h2 className={`text-xs md:text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            Controls
          </h2>
          <button
            onClick={toggleTheme}
            className={`p-1.5 md:p-2 rounded-full text-lg md:text-base ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Mode Toggles */}
        <div className={`flex p-0.5 md:p-1 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
          <button
            onClick={() => setMode('single')}
            className={`flex-1 py-1 md:py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'single' ? (isDarkMode ? 'bg-slate-600 text-white shadow' : 'bg-white text-blue-600 shadow') : 'text-gray-500 hover:text-gray-700'}`}
          >
            Single
          </button>
          <button
            onClick={() => setMode('multi')}
            className={`flex-1 py-1 md:py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'multi' ? (isDarkMode ? 'bg-slate-600 text-white shadow' : 'bg-white text-blue-600 shadow') : 'text-gray-500 hover:text-gray-700'}`}
          >
            Multi
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-3 md:p-6 flex flex-col gap-3 md:gap-5">

        {/* Presets Bar - Compact on Mobile */}
        <div>
           <label className={`${labelBase} text-[10px] md:text-xs`}>Presets</label>
           <div className="flex flex-wrap gap-1.5 md:gap-2">
             {Object.entries(PRESETS).map(([name, codes]) => (
               <button
                 key={name}
                 onClick={() => applyPreset(codes)}
                 className={`px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded border transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-200 hover:bg-gray-50'}`}
               >
                 {name.replace('_', ' ')}
               </button>
             ))}
             <button
               onClick={clearAll}
               className={`px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded border text-red-500 transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-200 hover:bg-red-50'}`}
             >
               Clear
             </button>
           </div>
        </div>

        {mode === 'single' ? (
          /* Single Mode Input */
          <div className="flex flex-col gap-3">
             <textarea
               className={`${inputBase} h-24 md:h-32 resize-none`}
               placeholder="e.g. US, UAE, India..."
               value={singleText}
               onChange={(e) => setSingleText(e.target.value)}
             />

             <div className="flex items-center gap-2 md:gap-3">
               <input
                 type="color"
                 value={singleColor}
                 onChange={(e) => setSingleColor(e.target.value)}
                 className="h-9 md:h-10 w-12 md:w-14 p-0 border-0 rounded cursor-pointer bg-transparent"
               />
               <span className="text-xs md:text-sm font-mono opacity-80">{singleColor}</span>
             </div>
          </div>
        ) : (
          /* Multi Mode Groups */
          <div className="flex flex-col gap-2.5 md:gap-3">
            {groups.map((group, index) => (
              <div key={group.id} className={`p-2.5 md:p-3 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex justify-between items-center mb-1.5 md:mb-2">
                  <span className="text-[10px] md:text-xs font-bold opacity-50">GROUP {index + 1}</span>
                  <button onClick={() => removeGroup(group.id)} className="text-[10px] md:text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>

                <div className="flex gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                  <input
                    type="text"
                    className={`${inputBase} flex-1`}
                    placeholder="Group Name"
                    value={group.name}
                    onChange={(e) => updateGroup(group.id, 'name', e.target.value)}
                  />
                  <input
                    type="color"
                    className="h-8 md:h-9 w-8 md:w-9 rounded cursor-pointer border-0 bg-transparent"
                    value={group.color}
                    onChange={(e) => updateGroup(group.id, 'color', e.target.value)}
                  />
                </div>

                <textarea
                  className={`${inputBase} h-16 md:h-20 resize-none`}
                  placeholder="Countries..."
                  value={group.textInput}
                  onChange={(e) => updateGroup(group.id, 'textInput', e.target.value)}
                />
              </div>
            ))}

            <button
              onClick={addGroup}
              className={`w-full py-1.5 md:py-2 border border-dashed rounded-lg text-xs md:text-sm ${isDarkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-800' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
            >
              + Add Group
            </button>
          </div>
        )}

        {/* Generate Button - Prominent */}
        <button
          onClick={onGenerate}
          className={`w-full py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-colors shadow-md bg-blue-600 hover:bg-blue-700 text-white`}
        >
          🗺️ Generate Map
        </button>

        {/* Unknown Terms Warning */}
        {unknownTerms.length > 0 && (
          <div className={`text-[10px] md:text-xs p-2 md:p-3 rounded-md border ${isDarkMode ? 'bg-amber-900/20 border-amber-800 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            <strong>Unknown:</strong> {unknownTerms.join(', ')}
          </div>
        )}

        <hr className={`${isDarkMode ? 'border-slate-800' : 'border-gray-200'} my-1`} />

        {/* Export Section - Compact */}
        <div>
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="flex items-center justify-between w-full text-xs md:text-sm font-semibold mb-2 md:mb-3 opacity-80 hover:opacity-100"
          >
            <span>📤 Export</span>
            <span className="text-lg">{showExportOptions ? '−' : '+'}</span>
          </button>

          {showExportOptions && (
             <div className="flex flex-col gap-2 md:gap-3 mb-3 md:mb-4 animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  placeholder="Title (Optional)"
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

                <div className="flex items-center gap-2 md:gap-3 text-xs">
                   <label className="opacity-70">BG:</label>
                   <div className="flex items-center gap-1.5">
                     <input
                       type="checkbox"
                       id="transparentCheck"
                       checked={useTransparentBg}
                       onChange={e => setUseTransparentBg(e.target.checked)}
                       className="w-3.5 h-3.5"
                     />
                     <label htmlFor="transparentCheck" className="text-[10px] md:text-xs">Transparent</label>
                   </div>
                   {!useTransparentBg && (
                     <input
                       type="color"
                       value={exportBg}
                       onChange={e => setExportBg(e.target.value)}
                       className="h-6 w-7 md:w-8 rounded cursor-pointer"
                     />
                   )}
                </div>
             </div>
          )}

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <button
              onClick={() => onExport({ backgroundColor: useTransparentBg ? 'transparent' : exportBg, title: exportTitle, subtitle: exportSubtitle, format: 'png' })}
              className={`py-2 md:py-2.5 px-3 md:px-4 rounded-lg font-medium text-xs md:text-sm transition-colors shadow-sm border ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              PNG
            </button>
            <button
              onClick={() => onExport({ backgroundColor: useTransparentBg ? 'transparent' : exportBg, title: exportTitle, subtitle: exportSubtitle, format: 'jpeg' })}
              className={`py-2 md:py-2.5 px-3 md:px-4 rounded-lg font-medium text-xs md:text-sm transition-colors shadow-sm border ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              JPG
            </button>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};

export default MapControls;
