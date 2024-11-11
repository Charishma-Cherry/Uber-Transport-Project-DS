import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './HomePage.css'; 

const HomePage = () => {
  return (
    <div className="home-page text-center mt-5">
      <h1>Welcome to Uber Transport</h1>
      <div className="selection-buttons mt-4">
        <Button as={Link} to="/user/login" variant="primary" className="mx-2">User Login</Button>
      </div>
    </div>
  );
};

export default HomePage;