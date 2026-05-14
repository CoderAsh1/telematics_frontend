import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Battery,
  Compass,
  Filter,
  Gauge,
  Layers,
  MoreVertical,
  Navigation,
  Search,
  Truck,
  X,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  History,
  FastForward,
  Signal,
  Zap,
  ArrowLeft
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, TileLayer, useMap, Polyline } from 'react-leaflet';
import { io } from 'socket.io-client';
import api from '../../api/api';
import * as vehicleApi from '../../api/vehicle';
import Layout from '../../components/Layout';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "wss://tracker.bdph.in";

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const INITIAL_CENTER = [24.589018806784583, 87.44980490379005];
const INITIAL_ZOOM = 8;

const renderVehicleIcon = (angle = 0, status = 'Moving', speed = 0, currentIcon = null, vehicle) => {
  const color = status === 'Moving' ? '#10b981' : '#f59e0b';
  const isMoving = speed > 0 || status === 'Moving';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-wrapper">
        <div class="icon-only ${isMoving ? 'moving' : ''}" style="transform: rotate(${angle}deg); display: flex; align-items: center; justify-content: center;">
          ${currentIcon ? `<img src="${currentIcon}" style="width: 45px; height: 45px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" />` : ''}
        </div>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  });
};

const MapController = ({ selectedVehicle, isPlayback = false }) => {
  const map = useMap();
  const lastFollowedId = useRef(null);

  useEffect(() => {
    if (selectedVehicle) {
      const lat = selectedVehicle.latitude || selectedVehicle.lat;
      const lng = selectedVehicle.longitude || selectedVehicle.lng;

      if (lat && lng) {
        if (isPlayback) {
          // Smooth following during playback
          map.panTo([lat, lng], { animate: true, duration: 0.5 });
        } else if (lastFollowedId.current !== selectedVehicle.vehicle_id) {
          // Fly to on initial selection or live update with new ID
          lastFollowedId.current = selectedVehicle.vehicle_id;
          map.flyTo([lat, lng], 15, {
            duration: 1.5,
            easeLinearity: 0.25
          });
        }
      }
    } else {
      lastFollowedId.current = null;
    }
  }, [selectedVehicle, map, isPlayback]);

  return null;
};

const VehicleMarker = React.memo(({ vehicle, onSelect }) => {
  const lat = vehicle.latitude || vehicle.lat;
  const lng = vehicle.longitude || vehicle.lng;
  if (!lat || !lng) return null;

  return (
    <Marker
      position={[lat, lng]}
      icon={renderVehicleIcon(vehicle.angle, vehicle.status, vehicle.speed, vehicle.current_icon, vehicle)}
      eventHandlers={{
        click: () => onSelect(vehicle),
      }}
    />
  );
});

