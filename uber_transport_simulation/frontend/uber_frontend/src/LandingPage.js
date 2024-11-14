// src/components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import '../src/components/User/Signup';
import '../src/components/User/Login';

function LandingPage() {
    return (
        <div className="landing-container">
            <div className="content">
                <h1 className="landing-header">Go anywhere with Uber!</h1>
                <div className="landing-options">
                    <Link to="/user/signup" className="landing-option">
                        New Rider? Sign up and Join us! <span className="arrow">→</span>
                    </Link>
                    <Link to="/user/login" className="landing-option">
                        Already a Rider? Sign in! <span className="arrow">→</span>
                    </Link>
                    <Link to="/driver/signup" className="landing-option">
                        New Driver? Sign up and Join the Fam! <span className="arrow">→</span>
                    </Link>
                    <Link to="/driver/login" className="landing-option">
                        Already a Driver? Sign in to ride. <span className="arrow">→</span>
                    </Link>
                </div>
            </div>
            <div className="map-view">
                <iframe
                    title="map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3171.7723005395863!2d-121.88632838468428!3d37.338207979841996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fcca8bf1d5e1f%3A0x269621eeb880da0!2sSan%20Jose%2C%20CA!5e0!3m2!1sen!2sus!4v1638892117745!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                ></iframe>
            </div>
        </div>
    );
}

export default LandingPage;
