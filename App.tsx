import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
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
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
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

  // --- Reset Zoom Logic ---
  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity
      );
    }
  };

  return (
    <>
      {/* App Header */}
      <header
        className={`flex items-center gap-3 px-5 py-3 border-b ${
          isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'
        }`}
      >
        <img
          src="/logo/region-map-logo.svg"
          alt="Region Studio Logo"
          className="w-9 h-9"
        />

        <div className="leading-tight">
          <h1
            className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            Region Studio <span className="text-[#BE2BBB] text-xs font-normal ml-1">v1.1</span>
          </h1>
          <p
            className={`text-xs ${
              isDarkMode ? 'text-slate-400' : 'text-gray-500'
            }`}
          >
            Global Region Map Visualizer • by Fareed Khan
          </p>
        </div>
      </header>

      {/* Main Layout */}
      <div
        className={`flex flex-col md:flex-row h-[calc(100vh-68px)] w-full overflow-hidden ${
          isDarkMode ? 'bg-slate-950' : 'bg-gray-50'
        }`}
      >
        {/* Sidebar Controls */}
        <div className="flex-shrink-0 z-20 h-[50vh] md:h-full w-full md:w-auto relative shadow-xl md:shadow-none">
          <MapControls
            mode={mode}
            setMode={setMode}
            singleText={singleText}
            setSingleText={setSingleText}
            singleColor={singleColor}
            setSingleColor={setSingleColor}
            groups={groups}
            updateGroup={updateGroup}
            addGroup={addGroup}
            removeGroup={removeGroup}
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
        <main className="flex-1 flex flex-col min-h-0 w-full relative">
          {/* Floating Reset Zoom Button */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-30">
            <button
              onClick={handleResetZoom}
              className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm font-medium shadow-lg border transition-all duration-200 backdrop-blur-sm touch-manipulation
                ${isDarkMode
                  ? 'bg-slate-800/95 text-slate-200 border-slate-600/50 hover:bg-slate-700 hover:shadow-xl active:bg-slate-600'
                  : 'bg-white/95 text-gray-700 border-gray-300/50 hover:bg-white hover:shadow-xl active:bg-gray-100'}`}
              aria-label="Reset map zoom to default view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="md:w-4 md:h-4"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              <span className="hidden sm:inline">Reset View</span>
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <WorldMap
              colorMap={colorMap}
              isDarkMode={isDarkMode}
              zoomTrigger={zoomTrigger}
              onMount={(el) => (svgRef.current = el)}
              onZoomBehaviorReady={(zoom) => (zoomBehaviorRef.current = zoom)}
            />
          </div>

          {/* Legend Panel */}
          <Legend
            mode={mode}
            groups={groups}
            singleColor={singleColor}
            isDarkMode={isDarkMode}
          />
          {/* Footer */}
          <footer
            className={`px-5 py-2 text-center text-[11px] ${
              isDarkMode ? 'text-slate-500' : 'text-gray-500'
            }`}
          >
            © {new Date().getFullYear()} Region Studio — Built with ❤️ by <span className="text-[#BE2BBB] font-medium">Fareed Khan</span>
          </footer>
        </main>
      </div>
    </>
  );
};

export default App;
