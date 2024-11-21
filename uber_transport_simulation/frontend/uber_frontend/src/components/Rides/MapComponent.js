// MapComponent.js
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';


const mapContainerStyle = {
 height: '400px',
 width: '100%'
};


const center = {
 lat: 37.7749,
 lng: -122.4194
};


const options = {
 restriction: {
   latLngBounds: {
     north: 38.4,
     south: 36.9,
     east: -121.8,
     west: -123.0
   },
   strictBounds: true
 },
 disableDefaultUI: false,
 zoomControl: true
};


const libraries = ['places'];


function MapComponent({
 apiKey,
 markers,
 setMarkers,
 directions,
 setDirections,
 setRouteInfo,
 setRide
}) {
 const pickupRef = useRef(null);
 const dropoffRef = useRef(null);
 const [isSettingPickup, setIsSettingPickup] = useState(true);
 const [map, setMap] = useState(null);
 const [mapLoaded, setMapLoaded] = useState(false);


 const onLoad = React.useCallback((map) => {
   setMap(map);
   setMapLoaded(true);
 }, []);


 const onUnmount = React.useCallback(() => {
   setMap(null);
   setMapLoaded(false);
 }, []);


 const handlePlaceChanged = (ref, index) => {
   if (ref.current && ref.current.getPlace) {
     const place = ref.current.getPlace();
     if (place.geometry) {
       const newMarkers = [...markers];
       newMarkers[index] = {
         lat: place.geometry.location.lat(),
         lng: place.geometry.location.lng(),
         address: place.formatted_address
       };
       setMarkers(newMarkers);
      
       setRide(prev => ({
         ...prev,
         [index === 0 ? 'pickup_location' : 'dropoff_location']: place.formatted_address
       }));
     }
   }
 };


 const handleMapClick = async (event) => {
   if (!window.google || !mapLoaded) return;
  
   const lat = event.latLng.lat();
   const lng = event.latLng.lng();
  
   try {
     const geocoder = new window.google.maps.Geocoder();
     const { results, status } = await new Promise((resolve, reject) => {
       geocoder.geocode({ location: { lat, lng } }, (results, status) => {
         if (status === 'OK') resolve({ results, status });
         else reject(status);
       });
     });


     if (status === 'OK' && results[0]) {
       const address = results[0].formatted_address;
       const newMarkers = [...markers];
      
       if (isSettingPickup) {
         newMarkers[0] = { lat, lng, address };
         setRide(prev => ({ ...prev, pickup_location: address }));
       } else {
         newMarkers[1] = { lat, lng, address };
         setRide(prev => ({ ...prev, dropoff_location: address }));
       }
      
       setMarkers(newMarkers);
       setIsSettingPickup(!isSettingPickup);
     }
   } catch (error) {
     console.error('Geocoding error:', error);
   }
 };


 const calculateRoute = async () => {
   if (!window.google || markers.length !== 2) return;


   try {
     const directionsService = new window.google.maps.DirectionsService();
     const result = await new Promise((resolve, reject) => {
       directionsService.route({
         origin: markers[0],
         destination: markers[1],
         travelMode: window.google.maps.TravelMode.DRIVING,
       }, (result, status) => {
         if (status === 'OK') resolve(result);
         else reject(status);
       });
     });


     setDirections(result);
    
     const route = result.routes[0].legs[0];
     const routeDetails = {
       distance: route.distance.text,
       duration: route.duration.text,
       // estimated_price: calculatePrice(route.distance.value)
     };
    
     setRouteInfo(routeDetails);
    
     setRide(prev => ({
       ...prev,
       distance: route.distance.text,
       duration: route.duration.text,
       // estimated_price: routeDetails.estimated_price
     }));
    
   } catch (error) {
     console.error('Error calculating route:', error);
   }
 };


 const calculatePrice = (distanceInMeters) => {
   const basePrice = 5.00;
   const pricePerKm = 1.50;
   const distanceInKm = distanceInMeters / 1000;
   return (basePrice + (distanceInKm * pricePerKm)).toFixed(2);
 };


 const resetMap = () => {
   setMarkers([]);
   setDirections(null);
   setRouteInfo(null);
   setIsSettingPickup(true);
   setRide({
     pickup_location: '',
     dropoff_location: '',
     pickup_datetime: '',
     distance: '',
     duration: '',
     estimated_price: '',
     customer: 'customerID'
   });
 };


 useEffect(() => {
   if (mapLoaded && markers.length === 2) {
     calculateRoute();
   }
 }, [markers, mapLoaded]);


 return (
   <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
     <div className="space-y-4">
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
         <Autocomplete
           onLoad={ref => pickupRef.current = ref}
           onPlaceChanged={() => handlePlaceChanged(pickupRef, 0)}
         >
           <input
             type="text"
             placeholder="Enter pickup location"
             style={{
               width: '100%',
               padding: '0.5rem',
               border: '1px solid #ccc',
               borderRadius: '4px'
             }}
           />
         </Autocomplete>
         <Autocomplete
           onLoad={ref => dropoffRef.current = ref}
           onPlaceChanged={() => handlePlaceChanged(dropoffRef, 1)}
         >
           <input
             type="text"
             placeholder="Enter dropoff location"
             style={{
               width: '100%',
               padding: '0.5rem',
               border: '1px solid #ccc',
               borderRadius: '4px'
             }}
           />
         </Autocomplete>
       </div>


       <div style={{ position: 'relative' }}>
         <GoogleMap
           mapContainerStyle={mapContainerStyle}
           center={center}
           zoom={10}
           options={options}
           onClick={handleMapClick}
           onLoad={onLoad}
           onUnmount={onUnmount}
         >
           {markers.map((marker, index) => (
             <Marker
               key={index}
               position={marker}
               label={index === 0 ? 'P' : 'D'}
             />
           ))}
           {directions && <DirectionsRenderer directions={directions} />}
         </GoogleMap>


         <div style={{
           position: 'absolute',
           top: '1rem',
           right: '1rem',
           display: 'flex',
           gap: '0.5rem'
         }}>
           <button
             onClick={() => setIsSettingPickup(true)}
             style={{
               padding: '0.5rem 1rem',
               backgroundColor: isSettingPickup ? '#4F46E5' : '#fff',
               color: isSettingPickup ? '#fff' : '#000',
               border: '1px solid #4F46E5',
               borderRadius: '4px',
               cursor: 'pointer'
             }}
           >
             Set Pickup
           </button>
           <button
             onClick={() => setIsSettingPickup(false)}
             style={{
               padding: '0.5rem 1rem',
               backgroundColor: !isSettingPickup ? '#4F46E5' : '#fff',
               color: !isSettingPickup ? '#fff' : '#000',
               border: '1px solid #4F46E5',
               borderRadius: '4px',
               cursor: 'pointer'
             }}
           >
             Set Dropoff
           </button>
           <button
             onClick={resetMap}
             style={{
               padding: '0.5rem 1rem',
               backgroundColor: '#fff',
               border: '1px solid #ccc',
               borderRadius: '4px',
               cursor: 'pointer'
             }}
           >
             Reset
           </button>
         </div>
       </div>
     </div>
   </LoadScript>
 );
}


export default MapComponent;