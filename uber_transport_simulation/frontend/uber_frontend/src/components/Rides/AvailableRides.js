import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AvailableRides.css';
import car from './car.jpg';

const uberCarIcon = L.icon({
  iconUrl: car, // Uber-like car icon
  iconSize: [30, 30], // Size
  iconAnchor: [15, 30], // Anchor point
  popupAnchor: [0, -30], // Popup offset
});


const AvailableRides = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [cityCoordinates, setCityCoordinates] = useState([20.5937, 78.9629]); // Default to India
  const [mapZoom, setMapZoom] = useState(6); // Default zoom

  useEffect(() => {
    const fetchCityCoordinates = async (city) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json`
        );
        const data = await response.json();
        if (data.length > 0) {
          const { lat, lon } = data[0];
          return [parseFloat(lat), parseFloat(lon)];
        }
      } catch (err) {
        console.error(`Error fetching coordinates for ${city}:`, err);
      }
      return null;
    };

    const fetchDriversByCity = async (city) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:8000/api/drivers/?location_city=${encodeURIComponent(city)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch drivers in ${city}`);
        }

        const data = await response.json();

        // Add coordinates for each driver
        const driversWithCoordinates = await Promise.all(
          data.map(async (driver) => {
            const coords = await fetchCityCoordinates(driver.location_city);
            return { ...driver, coordinates: coords };
          })
        );

        setDrivers(driversWithCoordinates);
        setLoading(false);

        // Set map zoom based on number of available drivers
        if (driversWithCoordinates.length > 10) {
          setMapZoom(12); // Zoom in if there are many drivers
        } else if (driversWithCoordinates.length > 0) {
          setMapZoom(20); // Zoom in closer if there are few drivers
        }
      } catch (err) {
        console.error(`Error fetching drivers in ${city}:`, err);
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchPickupLocation = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/user/pickup-location/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pickup location');
        }

        const data = await response.json();
        const locationParts = data.pickup_location.split(',').reverse();
        const city = locationParts[2].trim(); // Extract city
        setPickupLocation(city);

        const coords = await fetchCityCoordinates(city);
        if (coords) {
          setCityCoordinates(coords);
          setMapZoom(12); // Focus on city
        }

        fetchDriversByCity(city); // Fetch drivers based on city
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPickupLocation();
  }, []);

  const adjustMarkerPosition = (coordinates, index, total) => {
    const offset = 0.0001; // Offset distance
    const angle = (2 * Math.PI * index) / total; // Distribute markers in a circle
    return [
      coordinates[0] + offset * Math.cos(angle),
      coordinates[1] + offset * Math.sin(angle),
    ];
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="available-rides-container">
      <h2>All Available Drivers in {pickupLocation}</h2>
      {pickupLocation && <p>User Pickup Location: {pickupLocation}</p>}

      {drivers.length === 0 ? (
        <p>No drivers found in {pickupLocation}.</p>
      ) : (
        <>
          <table className="available-rides-table">
            <thead>
              <tr>
                <th>Driver ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Car Name</th>
                <th>Phone Number</th>
                <th>Car Number</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver, index) => (
                <tr key={index}>
                  <td>{driver.driver_id}</td>
                  <td>{driver.first_name}</td>
                  <td>{driver.last_name}</td>
                  <td>{driver.car_name}</td>
                  <td>{driver.phone_number}</td>
                  <td>{driver.car_number}</td>
                  <td>{driver.location_city}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="map-container">
            <MapContainer center={cityCoordinates} zoom={mapZoom} style={{ height: '400px', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              {drivers.map((driver, index) =>
                driver.coordinates ? (
                  <Marker
                    key={index}
                    position={adjustMarkerPosition(driver.coordinates, index, drivers.length)}
                    icon={uberCarIcon} // Use the Uber-like car icon
                  >
                    <Popup>
                      <div>
                        <strong>{driver.first_name} {driver.last_name}</strong>
                        <p>Car: {driver.car_name}</p>
                        <p>Phone: {driver.phone_number}</p>
                        <p>City: {driver.location_city}</p>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default AvailableRides;
