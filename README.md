# **Uber Transport Simulation Project Documentation**

## **Table of Contents**
1. [Introduction](#1-introduction)  
   1.1 [Project Overview](#11-project-overview)  
   1.2 [Objectives](#12-objectives)  
2. [System Architecture](#2-system-architecture)  
   2.1 [Overview](#21-overview)  
   2.2 [Components](#22-components)  
3. [Detailed Design](#3-detailed-design)  
   3.1 [Entities and Relationships](#31-entities-and-relationships)  
   3.2 [System Components Interaction](#32-system-components-interaction)  
4. [Dynamic Pricing Model](#4-dynamic-pricing-model)  
   4.1 [Overview](#41-overview)  
   4.2 [Pricing Factors](#42-pricing-factors)  
5. [Features](#5-features)  
6. [Prerequisites](#6-prerequisites)  
7. [Installation](#7-installation)  
   7.1 [Backend Installation](#71-backend-installation)  
   7.2 [Frontend Installation](#72-frontend-installation)  
8. [Conclusion](#8-conclusion)  

---

## **1. Introduction**

### **1.1 Project Overview**
This document outlines the design and architecture of the **Uber Transport Simulation System**. The system replicates Uber's transportation network, focusing on managing drivers, customers, billing, admin operations, and rides using a three-tier architecture. The project integrates a **dynamic pricing algorithm**, scalable database management, and Kafka for distributed messaging to simulate a real-world environment.

### **1.2 Objectives**
- Simulate and manage Uber-like ride-sharing services.  
- Implement a scalable and fault-tolerant system architecture.  
- Develop RESTful APIs to ensure smooth communication between the frontend and backend.  
- Create a dynamic pricing model that adjusts fares based on real-time demand and supply.  

---

## **2. System Architecture**

### **2.1 Overview**
The system follows a **three-tier architecture**:  
1. **Client Tier**: A Node.js application for user interaction (e.g., ride requests, managing profiles).  
2. **Middleware Tier**: RESTful APIs and Kafka-based communication for request processing and data management.  
3. **Database Tier**: MySQL for storing structured data such as customer details, rides, and billing information.  

### **2.2 Components**

#### **Frontend (Client Tier)**
- Provides interfaces for managing drivers, customers, and ride details.  
- Enables users to request rides, update profiles, and view billing information.  

#### **Backend (Middleware Tier)**  
- REST APIs handle operations related to drivers, customers, rides, and billing.  
- Kafka facilitates real-time communication between distributed services.  

#### **Database (Data Tier)**  
- MySQL stores all structured data, including customer details, driver information, rides, and billing records.  

---

## **3. Detailed Design**

### **3.1 Entities and Relationships**
- **Driver Entity**: Includes personal details, car information, ride history, and reviews.  
  - **Relationships**: One-to-many with rides and reviews.  
- **Customer Entity**: Includes personal and payment details, ride history, and reviews.  
  - **Relationships**: One-to-many with rides and billing records.  
- **Ride Entity**: Represents a ride with pickup/drop-off locations and times.  
  - **Belongs to**: Customer and Driver.  
- **Billing Entity**: Represents the billing details for each ride.  
  - **Linked to**: Customer and Driver.  
- **Admin Entity**: Manages users, drivers, billing, and rides.  

### **3.2 System Components Interaction**
1. **Client and Middleware**: The client interacts with REST APIs to perform CRUD operations.  
2. **Middleware and Database**: Middleware communicates with MySQL to retrieve, update, and store data.  
3. **Kafka Messaging**: Enables real-time communication between services.

---

## **4. Dynamic Pricing Model**

### **4.1 Overview**
The **dynamic pricing model** adjusts ride fares based on factors like demand, supply, weather, and traffic conditions.

### **4.2 Pricing Factors**
- **Base Fare**: Calculated based on distance, time, and local rates.  
- **Surge Pricing**: Activated when demand exceeds supply, using historical data and real-time conditions.  
- **Machine Learning**: Algorithms predict demand patterns and adjust pricing in real-time.

---

## **5. Features**

### **User Side**
- Login/Signup  
- Profile updates  
- Book a ride  
- Rate a driver  

### **Driver Side**
- Login/Signup  
- Profile updates  
- Manage ride availability  
- Rate a user  

### **Admin Side**
- Login/Signup  
- Manage users, drivers, rides, and bills  
- View statistics (e.g., revenue per day, total rides by area)  
- Graphical representations of rides by area, driver, and customer  

---

## **6. Prerequisites**
- Ensure the `requirements.txt` file is properly set up.  
- Docker and Kafka must be installed for distributed messaging.

---

## **7. Installation**

### **7.1 Backend Installation**

# Clone the repository
git clone https://github.com/Charishma-Cherry/Uber-Transport-Project-DS.git

# Set up a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure MySQL and Kafka
MYSQL account details needed. 
Docker Hub is required to push images to docker. 

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start the server
python manage.py runserver

### **7.2 Frontend Installation**

# Navigate to the frontend directory
cd frontend

# Install dependencies ( Check Package.json if any additional requirements needed )
npm install
npm install react-leaflet leaflet

# Start the development server
npm start

## **8. Conclusion**

The Uber Transport Simulation Project provides a comprehensive simulation of Uber’s ride-sharing services. It emphasizes scalability, fault tolerance, and real-time communication between users, drivers, and backend systems. The dynamic pricing model ensures efficient fare calculations, contributing to a responsive and reliable ride-sharing experience.

