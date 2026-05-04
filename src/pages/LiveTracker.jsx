import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import Layout from '../components/Layout';
import 'leaflet/dist/leaflet.css';
import { 
  Truck, Navigation, Signal, Activity, Wifi, WifiOff, 
  Gauge, Battery, Search, ChevronRight, Filter, Map as MapIcon,
  Circle, MoreVertical, Layers, Compass
} from 'lucide-react';
import api from '../api/api';

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

const renderVehicleIcon = (angle = 0, status = 'Moving', speed = 0, currentIcon = null) => {
  const color = status === 'Moving' ? '#10b981' : '#f59e0b';
  const isMoving = speed > 0 || status === 'Moving';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-wrapper">
        <div class="icon-only ${isMoving ? 'moving' : ''}" style="transform: rotate(${angle}deg); display: flex; align-items: center; justify-content: center;">
          ${currentIcon ? 
            `<img src="${currentIcon}" style="width: 45px; height: 45px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" />` : 
            `<div class="fallback-dot" style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`
          }
        </div>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  });
};

const MapController = ({ selectedVehicle }) => {
  const map = useMap();
  const lastFollowedId = useRef(null);

  useEffect(() => {
    if (selectedVehicle) {
      const lat = selectedVehicle.latitude || selectedVehicle.lat;
      const lng = selectedVehicle.longitude || selectedVehicle.lng;

      if (lat && lng && lastFollowedId.current !== selectedVehicle.vehicle_id) {
        lastFollowedId.current = selectedVehicle.vehicle_id;
        map.flyTo([lat, lng], 15, {
          duration: 1.5,
          easeLinearity: 0.25
        });
      }
    } else {
      lastFollowedId.current = null;
    }
  }, [selectedVehicle, map]);

  return null;
};

const VehicleMarker = React.memo(({ vehicle, onSelect }) => {
  const lat = vehicle.latitude || vehicle.lat;
  const lng = vehicle.longitude || vehicle.lng;

  if (!lat || !lng) return null;

  return (
    <Marker
      position={[lat, lng]}
      icon={renderVehicleIcon(vehicle.angle, vehicle.status, vehicle.speed, vehicle.current_icon)}
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

  // Initial Fetch
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get('/vehicles/live');
        setVehicles(response.data);
      } catch (err) {
        console.error('Failed to fetch initial vehicle data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // Socket Connection
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      secure: true,
      reconnection: true,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('v1_live_update', (data) => {
      setVehicles((prev) => {
        const index = prev.findIndex((v) => 
          (data.vehicle_id && Number(v.vehicle_id) === Number(data.vehicle_id)) ||
          (data.vehicle_no && v.vehicle_no === data.vehicle_no)
        );

        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { 
            ...updated[index], 
            ...data,
            latitude: data.lat || data.latitude || updated[index].latitude,
            longitude: data.lng || data.longitude || updated[index].longitude
          };
          
          if (selectedVehicle && selectedVehicle.vehicle_id === updated[index].vehicle_id) {
            setSelectedVehicle(updated[index]);
          }
          return updated;
        }
        return [...prev, data];
      });
    });

    return () => socket.disconnect();
  }, [selectedVehicle]);

  const filteredVehicles = useMemo(() => 
    vehicles.filter(v => 
      v.vehicle_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.imei?.includes(searchQuery)
    ),
    [vehicles, searchQuery]
  );

  return (
    <Layout hideSidebar={false}>
      <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50 relative">
        {/* Left Sidebar: Minimalist Fleet List */}
        <div className="w-96 flex flex-col bg-white border-r border-slate-100 z-10 shadow-premium">
          <div className="p-6 border-b border-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-dark tracking-tighter">My Fleet</h2>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isConnected ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-slate-300'}`} />
                {isConnected ? 'Live' : 'Offline'}
              </div>
            </div>
            
            <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-slate-50 rounded-3xl animate-pulse" />
              ))
            ) : filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <button
                  key={vehicle.vehicle_id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`w-full p-4 rounded-3xl text-left transition-all duration-300 group ${
                    selectedVehicle?.vehicle_id === vehicle.vehicle_id
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'hover:bg-slate-50 bg-white border border-slate-50 hover:border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-0.5">
                      <p className={`text-sm font-black uppercase tracking-widest ${selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'text-white' : 'text-dark'}`}>
                        {vehicle.vehicle_no}
                      </p>
                      <p className={`text-[10px] font-bold ${selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'text-white/70' : 'text-slate-400'}`}>
                        IMEI: {vehicle.imei}
                      </p>
                    </div>
                    <div className={`p-2 rounded-xl ${selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'bg-white/20' : 'bg-slate-50 text-slate-400 group-hover:text-primary'}`}>
                      <Navigation size={14} style={{ transform: `rotate(${vehicle.angle || 0}deg)` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Gauge size={12} className={selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'text-white/60' : 'text-slate-300'} />
                      <span className={`text-[11px] font-black ${selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'text-white' : 'text-slate-500'}`}>
                        {vehicle.speed || 0} km/h
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <Signal size={12} className={selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'text-white/60' : 'text-slate-300'} />
                      <span className={`text-[11px] font-black ${selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'text-white' : 'text-slate-500'}`}>
                        Active
                      </span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                  <Truck size={24} />
                </div>
                <p className="text-sm font-bold text-slate-400 tracking-tight">No assets found</p>
              </div>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <MapContainer
            center={INITIAL_CENTER}
            zoom={INITIAL_ZOOM}
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              attribution="&copy; Google Maps"
            />
            {vehicles.map((v) => (
              <VehicleMarker 
                key={v.vehicle_id} 
                vehicle={v} 
                onSelect={setSelectedVehicle} 
              />
            ))}
            <MapController selectedVehicle={selectedVehicle} />
          </MapContainer>

          {/* Floating Controls */}
          <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
            <button className="p-3 bg-white rounded-2xl shadow-premium text-slate-400 hover:text-primary transition-all hover:scale-110 active:scale-95">
              <Layers size={20} />
            </button>
            <button className="p-3 bg-white rounded-2xl shadow-premium text-slate-400 hover:text-primary transition-all hover:scale-110 active:scale-95">
              <Filter size={20} />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-auto" />
            <button className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 transition-all hover:scale-110 active:scale-95">
              <Compass size={20} />
            </button>
          </div>

          {/* Selected Vehicle Overlay (Glass Effect) */}
          {selectedVehicle && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
              <div className="glass-panel p-8 rounded-[40px] flex items-center gap-8 animate-in slide-in-from-bottom-8 duration-700">
                <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary relative">
                  <Truck size={36} />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-xl border-4 border-white flex items-center justify-center">
                    <Wifi size={14} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-dark tracking-tighter uppercase">{selectedVehicle.vehicle_no}</h3>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      ID: {selectedVehicle.vehicle_id}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Gauge size={16} className="text-primary" />
                      <span className="text-sm font-black text-dark tracking-tight">{selectedVehicle.speed || 0} km/h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Battery size={16} className="text-success" />
                      <span className="text-sm font-black text-dark tracking-tight">{selectedVehicle.voltage || '0.00'}V</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-slate-400" />
                      <span className="text-sm font-black text-dark tracking-tight">Active</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="p-3 bg-dark text-white rounded-2xl hover:bg-black transition-all shadow-lg shadow-dark/20">
                    <Navigation size={20} />
                  </button>
                  <button className="p-3 bg-white text-slate-400 hover:text-dark rounded-2xl border border-slate-100 transition-all">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LiveTracker;