const LiveTracker = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [routeHistory, setRouteHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListOpen, setIsListOpen] = useState(window.innerWidth >= 1024);
  const [mapMode, setMapMode] = useState('roadmap'); // 'roadmap' or 'hybrid'
  const navigate = useNavigate();

  // History states
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [historyRange, setHistoryRange] = useState({
    start: new Date(new Date().setHours(0, 0, 0, 0)).toISOString().slice(0, 16),
    end: new Date().toISOString().slice(0, 16)
  });
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Initial Fetch
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get('/vehicles/live', { params: { limit: 500 } });
        setVehicles(response.data.data);
      } catch (err) {
        console.error('Failed to fetch initial vehicle data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const selectedVehicleRef = useRef(null);
  useEffect(() => {
    selectedVehicleRef.current = selectedVehicle;
  }, [selectedVehicle]);

  // Socket Connection
  useEffect(() => {
    const socket = io("https://tracker.bdph.in", {
      transports: ["websocket"],
      secure: true,
      reconnection: true,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log("❌ Socket disconnected. Reason:", reason);
      if (reason === "io server disconnect") {
        // The server forcibly closed the connection, try reconnecting manually
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error("⚠️ Connection Error:", error.message);
    });

    socket.on('v1_live_update', (data) => {
      console.log("📡 New data from socket:", data);

      setVehicles((prev) => {
        const index = prev.findIndex((v) =>
          (data.vehicle_id && Number(v.vehicle_id) === Number(data.vehicle_id)) ||
          (data.vehicle_no && v.vehicle_no === data.vehicle_no)
        );

        if (index !== -1) {
          const updated = [...prev];
          const updatedVehicle = {
            ...updated[index],
            ...data,
            latitude: data.lat || data.latitude || updated[index].latitude,
            longitude: data.lng || data.longitude || updated[index].longitude
          };
          updated[index] = updatedVehicle;

          // Update selected vehicle if it's the one being updated
          if (selectedVehicleRef.current && selectedVehicleRef.current.vehicle_id === updatedVehicle.vehicle_id) {
            setSelectedVehicle(updatedVehicle);
          }
          return updated;
        }
        return [...prev, data];
      });
    });

    return () => {
      console.log("🔌 Cleaning up socket connection...");
      socket.disconnect();
    };
  }, []); // Empty dependency array ensures socket connects only once

  const fetchHistory = useCallback(async () => {
    if (!selectedVehicle) return;
    try {
      setIsHistoryLoading(true);
      setRouteHistory([]); // Clear previous
      const response = await vehicleApi.getVehicleTelemetry(selectedVehicle.vehicle_id, {
        start_date: historyRange.start,
        end_date: historyRange.end,
        limit: 2000
      });

      const data = response.data || [];
      console.log(data)
      const formattedHistory = data.map(point => ({
        ...point,
        lat: parseFloat(point.latitude || point.lat),
        lng: parseFloat(point.longitude || point.lng)
      }))
        .filter(p => !isNaN(p.lat) && !isNaN(p.lng))
        .sort((a, b) => {
          const timeA = new Date(a.timestamp || a.device_time || a.created_at || a.time || 0).getTime();
          const timeB = new Date(b.timestamp || b.device_time || b.created_at || b.time || 0).getTime();
          if (timeA !== timeB) return timeA - timeB;
          return (a.id || 0) - (b.id || 0);
        });

      if (formattedHistory.length === 0) {
        alert('No history found for the selected range.');
      }

      setRouteHistory(formattedHistory);
      setPlaybackIndex(0);
      setIsPlaying(false);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      alert('Failed to fetch location history');
    } finally {
      setIsHistoryLoading(false);
    }
  }, [selectedVehicle, historyRange]);

  // Playback Timer
  useEffect(() => {
    let interval;
    if (isPlaying && routeHistory.length > 0) {
      interval = setInterval(() => {
        setPlaybackIndex((prev) => {
          if (prev >= routeHistory.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, routeHistory.length, playbackSpeed]);

  const playbackVehicle = useMemo(() => {
    if (!isHistoryMode || routeHistory.length === 0) return null;
    return routeHistory[playbackIndex];
  }, [isHistoryMode, routeHistory, playbackIndex]);

  const filteredVehicles = useMemo(() =>
    vehicles.filter(v =>
      v.vehicle_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.imei?.includes(searchQuery)
    ),
    [vehicles, searchQuery]
  );

  return (
    <Layout hideSidebar={true} showBack={true}>
      <div className="flex h-full overflow-hidden bg-slate-50 relative">
        {/* Mobile Toggle for List */}
        <button
          onClick={() => setIsListOpen(!isListOpen)}
          className="absolute top-20 left-4 z-30 lg:hidden p-2.5 bg-white border border-slate-200 rounded-md shadow-lg text-primary"
        >
          {isListOpen ? <X size={20} /> : <Search size={20} />}
        </button>

        {/* Left Overlay: Minimalist Fleet List */}
        <div className={`
          absolute top-4 left-4 bottom-4 w-72 flex flex-col bg-white border border-slate-200 z-10 shadow-lg rounded-md overflow-hidden transition-transform duration-300
          ${isListOpen ? 'translate-x-0' : '-translate-x-[calc(100%+20px)]'}
          lg:translate-x-0
        `}>
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-dark tracking-tight">Fleet Assets</h2>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${isConnected ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}`}>
                <div className={`w-1 h-1 rounded-full ${isConnected ? 'bg-success' : 'bg-slate-300'}`} />
                {isConnected ? 'Live' : 'Off'}
              </div>
            </div>

            <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-md py-1.5 pl-9 pr-3 text-xs font-medium focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-slate-50 rounded-md animate-pulse" />
              ))
            ) : filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <button
                  key={vehicle.vehicle_id}
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    if (window.innerWidth < 1024) setIsListOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-md text-left transition-all duration-200 group flex items-center gap-3 ${selectedVehicle?.vehicle_id === vehicle.vehicle_id
                    ? 'bg-primary text-white shadow-md'
                    : 'hover:bg-slate-50 bg-white border border-transparent hover:border-slate-100'
                    }`}
                >
                  <div className={`p-1.5 rounded-md shrink-0 ${selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'bg-white/20' : 'bg-slate-50 text-slate-400'}`}>
                    <Navigation size={14} style={{ transform: `rotate(${vehicle.angle || 0}deg)` }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-black uppercase tracking-wider truncate ${selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'text-white' : 'text-dark'}`}>
                      {vehicle.vehicle_no}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold ${selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'text-white/70' : 'text-slate-400'}`}>
                        {vehicle.speed || 0} km/h
                      </span>
                    </div>
                  </div>

                  <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success' : 'bg-slate-300'}`} />
                </button>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-[10px] font-bold text-slate-400 tracking-tight">No assets found</p>
              </div>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          {/* History Mode Toolbar */}
          {isHistoryMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-2xl">
              <div className="bg-white border border-slate-200 p-3 rounded-md shadow-xl flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-slate-50 p-1.5 rounded-md border border-slate-100">
                    <Calendar size={14} className="text-slate-400" />
                    <input
                      type="datetime-local"
                      value={historyRange.start}
                      onChange={(e) => setHistoryRange(prev => ({ ...prev, start: e.target.value }))}
                      className="bg-transparent border-none text-[10px] font-bold text-dark focus:ring-0 w-full"
                    />
                    <span className="text-[10px] font-black text-slate-300 px-1">TO</span>
                    <input
                      type="datetime-local"
                      value={historyRange.end}
                      onChange={(e) => setHistoryRange(prev => ({ ...prev, end: e.target.value }))}
                      className="bg-transparent border-none text-[10px] font-bold text-dark focus:ring-0 w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchHistory}
                      disabled={isHistoryLoading}
                      className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {isHistoryLoading ? 'Loading...' : 'Fetch'}
                    </button>
                    <button
                      onClick={() => {
                        setIsHistoryMode(false);
                        setIsPlaying(false);
                        setRouteHistory([]);
                        setPlaybackIndex(0);
                      }}
                      className="p-2 bg-slate-100 text-slate-500 hover:text-dark rounded-md transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {routeHistory.length > 0 && (
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-all"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>

                    <button
                      onClick={() => setPlaybackIndex(0)}
                      className="text-slate-400 hover:text-dark transition-all"
                    >
                      <RotateCcw size={16} />
                    </button>

                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        type="range"
                        min="0"
                        max={routeHistory.length - 1}
                        value={playbackIndex}
                        onChange={(e) => setPlaybackIndex(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <span>{new Date(routeHistory[playbackIndex]?.timestamp || routeHistory[playbackIndex]?.device_time || routeHistory[playbackIndex]?.created_at || routeHistory[playbackIndex]?.time).toLocaleString()}</span>
                        <span>{playbackIndex + 1} / {routeHistory.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      <FastForward size={12} className="text-slate-400" />
                      <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="bg-transparent border-none text-[10px] font-black text-dark focus:ring-0 py-0"
                      >
                        <option value="1">1x</option>
                        <option value="2">2x</option>
                        <option value="5">5x</option>
                        <option value="10">10x</option>
                        <option value="50">50x</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <MapContainer
            center={INITIAL_CENTER}
            zoom={INITIAL_ZOOM}
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              url={`http://{s}.google.com/vt/lyrs=${mapMode === 'roadmap' ? 'm' : 'y'}&x={x}&y={y}&z={z}`}
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              attribution="&copy; Google Maps"
            />
            {!isHistoryMode && vehicles.map((v) => (
              <VehicleMarker
                key={v.vehicle_id}
                vehicle={v}
                onSelect={setSelectedVehicle}
              />
            ))}

            {isHistoryMode && routeHistory.length > 0 && (
              <>
                <Polyline
                  positions={routeHistory.map(p => [p.lat, p.lng])}
                  color="#3b82f6"
                  weight={4}
                  opacity={0.6}
                />

                {/* Start Marker */}
                <Marker
                  position={[routeHistory[0].lat, routeHistory[0].lng]}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div class="w-6 h-6 bg-success rounded-full border-4 border-white shadow-lg flex items-center justify-center text-[8px] font-black text-white">S</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                  })}
                />

                {/* End Marker */}
                <Marker
                  position={[routeHistory[routeHistory.length - 1].lat, routeHistory[routeHistory.length - 1].lng]}
                  icon={L.divIcon({
                    className: 'custom-marker',
                    html: `<div class="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-[8px] font-black text-white">E</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                  })}
                />

                {playbackVehicle && (
                  <VehicleMarker
                    vehicle={{
                      ...selectedVehicle,
                      ...playbackVehicle,
                      angle: playbackVehicle.angle || 0,
                      speed: playbackVehicle.speed || 0
                    }}
                    onSelect={() => { }}
                  />
                )}
              </>
            )}
            <MapController
              selectedVehicle={isHistoryMode ? playbackVehicle : selectedVehicle}
              isPlayback={isHistoryMode && isPlaying}
            />
          </MapContainer>

          {/* Floating Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button
              onClick={() => setMapMode(mapMode === 'roadmap' ? 'hybrid' : 'roadmap')}
              className={`p-2 rounded-md shadow-md border transition-all ${mapMode === 'hybrid' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-100 hover:text-primary'}`}
              title={mapMode === 'roadmap' ? 'Switch to Satellite' : 'Switch to Roadmap'}
            >
              <Layers size={18} />
            </button>
            <button className="p-2 bg-white rounded-md shadow-md text-slate-500 hover:text-primary transition-all border border-slate-100">
              <Filter size={18} />
            </button>
            <button className="p-2 bg-primary text-white rounded-md shadow-md transition-all">
              <Compass size={18} />
            </button>
          </div>

          {/* Selected Vehicle Overlay (Compact) */}
          {selectedVehicle && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-20 sm:w-80">
              <div className="bg-white border border-slate-200 p-4 rounded-md shadow-xl animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-dark tracking-tight uppercase">{selectedVehicle.vehicle_no}</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {selectedVehicle.vehicle_id}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedVehicle(null)} className="p-1 text-slate-400 hover:text-dark">
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Speed</p>
                    <div className="flex items-center gap-1.5 text-primary">
                      <Gauge size={12} />
                      <span className="text-xs font-black text-dark">{(isHistoryMode ? playbackVehicle?.speed : selectedVehicle.speed) || 0} km/h</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Voltage</p>
                    <div className="flex items-center gap-1.5 text-success">
                      <Battery size={12} />
                      <span className="text-xs font-black text-dark">{(isHistoryMode ? playbackVehicle?.voltage : selectedVehicle.voltage) || '0.00'}V</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Ignition</p>
                    <div className={`flex items-center gap-1.5 ${(isHistoryMode ? playbackVehicle?.ignition : selectedVehicle.ignition) ? 'text-success' : 'text-slate-400'}`}>
                      <Zap size={12} />
                      <span className="text-xs font-black text-dark">{(isHistoryMode ? playbackVehicle?.ignition : selectedVehicle.ignition) ? 'ON' : 'OFF'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isHistoryMode) {
                      setRouteHistory([]);
                      setPlaybackIndex(0);
                      setIsPlaying(false);
                    }
                    setIsHistoryMode(!isHistoryMode);
                  }}
                  className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${isHistoryMode
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                >
                  <History size={14} />
                  {isHistoryMode ? 'Exit History Mode' : 'View History'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LiveTracker;
