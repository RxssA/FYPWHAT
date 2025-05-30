import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styles from './HeartRatePage.module.css';
import Navbar from '../Components/Navbar';
import '../App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HeartRatePage = () => {
  const [data, setData] = useState([]);
  const [factIndex, setFactIndex] = useState(0);
  const isLoggedIn = localStorage.getItem('username');

  const heartRateFacts = [
    "The average resting heart rate for adults is 60-100 BPM.",
    "Regular exercise can lower your resting heart rate over time.",
    "Athletes often have a resting heart rate below 60 BPM.",
    "Stress, caffeine, and dehydration can increase heart rate.",
    "The highest recorded human heart rate was over 300 BPM due to a rare medical condition.",
    "Bradycardia (low heart rate) is considered anything below 60 BPM (except in athletes).",
    "Tachycardia (high heart rate) is when the resting heart rate exceeds 100 BPM."
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/data/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // Add function to send new data
  const sendData = async (heartRate, temperature) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          heartRate,
          temperature,
          location: { lat: 0, lng: 0 } // default location
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Data sent successfully:', result);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={styles['centered-text']}>
        <div className={styles['data-box']}>
          <h2>Please Log In</h2>
          <p>You need to be logged in to view your heart rate data.</p>
          <Link to="/login">
            <button className={styles['nav-btn']}>Go to Login</button>
          </Link>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="App">
        <Navbar />
        <div className="content">
          <div className="heart-rate-page">
            <p className={styles.loading}>Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  const labels = data.map((record) => new Date(record.timestamp).toLocaleTimeString());
  const heartRateData = data.map((record) => record.heartRate);
  const averageHeartRateData = data.map((record) => record.averageHeartRate);
  const highestHeartRateData = data.map((record) => record.highestHeartRate);
  const lowestHeartRateData = data.map((record) => record.lowestHeartRate);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Heart Rate (BPM)',
        },
        beginAtZero: true,
      },
    },
  };

  const createDataset = (label, data, borderColor, backgroundColor) => ({
    label,
    data,
    borderColor,
    backgroundColor,
    borderWidth: 2,
    tension: 0.3,
  });

  const chartData = {
    labels,
    datasets: [
      createDataset('Heart Rate', heartRateData, 'rgb(75, 192, 192)', 'rgb(75, 192, 192)'),
      createDataset('Average Heart Rate', averageHeartRateData, 'rgb(153, 102, 255)', 'rgb(153, 102, 255)'),
      createDataset('Highest Heart Rate', highestHeartRateData, 'rgb(255, 99, 132)', 'rgb(255, 99, 132)'),
      createDataset('Lowest Heart Rate', lowestHeartRateData, 'rgb(54, 162, 235)', 'rgb(54, 162, 235)'),
    ],
  };

  const nextFact = () => {
    setFactIndex((prevIndex) => (prevIndex + 1) % heartRateFacts.length);
  };

  return (
    <div className="App">
      <Navbar />
      <div className="content">
        <div className="heart-rate-page">
          <div className={styles['centered-text']}>
            <div className={styles['data-box']}>
              <h2>Heart Rate Data</h2>
              <Line data={chartData} options={chartOptions} width={1000} height={400} />
            </div>
            <div className={styles['text-container']}>
              <h3>Heart Rate Fact</h3>
              <div className={styles['fact-box']}>
                <p>{heartRateFacts[factIndex]}</p>
                <button className={styles['next-btn']} onClick={nextFact}>➡️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeartRatePage;
