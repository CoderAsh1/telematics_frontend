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

  const filteredVehicles = useMemo(() =>
    vehicles.filter(v =>
      v.vehicle_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.imei?.includes(searchQuery)
    ),
    [vehicles, searchQuery]
  );

  return (
    <Layout hideSidebar={true}>
      <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50 relative">
        {/* Left Overlay: Minimalist Fleet List */}
        <div className="absolute top-4 left-4 bottom-4 w-72 flex flex-col bg-white border border-slate-200 z-10 shadow-lg rounded-md overflow-hidden">
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
                  onClick={() => setSelectedVehicle(vehicle)}
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
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button className="p-2 bg-white rounded-md shadow-md text-slate-500 hover:text-primary transition-all border border-slate-100">
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
            <div className="absolute bottom-4 right-4 z-20 w-80">
              <div className="bg-white border border-slate-200 p-4 rounded-md shadow-xl animate-in slide-in-from-right-4">
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

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Speed</p>
                    <div className="flex items-center gap-1.5 text-primary">
                      <Gauge size={12} />
                      <span className="text-xs font-black text-dark">{selectedVehicle.speed || 0} km/h</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-md border border-slate-100">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Voltage</p>
                    <div className="flex items-center gap-1.5 text-success">
                      <Battery size={12} />
                      <span className="text-xs font-black text-dark">{selectedVehicle.voltage || '0.00'}V</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-dark text-white py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <Navigation size={12} />
                    Locate
                  </button>
                  <button className="p-1.5 bg-white text-slate-400 border border-slate-200 rounded-md hover:text-dark">
                    <MoreVertical size={14} />
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
