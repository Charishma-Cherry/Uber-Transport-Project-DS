

import React, { useState, useEffect } from 'react';
import { fetchRevenuePerDay, fetchTotalRidesPerArea, fetchRidesPerDriver, fetchRidesPerCustomer } from '../../services/billingService';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const StatisticsPage = () => {
  const [revenuePerDay, setRevenuePerDay] = useState([]);
  const [totalRidesPerArea, setTotalRidesPerArea] = useState([]);
  const [ridesPerDriver, setRidesPerDriver] = useState([]);
  const [ridesPerCustomer, setRidesPerCustomer] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const revenue = await fetchRevenuePerDay();
        const ridesArea = await fetchTotalRidesPerArea();
        const ridesDriver = await fetchRidesPerDriver();
        const ridesCustomer = await fetchRidesPerCustomer();

        setRevenuePerDay(revenue);
        setTotalRidesPerArea(ridesArea);
        setRidesPerDriver(ridesDriver);
        setRidesPerCustomer(ridesCustomer);
      } catch (err) {
        console.error('Error fetching statistics:', err);
      }
    };
    fetchData();
  }, []);

  // Prepare data for the graphs
  const revenueData = {
    labels: revenuePerDay.map((item) => item.date),
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenuePerDay.map((item) => item.total_revenue),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const areaData = {
    labels: totalRidesPerArea.map((item) => item.source_location),
    datasets: [
      {
        label: 'Total Rides',
        data: totalRidesPerArea.map((item) => item.total_rides),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const driverData = {
    labels: ridesPerDriver.map((item) => item.driver_name),
    datasets: [
      {
        label: 'Total Rides',
        data: ridesPerDriver.map((item) => item.total_rides),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const customerData = {
    labels: ridesPerCustomer.map((item) => item.customer_name),
    datasets: [
      {
        label: 'Total Rides',
        data: ridesPerCustomer.map((item) => item.total_rides),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
  };

  const chartStyle = {
    width: '400px', // Reduce the chart width
    height: '300px', // Reduce the chart height
    margin: '0 auto', // Center the charts
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Statistics</h1>

      <div className="mb-5">
        <h3>Revenue Per Day</h3>
        {revenuePerDay.length > 0 ? (
          <div style={chartStyle}>
            <Bar data={revenueData} options={chartOptions} />
          </div>
        ) : (
          <p>No data available.</p>
        )}
      </div>

      <div className="mb-5">
        <h3>Total Rides Per Area</h3>
        {totalRidesPerArea.length > 0 ? (
          <div style={chartStyle}>
            <Pie data={areaData} options={chartOptions} />
          </div>
        ) : (
          <p>No data available.</p>
        )}
      </div>

      <div className="mb-5">
        <h3>Rides Per Driver</h3>
        {ridesPerDriver.length > 0 ? (
          <div style={chartStyle}>
            <Bar data={driverData} options={chartOptions} />
          </div>
        ) : (
          <p>No data available.</p>
        )}
      </div>

      <div className="mb-5">
        <h3>Rides Per Customer</h3>
        {ridesPerCustomer.length > 0 ? (
          <div style={chartStyle}>
            <Pie data={customerData} options={chartOptions} />
          </div>
        ) : (
          <p>No data available.</p>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;

