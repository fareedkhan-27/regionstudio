
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { FeatureCollection, GeometryObject } from 'geojson';
import { getIso2FromNumeric } from '../utils/countryLogic';

interface WorldMapProps {
  colorMap: Record<string, string>; // ISO2 -> Hex Color
  isDarkMode: boolean;
  zoomTrigger: number; // Increment to force zoom to selection
  onMount?: (svg: SVGSVGElement | null) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ colorMap, isDarkMode, zoomTrigger, onMount }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 960, height: 600 });
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);

  // Define theme colors
  const theme = useMemo(() => ({
    ocean: isDarkMode ? '#1e293b' : '#f8fafc', // slate-800 : slate-50
    defaultCountry: isDarkMode ? '#334155' : '#e2e8f0', // slate-700 : slate-200
    stroke: isDarkMode ? '#475569' : '#ffffff', // slate-600 : white
  }), [isDarkMode]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        const countries = topojson.feature(
          data as unknown as topojson.Topology,
          data.objects.countries as GeometryObject
        ) as FeatureCollection;
        
        setGeoData(countries);
      } catch (error) {
        console.error("Failed to load map data:", error);
      }
    };
    
    fetchData();
  }, []);

  // Pass ref up
  useEffect(() => {
    if (onMount) onMount(svgRef.current);
  }, [onMount, geoData]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current && svgRef.current.parentElement) {
        const { clientWidth, clientHeight } = svgRef.current.parentElement;
        if (clientWidth > 0 && clientHeight > 0) {
           setDimensions({ width: clientWidth, height: clientHeight });
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Setup D3 Zoom
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !gRef.current || !geoData) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current as any);

    zoomBehavior.current = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior.current);
  }, [geoData]);

  // Handle Auto-Zoom to selection
  useEffect(() => {
    if (!geoData || !svgRef.current || !zoomBehavior.current || zoomTrigger === 0) return;

    // 1. Identify features that have a color in the map
    const activeFeatures = geoData.features.filter(f => {
      const iso2 = getIso2FromNumeric(String(f.id));
      return iso2 && colorMap[iso2];
    });

    if (activeFeatures.length === 0) {
      // Reset zoom if nothing selected
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        zoomBehavior.current.transform, 
        d3.zoomIdentity
      );
      return;
    }

    // 2. Calculate bounds
    // We create a temporary FeatureCollection for d3.geoBounds
    const collection = { type: 'FeatureCollection', features: activeFeatures } as any;
    
    // We need the path generator with the CURRENT projection
    const projection = d3.geoNaturalEarth1()
      .fitSize([dimensions.width, dimensions.height], geoData)
      // Slight scale down to ensure borders fit
      .scale(d3.geoNaturalEarth1().fitSize([dimensions.width, dimensions.height], geoData).scale() * 0.95)
      .translate([dimensions.width / 2, dimensions.height / 2]);
    
    const path = d3.geoPath().projection(projection);
    const bounds = path.bounds(collection);

    // 3. Calculate Transform
    const [[x0, y0], [x1, y1]] = bounds;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const x = (x0 + x1) / 2;
    const y = (y0 + y1) / 2;
    
    // Scale with padding (0.9)
    const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / dimensions.width, dy / dimensions.height)));
    const translate = [dimensions.width / 2 - scale * x, dimensions.height / 2 - scale * y];

    const svg = d3.select(svgRef.current);
    svg.transition().duration(1000).call(
      zoomBehavior.current.transform,
      d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
    );

  }, [zoomTrigger, geoData, dimensions]); // Only run when trigger changes

  // Reset Zoom helper
  const resetZoom = () => {
    if (svgRef.current && zoomBehavior.current) {
       d3.select(svgRef.current)
         .transition()
         .duration(750)
         .call(zoomBehavior.current.transform, d3.zoomIdentity);
    }
  };

  // Projection Logic
  const { pathGenerator } = useMemo(() => {
    if (!geoData) return { pathGenerator: null };

    const projection = d3.geoNaturalEarth1()
      .fitSize([dimensions.width, dimensions.height], geoData)
      .scale(d3.geoNaturalEarth1().fitSize([dimensions.width, dimensions.height], geoData).scale() * 0.95)
      .translate([dimensions.width / 2, dimensions.height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);
    return { pathGenerator };
  }, [dimensions, geoData]);

  if (!geoData || !pathGenerator) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-gray-400'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
        <p>Loading Map Data...</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative overflow-hidden flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="cursor-move touch-none block max-w-full"
      >
        {/* Background Ocean */}
        <rect width={dimensions.width} height={dimensions.height} fill={theme.ocean} />
        
        <g ref={gRef}>
          {geoData.features.map((feature) => {
            const iso2 = getIso2FromNumeric(String(feature.id));
            // Lookup color in the prop map
            const fill = (iso2 && colorMap[iso2]) ? colorMap[iso2] : theme.defaultCountry;
            const d = pathGenerator(feature as any) || '';

            return (
              <path
                key={feature.id}
                d={d}
                fill={fill}
                stroke={theme.stroke}
                strokeWidth={0.5}
                className="transition-colors duration-300 ease-in-out hover:brightness-90"
              >
                <title>{feature.properties?.name || iso2 || 'Unknown'}</title>
              </path>
            );
          })}
        </g>
      </svg>
      
      {/* Map Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
         <button 
           onClick={resetZoom}
           className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm border backdrop-blur transition-colors
             ${isDarkMode ? 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-white/80 text-gray-600 border-gray-200 hover:bg-gray-50'}`}
         >
           Reset Zoom
         </button>
      </div>
    </div>
  );
};

export default WorldMap;
