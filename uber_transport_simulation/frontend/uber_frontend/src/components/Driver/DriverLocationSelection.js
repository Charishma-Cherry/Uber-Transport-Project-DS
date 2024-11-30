
import React, { useState, useEffect } from "react";
import Select from "react-select";
import './DriverLocationSelection.css'; // Import the CSS file for styling

const DriverLocationSelection = () => {
  const [states, setStates] = useState([]); // List of states
  const [counties, setCounties] = useState([]); // List of counties
  const [cities, setCities] = useState([]); // List of cities
  const [selectedState, setSelectedState] = useState(null); // Selected state
  const [selectedCounty, setSelectedCounty] = useState(null); // Selected county
  const [selectedCity, setSelectedCity] = useState(null); // Selected city
  const [locationSaved, setLocationSaved] = useState(false); // Success message flag
  const [selectedLocation, setSelectedLocation] = useState("No location selected"); // Selected location state

  // Fetch states dynamically on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(
          "https://api.census.gov/data/2020/acs/acs5?get=NAME&for=state:*"
        );
        const data = await response.json();
        const formattedStates = data.slice(1).map(([name, code]) => ({
          label: name,
          value: code,
        }));
        setStates(formattedStates);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  // Fetch counties dynamically based on the selected state
  const handleStateChange = async (selectedOption) => {
    setSelectedState(selectedOption);
    setSelectedCounty(null); // Reset county selection
    setSelectedCity(null); // Reset city selection
    setLocationSaved(false); // Reset success message
    try {
      const countyResponse = await fetch(
        `https://api.census.gov/data/2020/acs/acs5?get=NAME&for=county:*&in=state:${selectedOption.value}`
      );
      const countyData = await countyResponse.json();
      const formattedCounties = countyData.slice(1).map(([name, , countyCode]) => ({
        label: name.replace(/, California/, ""), // Clean up county name
        value: countyCode,
      }));
      setCounties(formattedCounties);

      const cityResponse = await fetch(
        `https://api.census.gov/data/2020/acs/acs5?get=NAME&for=place:*&in=state:${selectedOption.value}`
      );
      const cityData = await cityResponse.json();
      const formattedCities = cityData.slice(1).map(([name]) => ({
        label: name.replace(/ city, California| CDP, California/, ""), // Clean up city name
        value: name,
      }));
      setCities(formattedCities);
    } catch (error) {
      console.error("Error fetching counties or cities:", error);
    }
  };

  // Handle county change
  const handleCountyChange = (selectedOption) => {
    setSelectedCounty(selectedOption);
    setSelectedCity(null); // Reset city selection
    setLocationSaved(false); // Reset success message
  };

  // Handle city change
  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
    setLocationSaved(false); // Reset success message
  };

  // Handle save action
  const handleSave = async () => {
    const combinedLocation = [
      selectedState?.label,
      selectedCounty?.label,
      selectedCity?.label,
    ]
      .filter(Boolean) // Filters out null or undefined values
      .join(", ");

    try {
      const response = await fetch("http://localhost:8000/api/drivers/update_location/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          location_state: selectedState?.label,
          location_county: selectedCounty?.label,
          location_city: selectedCity?.label,
        }),
      });

      if (response.ok) {
        setSelectedLocation(combinedLocation); // Update the selected location state
        setLocationSaved(true); // Show success message
        alert("Location saved successfully: " + combinedLocation);
      } else {
        alert("Failed to save location. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while saving location.");
    }
  };

  return (
    <div className="location-selection-container">
      <h2>Select Location you are willing to drive today</h2>
      <div className="form-group">
        <label>
          <strong>Country:</strong>
        </label>
        <Select
          options={[{ label: "United States", value: "US" }]}
          value={{ label: "United States", value: "US" }}
          isDisabled
        />
      </div>
      <div className="form-group">
        <label>
          <strong>State:</strong>
        </label>
        <Select
          options={states}
          value={selectedState}
          onChange={handleStateChange}
          placeholder="Select a state"
        />
      </div>
      <div className="form-group">
        <label>
          <strong>County:</strong>
        </label>
        <Select
          options={counties}
          value={selectedCounty}
          onChange={handleCountyChange}
          placeholder="Select a county"
          isDisabled={!selectedState}
        />
      </div>
      <div className="form-group">
        <label>
          <strong>City:</strong>
        </label>
        <Select
          options={cities}
          value={selectedCity}
          onChange={handleCityChange}
          placeholder="Select a city"
          isDisabled={!selectedState}
        />
      </div>
      <button onClick={handleSave}>Save</button>
      {locationSaved && (
        <div className="success-message">
          <strong>Location selected successfully!</strong>
        </div>
      )}
      <div className="selected-location">
        <h3>Location willing to drive:</h3>
        <p>{selectedLocation || "No location selected"}</p>
      </div>
    </div>
  );
};

export default DriverLocationSelection;
