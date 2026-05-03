import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import Layout from '../components/Layout';
import 'leaflet/dist/leaflet.css';
import { Truck, Navigation, Signal, Activity, Wifi, WifiOff, Gauge, Battery } from 'lucide-react';
import api from '../api/api';

// Replace with your EC2 Public IP
const SOCKET_URL = "http://68.183.246.131:3000";

// Fix for default marker icons in Leaflet with Vite
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

const renderVehicleIcon = (angle = 0, status = 'Moving', speed = 0) => {
  const color = status === 'Moving' ? '#10b981' : '#f59e0b';
  const isMoving = speed > 0 || status === 'Moving';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-wrapper">
        <div class="marker-direction ${isMoving ? 'moving' : ''}" style="transform: rotate(${angle}deg);">
          <div class="beak" style="border-bottom-color: ${color};"></div>
          <div class="circle" style="background-color: ${color};">
             <div class="inner-dot"></div>
          </div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const VehicleMarker = React.memo(({ vehicle, onSelect }) => {
  const lat = vehicle.latitude || vehicle.lat;
  const lng = vehicle.longitude || vehicle.lng;

  if (!lat || !lng) return null;

  return (
    <Marker
      position={[lat, lng]}
      icon={renderVehicleIcon(vehicle.angle, vehicle.status, vehicle.speed)}
      eventHandlers={{
        click: () => onSelect(vehicle),
      }}
    >
      <Popup>
        <div className="p-2 min-w-[150px]">
          <p className="font-black text-dark text-sm border-b border-slate-100 pb-1 mb-2">{vehicle.vehicle_no || 'Vehicle'}</p>
          <div className="space-y-1">
            <p className="text-[10px] flex justify-between"><span className="text-slate-400 font-bold">STATUS:</span> <span className="font-bold text-primary">{vehicle.status || 'N/A'}</span></p>
            <p className="text-[10px] flex justify-between"><span className="text-slate-400 font-bold">SPEED:</span> <span className="font-bold text-primary">{vehicle.speed || 0} km/h</span></p>
            <p className="text-[10px] flex justify-between"><span className="text-slate-400 font-bold">ANGLE:</span> <span className="font-bold text-primary">{vehicle.angle || 0}°</span></p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

// Component to handle map centering and zooming
const MapController = ({ selectedVehicle }) => {
  const map = useMap();
  const lastFollowedId = React.useRef(null);

  useEffect(() => {
    if (selectedVehicle) {
      const lat = selectedVehicle.latitude || selectedVehicle.lat;
      const lng = selectedVehicle.longitude || selectedVehicle.lng;

      // Only flyTo if this is a NEW selection
      if (lat && lng && lastFollowedId.current !== selectedVehicle.vehicle_id) {
        lastFollowedId.current = selectedVehicle.vehicle_id;
        map.flyTo([lat, lng], 16, {
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

const LiveTracker = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [routeHistory, setRouteHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Data Fetch (Fetches all vehicles from DB via the updated backend)
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        console.log('📡 Fetching initial vehicle data...');
        const response = await api.get('/vehicles/live');
        const data = response.data;
        console.log('🚛 Initial Vehicles Loaded:', data);
        setVehicles(data);
      } catch (err) {
        console.error('❌ Failed to fetch initial vehicle data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // 2. Fetch Route History when vehicle is selected
  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedVehicle?.vehicle_id) {
        try {
          const response = await api.get(`/vehicles/${selectedVehicle.vehicle_id}/telemetry`);
          const history = response.data;
          const path = history
            .sort((a, b) => new Date(a.time) - new Date(b.time))
            .map(p => [p.latitude, p.longitude])
            .filter(p => p[0] && p[1]);
          setRouteHistory(path);
        } catch (err) {
          console.error('Failed to fetch route history:', err);
          setRouteHistory([]);
        }
      } else {
        setRouteHistory([]);
      }
    };

    fetchHistory();
  }, [selectedVehicle?.vehicle_id]);

  // 3. Socket Connection for Real-time Updates
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Telematics Socket');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket Disconnected');
      setIsConnected(false);
    });

    socket.on('v1_live_update', (data) => {
      console.log(`🚛 Real-time Update for ${data.vehicle_no || 'Unknown'}:`, data);

      setVehicles((prevVehicles) => {
        const index = prevVehicles.findIndex((v) =>
          (data.vehicle_id && Number(v.vehicle_id) === Number(data.vehicle_id)) ||
          (data.vehicle_no && v.vehicle_no === data.vehicle_no) ||
          ((data.imei || data.IMEI) && String(v.imei) === String(data.imei || data.IMEI))
        );

        if (index !== -1) {
          const updatedVehicles = [...prevVehicles];
          const updatedVehicle = {
            ...updatedVehicles[index],
            ...data,
            // NORMALIZE COORDINATES: Ensure live lat/lng overwrites DB latitude/longitude
            latitude: data.lat || data.latitude || updatedVehicles[index].latitude,
            longitude: data.lng || data.longitude || updatedVehicles[index].longitude,
            vehicle_id: updatedVehicles[index].vehicle_id || data.vehicle_id,
            vehicle_no: updatedVehicles[index].vehicle_no || data.vehicle_no
          };
          updatedVehicles[index] = updatedVehicle;

          setSelectedVehicle(prev => {
            if (prev && (
              (data.vehicle_id && Number(prev.vehicle_id) === Number(data.vehicle_id)) ||
              (data.vehicle_no && prev.vehicle_no === data.vehicle_no)
            )) {
              return updatedVehicle;
            }
            return prev;
          });

          return updatedVehicles;
        } else {
          return [...prevVehicles, {
            ...data,
            latitude: data.lat || data.latitude,
            longitude: data.lng || data.longitude
          }];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []); // Empty dependency array ensures connection is made only once

  return (
    <Layout hideSidebar={true}>
      <div className="h-[calc(100vh-80px)] flex bg-slate-50">
        {/* Left Panel: Vehicle List */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
            <div>
              <h2 className="text-xl font-black text-dark tracking-tight">Fleet Assets</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {vehicles.length} Total Vehicles
              </p>
            </div>
            <div className={`p-2 rounded-full ${isConnected ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {isConnected ? <Wifi size={16} className="animate-pulse" /> : <WifiOff size={16} />}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-10 text-center space-y-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-medium italic">Loading database assets...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="p-10 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">No vehicles found in database.</p>
              </div>
            ) : (
              vehicles.map((v) => (
                <button
                  key={v.imei}
                  onClick={() => setSelectedVehicle(v)}
                  className={`w-full p-5 border-b border-slate-50 text-left hover:bg-slate-50 transition-all flex gap-4 group ${selectedVehicle?.imei === v.imei ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${(v.latitude || v.lat) ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-dark truncate">{v.vehicle_no || 'Unknown'}</p>
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${(v.latitude || v.lat) ? 'text-green-600' : 'text-slate-400'}`}>
                        {(v.latitude || v.lat) ? (v.status || 'Active') : 'Offline'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">IMEI: {v.imei}</p>
                    {(v.latitude || v.lat) && (
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                          <Activity className="w-3 h-3 text-primary" />
                          {v.speed || 0} km/h
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                          <Battery className="w-3 h-3 text-orange-500" />
                          {v.voltage || 0}V
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Area: Map */}
        <div className="flex-1 relative z-10">
          <MapContainer
            center={INITIAL_CENTER}
            zoom={INITIAL_ZOOM}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <MapController selectedVehicle={selectedVehicle} />
            <TileLayer
              attribution='&copy; Google Maps'
              url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              maxZoom={20}
            />

            {routeHistory.length > 0 && (
              <Polyline
                positions={routeHistory}
                color="#6366f1"
                weight={4}
                opacity={0.6}
                dashArray="10, 10"
              />
            )}

            {vehicles.map((v) => (
              <VehicleMarker
                key={v.imei}
                vehicle={v}
                onSelect={setSelectedVehicle}
              />
            ))}

            {/* Custom Map Controls Overlay */}
            <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
              <button className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-600 hover:text-primary transition-all hover:scale-105">
                <Signal className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-600 hover:text-primary transition-all hover:scale-105">
                <Navigation className="w-5 h-5" />
              </button>
            </div>
          </MapContainer>

          {/* Selected Vehicle Floating Card */}
          {selectedVehicle && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-6">
              <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 p-8 flex items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="w-20 h-20 bg-primary/5 rounded-[24px] flex items-center justify-center text-primary shrink-0 relative">
                  <Truck className="w-10 h-10" />
                  {(selectedVehicle.latitude || selectedVehicle.lat) && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black text-dark tracking-tight">{selectedVehicle.vehicle_no || 'Vehicle Details'}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">IMEI: {selectedVehicle.imei}</p>
                    </div>
                    <button
                      onClick={() => setSelectedVehicle(null)}
                      className="text-slate-300 hover:text-dark transition-colors p-1"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                  </div>
                  {(selectedVehicle.latitude || selectedVehicle.lat) ? (
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-slate-50 p-3 rounded-2xl text-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Speed</p>
                        <p className="text-sm font-black text-primary">{selectedVehicle.speed || 0} <span className="text-[8px]">km/h</span></p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl text-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Power</p>
                        <p className="text-sm font-black text-primary">{selectedVehicle.voltage || 0} <span className="text-[8px]">V</span></p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl text-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Angle</p>
                        <p className="text-sm font-black text-primary">{selectedVehicle.angle || 0}°</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl text-center text-slate-500 text-sm font-medium">
                      No live telemetry data available yet for this asset.
                    </div>
                  )}
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
