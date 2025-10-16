import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom pharmacy icon
const pharmacyIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const PharmacyMap = ({ 
  pharmacies = [], 
  center = [23.8103, 90.4125], // Default to Dhaka, Bangladesh
  zoom = 12,
  onPharmacyClick = null,
  searchedMedicine = null,
  height = "400px"
}) => {
  const [userLocation, setUserLocation] = useState(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude
          ]);
        },
        (error) => {
          console.log('Could not get user location:', error);
        }
      );
    }
  }, []);

  // Component to update map center when userLocation changes
  const MapUpdater = () => {
    const map = useMap();
    
    useEffect(() => {
      if (userLocation) {
        map.setView(userLocation, zoom);
      }
    }, [userLocation, map]);
    
    return null;
  };

  const mapCenter = userLocation || center;

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <MapUpdater />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User's current location marker */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
          >
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Pharmacy markers */}
        {pharmacies.map((pharmacy) => {
          // Only show pharmacies with valid coordinates
          if (!pharmacy.latitude || !pharmacy.longitude) return null;
          
          return (
            <Marker
              key={pharmacy.id}
              position={[pharmacy.latitude, pharmacy.longitude]}
              icon={pharmacyIcon}
              eventHandlers={{
                click: () => {
                  if (onPharmacyClick) {
                    onPharmacyClick(pharmacy);
                  }
                }
              }}
            >
              <Popup>
                <div className="p-2 min-w-64">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {pharmacy.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {pharmacy.address}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    📞 {pharmacy.phone}
                  </p>
                  
                  {/* Show specific medicine info if searching */}
                  {searchedMedicine && pharmacy.medicine && (
                    <div className="mt-3 p-2 bg-blue-50 rounded">
                      <p className="text-sm font-medium text-blue-800">
                        {searchedMedicine}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        ৳{parseFloat(pharmacy.price || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Stock: {pharmacy.stock || 'N/A'} units
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`, '_blank')}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Get Directions
                    </button>
                    {onPharmacyClick && (
                      <button
                        onClick={() => onPharmacyClick(pharmacy)}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PharmacyMap;
