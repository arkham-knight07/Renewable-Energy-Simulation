import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sun, Wind, Zap, Droplets, Download, Volume2, VolumeX, Leaf, Mountain, Plus, Minus } from 'lucide-react';

const EnergyComparisonDashboard = () => {
  const [selectedEnergy, setSelectedEnergy] = useState('solar');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedSources, setSelectedSources] = useState(['solar']);
  const [time, setTime] = useState(0);
  
  // Interactive parameters for each energy source
  const [parameters, setParameters] = useState({
    solar: { rayAngle: 45, panelTilt: 30 },
    wind: { windSpeed: 15, turbineHeight: 80 },
    hydro: { damHeight: 50, waterFlow: 70 },
    nuclear: { reactorTemp: 300, controlRods: 50 },
    geothermal: { depth: 2000, temperature: 150 },
    biomass: { bioWeight: 100, moisture: 20 }
  });
  
  const audioContextRef = useRef(null);

  // Animation timer for flowing effects
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Energy sources with base values
  const energySources = {
    solar: {
      name: 'Solar Energy',
      icon: Sun,
      color: '#f59e0b',
      baseEfficiency: 22,
      baseWatts: 1000,
      cost: 45,
      environmental: 95,
      description: 'Solar panels convert sunlight into electricity'
    },
    wind: {
      name: 'Wind Energy',
      icon: Wind,
      color: '#10b981',
      baseEfficiency: 35,
      baseWatts: 2000,
      cost: 42,
      environmental: 90,
      description: 'Wind turbines capture wind energy'
    },
    hydro: {
      name: 'Hydro Energy',
      icon: Droplets,
      color: '#3b82f6',
      baseEfficiency: 90,
      baseWatts: 5000,
      cost: 38,
      environmental: 85,
      description: 'Water flow generates electricity'
    },
    nuclear: {
      name: 'Nuclear Energy',
      icon: Zap,
      color: '#8b5cf6',
      baseEfficiency: 85,
      baseWatts: 10000,
      cost: 85,
      environmental: 75,
      description: 'Nuclear fission produces energy'
    },
    geothermal: {
      name: 'Geothermal Energy',
      icon: Mountain,
      color: '#ef4444',
      baseEfficiency: 75,
      baseWatts: 3000,
      cost: 55,
      environmental: 88,
      description: 'Earth\'s heat generates power'
    },
    biomass: {
      name: 'Biomass Energy',
      icon: Leaf,
      color: '#84cc16',
      baseEfficiency: 25,
      baseWatts: 800,
      cost: 35,
      environmental: 70,
      description: 'Organic matter produces energy'
    }
  };

  // Calculate efficiency and watts based on parameters
  const calculateEfficiency = (source) => {
    const base = energySources[source].baseEfficiency;
    const params = parameters[source];
    
    switch (source) {
      case 'solar':
        const angleEfficiency = Math.max(0, 100 - Math.abs(params.rayAngle - 40) * 2);
        const tiltEfficiency = Math.max(0, 100 - Math.abs(params.panelTilt - 35) * 1.5);
        return Math.round(base * (angleEfficiency * tiltEfficiency) / 10000);
      
      case 'wind':
        let windEff = params.windSpeed < 5 ? 0 : 
                     params.windSpeed < 12 ? params.windSpeed * 5 :
                     params.windSpeed < 25 ? 80 + (params.windSpeed - 12) * 1.5 :
                     Math.max(0, 100 - (params.windSpeed - 25) * 3);
        const heightBonus = Math.min(20, params.turbineHeight / 5);
        return Math.round(base * (windEff + heightBonus) / 100);
      
      case 'hydro':
        const heightEff = Math.min(100, params.damHeight * 1.5);
        const flowEff = Math.min(100, params.waterFlow * 1.2);
        return Math.round(base * (heightEff * flowEff) / 10000);
      
      case 'nuclear':
        const tempEff = Math.min(100, params.reactorTemp / 3);
        const rodEff = 100 - Math.abs(params.controlRods - 50);
        return Math.round(base * (tempEff * rodEff) / 10000);
      
      case 'geothermal':
        const depthEff = Math.min(100, params.depth / 25);
        const heatEff = Math.min(100, params.temperature / 2);
        return Math.round(base * (depthEff * heatEff) / 10000);
      
      case 'biomass':
        const weightEff = Math.min(100, params.bioWeight / 1.5);
        const moistureEff = Math.max(0, 100 - params.moisture * 2);
        return Math.round(base * (weightEff * moistureEff) / 10000);
      
      default:
        return base;
    }
  };

  const calculateWatts = (source) => {
    const efficiency = calculateEfficiency(source);
    const baseWatts = energySources[source].baseWatts;
    return Math.round(baseWatts * (efficiency / 100));
  };

  // Sound function
  const playSound = (frequency) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.2);
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.2);
    } catch (error) {
      console.log('Audio not available');
    }
  };

  // Update parameter
  const updateParameter = (source, param, value) => {
    setParameters(prev => ({
      ...prev,
      [source]: {
        ...prev[source],
        [param]: Math.round(value)
      }
    }));
    if (soundEnabled) {
      playSound(400 + value * 2);
    }
  };

  // Working Energy Models with Flowing Effects
  const SolarPanel = ({ rayAngle, panelTilt }) => (
    <svg width="200" height="150" className="mx-auto">
      <rect x="20" y="70" width="160" height="60" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="5"/>
      <rect 
        x="30" y="80" width="140" height="40" fill="#3b82f6" opacity="0.8"
        transform={`rotate(${panelTilt - 30} 100 100)`}
      />
      {/* Flowing sun rays */}
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={i}
          x1="170"
          y1="20"
          x2={100 + Math.cos((rayAngle + i * 15) * Math.PI / 180) * 40}
          y2={50 + Math.sin((rayAngle + i * 15) * Math.PI / 180) * 40}
          stroke="#fbbf24"
          strokeWidth="2"
          opacity={0.6 + Math.sin(time * 0.2 + i) * 0.3}
        />
      ))}
      <circle cx="170" cy="20" r="12" fill="#fbbf24" opacity={0.8 + Math.sin(time * 0.3) * 0.2}/>
      <text x="10" y="145" fontSize="10" fill="#666">Angle: {rayAngle}° | Tilt: {panelTilt}°</text>
    </svg>
  );

  const WindTurbine = ({ windSpeed, turbineHeight }) => (
    <svg width="200" height="150" className="mx-auto">
      <rect x="95" y={150 - turbineHeight} width="10" height={turbineHeight} fill="#374151"/>
      <circle cx="100" cy={150 - turbineHeight} r="5" fill="#6b7280"/>
      {/* Rotating turbine blades */}
      {Array.from({ length: 3 }, (_, i) => (
        <ellipse
          key={i}
          cx="100"
          cy={130 - turbineHeight}
          rx="3"
          ry={15 + windSpeed / 2}
          fill="#e5e7eb"
          transform={`rotate(${time * windSpeed / 5 + i * 120} 100 ${150 - turbineHeight})`}
        />
      ))}
      {/* Flowing wind lines */}
      {Array.from({ length: Math.floor(windSpeed / 3) }, (_, i) => (
        <line
          key={i}
          x1={10 + (time * 2 + i * 10) % 60}
          y1={60 + i * 8}
          x2={50 + (time * 2 + i * 10) % 60}
          y2={60 + i * 8}
          stroke="#60a5fa"
          strokeWidth="2"
          opacity="0.7"
        />
      ))}
      <text x="10" y="145" fontSize="10" fill="#666">Speed: {windSpeed}mph | Height: {turbineHeight}m</text>
    </svg>
  );

  const HydroPlant = ({ damHeight, waterFlow }) => (
    <svg width="200" height="150" className="mx-auto">
      <rect x="140" y={150 - damHeight} width="50" height={damHeight} fill="#374151" rx="5"/>
      <rect x="50" y={130 - damHeight} width="100" height="20" fill="#3b82f6" rx="10"/>
      <path 
        d={`M50 ${150 - damHeight} L50 140 L140 140 L140 ${150 - damHeight + 20}`} 
        fill="#60a5fa" 
        opacity={waterFlow / 100}
      />
      {/* Flowing water */}
      {Array.from({ length: Math.floor(waterFlow / 15) }, (_, i) => (
        <circle
          key={i}
          cx="120"
          cy={140 - damHeight + 20 + (time * 2 + i * 8) % 30}
          r="2"
          fill="#3b82f6"
          opacity="0.8"
        />
      ))}
      {/* Water droplets */}
      {Array.from({ length: Math.floor(waterFlow / 25) }, (_, i) => (
        <circle
          key={i}
          cx={110 + Math.sin(time * 0.1 + i) * 5}
          cy={120 + (time + i * 10) % 20}
          r="1"
          fill="#60a5fa"
        />
      ))}
      <text x="10" y="145" fontSize="10" fill="#666">Height: {damHeight}m | Flow: {waterFlow}%</text>
    </svg>
  );

  const NuclearPlant = ({ reactorTemp, controlRods }) => (
    <svg width="200" height="150" className="mx-auto">
      <rect x="60" y="80" width="80" height="50" fill="#374151" rx="5"/>
      <circle cx="100" cy="105" r="20" fill="#8b5cf6" opacity={reactorTemp / 400}/>
      <circle cx="100" cy="105" r="15" fill="#a855f7" opacity={reactorTemp / 500}/>
      {/* Control rods */}
      {Array.from({ length: 4 }, (_, i) => (
        <rect
          key={i}
          x={85 + i * 8}
          y={85 + (100 - controlRods) / 5}
          width="3"
          height={15 + controlRods / 5}
          fill="#374151"
        />
      ))}
      {/* Steam particles */}
      {Array.from({ length: 6 }, (_, i) => (
        <circle
          key={i}
          cx={90 + Math.sin(time * 0.1 + i) * 10}
          cy={60 - (time + i * 5) % 20}
          r="2"
          fill="#e5e7eb"
          opacity="0.6"
        />
      ))}
      <text x="10" y="145" fontSize="10" fill="#666">Temp: {reactorTemp}°C | Rods: {controlRods}%</text>
    </svg>
  );

  const GeothermalPlant = ({ depth, temperature }) => (
    <svg width="200" height="150" className="mx-auto">
      <rect x="80" y="60" width="40" height="40" fill="#374151" rx="5"/>
      <circle cx="100" cy="80" r="8" fill="#ef4444" opacity={temperature / 200}/>
      {/* Underground pipe */}
      <rect x="95" y="100" width="10" height={depth / 40} fill="#92400e"/>
      {/* Rising heat waves */}
      {Array.from({ length: Math.floor(temperature / 30) }, (_, i) => (
        <path
          key={i}
          d={`M ${90 + i * 5} ${50 - (time + i * 10) % 30} Q ${95 + i * 5} ${45 - (time + i * 10) % 30} ${100 + i * 5} ${50 - (time + i * 10) % 30}`}
          stroke="#fca5a5"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
      ))}
      <text x="10" y="145" fontSize="10" fill="#666">Depth: {depth}m | Temp: {temperature}°C</text>
    </svg>
  );

  const BiomassPlant = ({ bioWeight, moisture }) => (
    <svg width="200" height="150" className="mx-auto">
      <rect x="70" y="70" width="60" height="50" fill="#374151" rx="5"/>
      <rect x="130" y="40" width="10" height="50" fill="#6b7280"/>
      {/* Biomass pile */}
      <ellipse cx="50" cy="110" rx={bioWeight / 5} ry="15" fill="#84cc16" opacity={0.8}/>
      {/* Moisture indicator */}
      <rect x="20" y="90" width={moisture} height="5" fill="#3b82f6" opacity="0.6"/>
      {/* Rising smoke/steam */}
      {Array.from({ length: Math.floor((100 - moisture) / 15) }, (_, i) => (
        <circle
          key={i}
          cx={130 + Math.sin(time * 0.1 + i) * 6}
          cy={35 - (time + i * 8) % 25}
          r="3"
          fill="#a3e635"
          opacity="0.6"
        />
      ))}
      <text x="10" y="145" fontSize="10" fill="#666">Weight: {bioWeight}kg | Moisture: {moisture}%</text>
    </svg>
  );

  const renderEnergyModel = (type) => {
    const params = parameters[type];
    switch (type) {
      case 'solar': return <SolarPanel rayAngle={params.rayAngle} panelTilt={params.panelTilt} />;
      case 'wind': return <WindTurbine windSpeed={params.windSpeed} turbineHeight={params.turbineHeight} />;
      case 'hydro': return <HydroPlant damHeight={params.damHeight} waterFlow={params.waterFlow} />;
      case 'nuclear': return <NuclearPlant reactorTemp={params.reactorTemp} controlRods={params.controlRods} />;
      case 'geothermal': return <GeothermalPlant depth={params.depth} temperature={params.temperature} />;
      case 'biomass': return <BiomassPlant bioWeight={params.bioWeight} moisture={params.moisture} />;
      default: return <SolarPanel rayAngle={45} panelTilt={30} />;
    }
  };

  const renderControls = (source) => {
    const params = parameters[source];
    
    const ControlButton = ({ label, param, value, min, max, step = 1, unit = '' }) => (
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm w-24 font-medium">{label}:</span>
        <button
          onClick={() => {
            const newValue = Math.max(min, value - step);
            updateParameter(source, param, newValue);
          }}
          className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-16 text-center text-sm font-bold bg-gray-100 py-1 px-2 rounded">
          {value}{unit}
        </span>
        <button
          onClick={() => {
            const newValue = Math.min(max, value + step);
            updateParameter(source, param, newValue);
          }}
          className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    );

    switch (source) {
      case 'solar':
        return (
          <div>
            <ControlButton label="Ray Angle" param="rayAngle" value={params.rayAngle} min={0} max={90} unit="°" />
            <ControlButton label="Panel Tilt" param="panelTilt" value={params.panelTilt} min={0} max={60} unit="°" />
          </div>
        );
      case 'wind':
        return (
          <div>
            <ControlButton label="Wind Speed" param="windSpeed" value={params.windSpeed} min={0} max={50} unit="mph" />
            <ControlButton label="Height" param="turbineHeight" value={params.turbineHeight} min={20} max={120} step={5} unit="m" />
          </div>
        );
      case 'hydro':
        return (
          <div>
            <ControlButton label="Dam Height" param="damHeight" value={params.damHeight} min={10} max={100} unit="m" />
            <ControlButton label="Water Flow" param="waterFlow" value={params.waterFlow} min={0} max={100} unit="%" />
          </div>
        );
      case 'nuclear':
        return (
          <div>
            <ControlButton label="Reactor Temp" param="reactorTemp" value={params.reactorTemp} min={100} max={500} step={10} unit="°C" />
            <ControlButton label="Control Rods" param="controlRods" value={params.controlRods} min={0} max={100} step={5} unit="%" />
          </div>
        );
      case 'geothermal':
        return (
          <div>
            <ControlButton label="Drill Depth" param="depth" value={params.depth} min={500} max={5000} step={100} unit="m" />
            <ControlButton label="Temperature" param="temperature" value={params.temperature} min={50} max={300} step={10} unit="°C" />
          </div>
        );
      case 'biomass':
        return (
          <div>
            <ControlButton label="Bio Weight" param="bioWeight" value={params.bioWeight} min={10} max={200} step={5} unit="kg" />
            <ControlButton label="Moisture" param="moisture" value={params.moisture} min={0} max={50} unit="%" />
          </div>
        );
      default:
        return null;
    }
  };

  // Export data
  const exportData = (format) => {
    const data = (comparisonMode ? selectedSources : [selectedEnergy]).map(source => ({
      name: energySources[source].name,
      efficiency: calculateEfficiency(source),
      watts: calculateWatts(source),
      cost: energySources[source].cost,
      environmental: energySources[source].environmental,
      parameters: parameters[source]
    }));

    const blob = format === 'json' ?
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }) :
      new Blob([
        'Name,Efficiency,Watts,Cost,Environmental,Parameters\n' +
        data.map(row => `${row.name},${row.efficiency},${row.watts},${row.cost},${row.environmental},"${JSON.stringify(row.parameters)}"`).join('\n')
      ], { type: 'text/csv' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energy-data.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playSound(800);
  };

  const toggleSource = (source) => {
    if (comparisonMode) {
      setSelectedSources(prev => 
        prev.includes(source) 
          ? prev.length > 1 ? prev.filter(s => s !== source) : prev
          : [...prev, source]
      );
    } else {
      setSelectedEnergy(source);
    }
    playSound(600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Interactive Energy Sources Dashboard
        </h1>

        {/* Simple Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={comparisonMode}
                onChange={(e) => setComparisonMode(e.target.checked)}
              />
              <span className="font-medium">Compare Multiple Sources</span>
            </label>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded transition-colors ${soundEnabled ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Removed Export JSON and Export CSV buttons as requested */}
          </div>
        </div>

        {/* Energy Source Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {Object.entries(energySources).map(([key, source]) => {
            const Icon = source.icon;
            const isSelected = comparisonMode ? selectedSources.includes(key) : selectedEnergy === key;
            const efficiency = calculateEfficiency(key);
            const watts = calculateWatts(key);
            
            return (
              <div
                key={key}
                className={`bg-white p-6 rounded-lg shadow-lg transition-all ${
                  isSelected ? 'ring-4 ring-blue-500 shadow-xl' : 'hover:shadow-xl'
                }`}
              >
                <div 
                  className="flex items-center gap-3 mb-4 cursor-pointer"
                  onClick={() => toggleSource(key)}
                >
                  <Icon className="w-6 h-6" style={{ color: source.color }} />
                  <h3 className="text-lg font-bold">{source.name}</h3>
                  {isSelected && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                </div>
                
                {/* Energy Model */}
                <div className="mb-4">
                  {renderEnergyModel(key)}
                </div>
                
                {/* Interactive Controls */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3 text-sm text-gray-700">Adjust Parameters:</h4>
                  {renderControls(key)}
                </div>
                
                {/* Current Output */}
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: source.color }}>
                        {watts.toLocaleString()} W
                      </div>
                      <div className="text-sm text-gray-600">Power Output</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Efficiency:</span>
                      <span className="font-bold" style={{ color: source.color }}>
                        {efficiency}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost Score:</span>
                      <span className="font-bold" style={{ color: source.color }}>
                        {100 - source.cost}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Environmental:</span>
                      <span className="font-bold" style={{ color: source.color }}>
                        {source.environmental}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>kWh/day:</span>
                      <span className="font-bold" style={{ color: source.color }}>
                        {Math.round(watts * 24 / 1000)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Chart */}
        {comparisonMode && selectedSources.length > 1 && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-xl font-bold mb-4">Current Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={selectedSources.map(source => ({
                name: energySources[source].name,
                efficiency: calculateEfficiency(source),
                watts: calculateWatts(source) / 100, // Scale for chart
                environmental: energySources[source].environmental
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'watts' ? `${Math.round(value * 100)} W` : `${value}%`,
                    name === 'watts' ? 'Power Output' : name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                />
                <Legend />
                <Bar dataKey="efficiency" fill="#3b82f6" name="Efficiency %" />
                <Bar dataKey="watts" fill="#10b981" name="Power Output (x100 W)" />
                <Bar dataKey="environmental" fill="#f59e0b" name="Environmental Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Total Energy Production Summary */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Energy Production Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(comparisonMode ? selectedSources : [selectedEnergy]).map(source => {
              const watts = calculateWatts(source);
              const efficiency = calculateEfficiency(source);
              const dailyKwh = Math.round(watts * 24 / 1000);
              const sourceData = energySources[source];
              
              return (
                <div key={source} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold mb-1" style={{ color: sourceData.color }}>
                    {watts.toLocaleString()} W
                  </div>
                  <div className="text-lg font-semibold mb-1" style={{ color: sourceData.color }}>
                    {efficiency}% efficient
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{sourceData.name}</div>
                  <div className="text-xs text-gray-500">
                    {dailyKwh} kWh/day
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyComparisonDashboard;