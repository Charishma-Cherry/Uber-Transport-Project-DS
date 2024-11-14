import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api';
import { BACKEND_HOST_NAME } from '../../api';
import './DriverProfile.css';

function DriverProfile() {
    const { driverId } = useParams();
    const navigate = useNavigate();
    const [driverData, setDriverData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [imageUpdated, setImageUpdated] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [carNumberError, setCarNumberError] = useState('');

    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                const response = await axios.get(`/drivers/${driverId}/profile/`);
                setDriverData(response.data);
                setProfilePicture(
                    response.data.introduction_media_url
                        ? response.data.introduction_media_url.startsWith('http')
                            ? response.data.introduction_media_url
                            : `${BACKEND_HOST_NAME}${response.data.introduction_media_url}`
                        : null
                );
            } catch (err) {
                setError('Driver not found');
            } finally {
                setLoading(false);
            }
        };
        fetchDriverData();
    }, [driverId]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone_number' && value.length > 10) {
            setPhoneError('Phone number cannot exceed 10 digits');
        } else if (name === 'car_number' && value.length > 7) {
            setCarNumberError('Car number cannot exceed 7 characters');
        } else {
            setPhoneError('');
            setCarNumberError('');
        }
        setDriverData({ ...driverData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setImageUpdated(true);
        }
    };

    const handleProfileUpdate = async () => {
        const formData = new FormData();
        Object.keys(driverData).forEach((key) => formData.append(key, driverData[key]));
        if (imageUpdated === false) {
            formData.delete('introduction_media');
        } else if (profilePicture instanceof File) {
            formData.append('introduction_media', profilePicture);
        }
        try {
            const response = await axios.patch('/drivers/update_profile/', formData, {
                headers: { 
                    Authorization: `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                },
            });
            alert('Profile updated successfully!');
            if (response.data.introduction_media_url) {
                setProfilePicture(response.data.introduction_media_url);
            }
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile');
        }
    };

    const handleDeleteProfile = async () => {
        if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
            try {
                await axios.delete(`/drivers/${driverId}/delete_profile/`, {
                    headers: { Authorization: `Token ${localStorage.getItem('token')}` },
                });
                localStorage.clear();
                alert('Profile deleted successfully!');
                navigate('/');
            } catch (err) {
                setError('Failed to delete profile');
            }
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="profile-container">
            <div className="profile-details">
                <h2>Driver Profile</h2>
                {isEditing ? (
                    <div>
                        <label>
                            First Name:
                            <input
                                type="text"
                                name="first_name"
                                value={driverData.first_name || ''}
                                onChange={handleProfileChange}
                            />
                        </label>
                        <label>
                            Last Name:
                            <input
                                type="text"
                                name="last_name"
                                value={driverData.last_name || ''}
                                onChange={handleProfileChange}
                            />
                        </label>
                        <label>
                            Phone Number:
                            <input
                                type="text"
                                name="phone_number"
                                value={driverData.phone_number || ''}
                                onChange={handleProfileChange}
                            />
                            {phoneError && <p style={{ color: 'red' }}>{phoneError}</p>}
                        </label>
                        <label>
                            Car Number:
                            <input
                                type="text"
                                name="car_number"
                                value={driverData.car_number || ''}
                                onChange={handleProfileChange}
                            />
                            {carNumberError && <p style={{ color: 'red' }}>{carNumberError}</p>}
                        </label>
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={driverData.email || ''}
                                onChange={handleProfileChange}
                            />
                        </label>
                        <label>
                            Address:
                            <input
                                type="text"
                                name="address"
                                value={driverData.address || ''}
                                onChange={handleProfileChange}
                            />
                        </label>
                        <label>
                            City:
                            <input
                                type="text"
                                name="city"
                                value={driverData.city || ''}
                                onChange={handleProfileChange}
                            />
                        </label>
                        <label>
                            State:
                            <input
                                type="text"
                                name="state"
                                value={driverData.state || ''}
                                onChange={handleProfileChange}
                            />
                        </label>
                        <label>
                            Zip Code:
                            <input
                                type="text"
                                name="zip_code"
                                value={driverData.zip_code || ''}
                                onChange={handleProfileChange}
                            />
                        </label>
                        <label>
                            Car Name:
                            <input
                                type="text"
                                name="car_name"
                                value={driverData.car_name || ''}
                                onChange={handleProfileChange}
                            />
                        </label>
                        <label>
                            Profile Picture:
                            <input
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                            />
                        </label>
                        <div className="button-container">
                            <button onClick={handleProfileUpdate}>Save</button>
                            <button onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p><strong>Name:</strong> {driverData.first_name} {driverData.last_name}</p>
                        <p><strong>Email:</strong> {driverData.email}</p>
                        <p><strong>Address:</strong> {driverData.address}, {driverData.city}, {driverData.state}, {driverData.zip_code}</p>
                        <p><strong>Car:</strong> {driverData.car_name} - {driverData.car_number}</p>
                        <p><strong>Phone:</strong> {driverData.phone_number}</p>
                        <div className="button-container">
                            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                            <button onClick={handleDeleteProfile} className="delete-button">Delete Profile</button>
                        </div>
                    </>
                )}
            </div>
            <div className="profile-image">
                {profilePicture && (
                    <img
                        src={typeof profilePicture === 'string' ? profilePicture : URL.createObjectURL(profilePicture)}
                        alt="Profile"
                    />
                )}
            </div>
        </div>
    );
}

export default DriverProfile;