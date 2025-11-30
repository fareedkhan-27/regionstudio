
import React, { useState, useRef, useEffect, useMemo } from 'react';
import MapControls from './components/MapControls';
import WorldMap from './components/WorldMap';
import Legend from './components/Legend';
import { parseCountryInput } from './utils/countryLogic';
import { exportSvgAsImage } from './utils/exportImage';

export interface Group {
  id: string;
  name: string;
  color: string;
  textInput: string;
  ids: string[]; // Resolved ISO2 codes
}

const App: React.FC = () => {
  // --- UI State ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoomTrigger, setZoomTrigger] = useState(0);

  // --- Single Mode Data ---
  const [singleText, setSingleText] = useState('');
  const [singleColor, setSingleColor] = useState('#3b82f6');
  
  // --- Multi Mode Data ---
  const [groups, setGroups] = useState<Group[]>([
    { id: '1', name: 'Group A', color: '#ef4444', textInput: '', ids: [] },
    { id: '2', name: 'Group B', color: '#10b981', textInput: '', ids: [] }
  ]);

  // --- Derived State for Map ---
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [unknownTerms, setUnknownTerms] = useState<string[]>([]);

  // Theme auto-detect
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // --- Group Management Helpers ---
  const updateGroup = (id: string, field: keyof Group, value: any) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const addGroup = () => {
    const newId = Date.now().toString();
    const colors = ['#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const randomColor = colors[groups.length % colors.length];
    setGroups([...groups, { id: newId, name: `Group ${groups.length + 1}`, color: randomColor, textInput: '', ids: [] }]);
  };

  const removeGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  // --- Core Logic: Generate Region ---
  const handleGenerate = () => {
    let newColorMap: Record<string, string> = {};
    let allUnknowns: string[] = [];

    if (mode === 'single') {
      const { matchedIds, unknownTerms } = parseCountryInput(singleText);
      matchedIds.forEach(id => {
        newColorMap[id] = singleColor;
      });
      allUnknowns = unknownTerms;
    } else {
      // Process all groups. Last group wins logic handled by order of application.
      const updatedGroups = groups.map(g => {
        const { matchedIds, unknownTerms } = parseCountryInput(g.textInput);
        allUnknowns.push(...unknownTerms);
        return { ...g, ids: Array.from(matchedIds) };
      });
      
      // Update local group state with resolved IDs (optional, but good for debugging)
      setGroups(updatedGroups);

      updatedGroups.forEach(g => {
        g.ids.forEach(id => {
          newColorMap[id] = g.color;
        });
      });
    }

    setColorMap(newColorMap);
    setUnknownTerms([...new Set(allUnknowns)]); // Unique unknowns
    setZoomTrigger(prev => prev + 1); // Trigger zoom
  };

  // --- Presets Logic ---
  const applyPreset = (isoCodes: string[]) => {
    const joined = isoCodes.join(', ');
    if (mode === 'single') {
      setSingleText(prev => prev ? `${prev}, ${joined}` : joined);
    } else {
      // In multi-mode, apply to the last active group or the first one
      setGroups(prev => {
        const newGroups = [...prev];
        if (newGroups.length > 0) {
          const targetIndex = newGroups.length - 1; // Last group
          const currentText = newGroups[targetIndex].textInput;
          newGroups[targetIndex].textInput = currentText ? `${currentText}, ${joined}` : joined;
        }
        return newGroups;
      });
    }
  };

  const clearAll = () => {
    if (mode === 'single') {
      setSingleText('');
      setSingleColor('#3b82f6');
    } else {
      setGroups([{ id: Date.now().toString(), name: 'Group A', color: '#ef4444', textInput: '', ids: [] }]);
    }
    setColorMap({});
    setUnknownTerms([]);
  };

  // --- Export Logic ---
  const handleExport = (opts: { backgroundColor: string; title: string; subtitle: string; format: 'png' | 'jpeg' }) => {
    if (svgRef.current) {
      exportSvgAsImage(svgRef.current, {
        ...opts,
        filename: opts.title ? opts.title.replace(/\s+/g, '-').toLowerCase() : 'choropleth-map',
        darkMode: isDarkMode
      });
    }
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen w-screen overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
      
      {/* Sidebar Controls */}
      <div className="flex-shrink-0 z-20 h-full relative shadow-xl">
        <MapControls 
          mode={mode} setMode={setMode}
          singleText={singleText} setSingleText={setSingleText}
          singleColor={singleColor} setSingleColor={setSingleColor}
          groups={groups} updateGroup={updateGroup} addGroup={addGroup} removeGroup={removeGroup}
          onGenerate={handleGenerate} 
          onExport={handleExport}
          unknownTerms={unknownTerms}
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
          applyPreset={applyPreset}
          clearAll={clearAll}
        />
      </div>

      {/* Main Map Area */}
      <main className="flex-1 flex flex-col h-full w-full relative">
        <div className="flex-1 relative">
          <WorldMap 
            colorMap={colorMap}
            isDarkMode={isDarkMode}
            zoomTrigger={zoomTrigger}
            onMount={(el) => (svgRef.current = el)}
          />
        </div>
        
        {/* Legend Panel */}
        <Legend 
          mode={mode}
          groups={groups}
          singleColor={singleColor}
          isDarkMode={isDarkMode}
        />
      </main>
    </div>
  );
};

export default App;
