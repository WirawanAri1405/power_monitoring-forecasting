import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
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
import './App.css';

// Registrasi komponen ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Daya Aktual (W)',
        data: [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Prediksi (W)',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monitoring & Prediksi Daya Listrik Real-Time',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Waktu',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Daya (Watt)',
        },
        beginAtZero: true,
      },
    },
  };

  // Gunakan useRef untuk menyimpan data agar tidak hilang saat re-render
  const dataRef = useRef({ labels: [], actual: [], predicted: [] });

  // Fungsi untuk mengambil data dari API
  const fetchData = async () => {
    try {
      // Ganti URL jika backend Anda berjalan di port yang berbeda
      const monitoringRes = await axios.get('http://127.0.0.1:8000/monitoring/api/');
      const predictionRes = await axios.get('http://127.0.0.1:8000/prediction/run/');

      const { power, timestamp } = monitoringRes.data;
      const { predicted_power } = predictionRes.data;
      const timeLabel = new Date(timestamp).toLocaleTimeString();

      // Update data di ref
      dataRef.current.labels.push(timeLabel);
      dataRef.current.actual.push(power);
      dataRef.current.predicted.push(predicted_power);

      // Batasi jumlah data yang ditampilkan agar grafik tidak terlalu padat
      const maxDataPoints = 20;
      if (dataRef.current.labels.length > maxDataPoints) {
        dataRef.current.labels.shift();
        dataRef.current.actual.shift();
        dataRef.current.predicted.shift();
      }

      // Update state chart
      setChartData({
        labels: [...dataRef.current.labels],
        datasets: [
          { ...chartData.datasets[0], data: [...dataRef.current.actual] },
          { ...chartData.datasets[1], data: [...dataRef.current.predicted] },
        ],
      });

    } catch (error) {
      console.error("Gagal mengambil data dari API:", error);
    }
  };

  // useEffect untuk menjalankan fetchData secara periodik
  useEffect(() => {
    fetchData(); // Panggil sekali saat komponen dimuat
    const interval = setInterval(fetchData, 5000); // Ambil data setiap 5 detik
    return () => clearInterval(interval); // Bersihkan interval saat komponen di-unmount
  }, []); // Dependensi kosong agar hanya berjalan sekali di awal

  return (
    <div className="App">
      <header className="App-header">
        <h1>📊 Dashboard Energi Cerdas</h1>
      </header>
      <div className="chart-container">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}

export default App;