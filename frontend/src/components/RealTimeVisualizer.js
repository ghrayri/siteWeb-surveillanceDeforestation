import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';


export default function RealTimeVisualizer({ realTimeData }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!realTimeData || !realTimeData.timeseries) {
      setChartData([]);
      return;
    }
    setLoading(true);
    try {
      // Format real-time data for visualization
      const formatted = realTimeData.timeseries.map(point => ({
        date: new Date(point.timestamp).toLocaleString(),
        value: point.value
      }));
      setChartData(formatted);
      setLoading(false);
    } catch (e) {
      setError("Error loading real-time data.");
      setLoading(false);
    }
  }, [realTimeData]);

  // Calculate bounds for Y axis
  const minValue = chartData.length > 0 ? Math.min(...chartData.map(p => p.value)) : 0;
  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(p => p.value)) : 1;

  return (
    <div className="real-time-visualizer-dashboard">
      <h3>{realTimeData.device_name || `Device #${realTimeData.device_id}`}</h3>
      <Card className="mb-4">
        <Card.Header>
          <strong>Real-time Measurements</strong>
        </Card.Header>
        <Card.Body>
          {loading && <Spinner animation="border" size="sm" />}
          {error && <Alert variant="danger">{error}</Alert>}
          {chartData.length > 0 ? (
            <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                {/* Axes */}
                <line x1="50" y1="250" x2="950" y2="250" stroke="#333" strokeWidth="1" />
                <line x1="50" y1="50" x2="50" y2="250" stroke="#333" strokeWidth="1" />
                {/* Grid lines */}
                <line x1="50" y1="150" x2="950" y2="150" stroke="#ddd" strokeWidth="1" />
                {/* Curve */}
                <polyline
                  points={
                    chartData.map((point, index) => {
                      const x = 50 + (900 / (chartData.length - 1 || 1)) * index;
                      // Normalize value for Y axis
                      const y = 250 - ((point.value - minValue) / (maxValue - minValue || 1)) * 200;
                      return `${x},${y}`;
                    }).join(' ')
                  }
                  fill="none"
                  stroke="#007bff"
                  strokeWidth="2"
                />
                {/* Points */}
                {chartData.map((point, index) => {
                  const x = 50 + (900 / (chartData.length - 1 || 1)) * index;
                  const y = 250 - ((point.value - minValue) / (maxValue - minValue || 1)) * 200;
                  return (
                    <g key={index}>
                      <circle cx={x} cy={y} r="4" fill="#007bff" />
                      <text x={x} y="270" textAnchor="middle" fontSize="10">{point.date}</text>
                      <text x={x} y={y - 10} textAnchor="middle" fontSize="10">{point.value.toFixed(2)}</text>
                    </g>
                  );
                })}
                {/* Y axis labels */}
                <text x="45" y="250" textAnchor="end" fontSize="10">{minValue.toFixed(2)}</text>
                <text x="45" y="150" textAnchor="end" fontSize="10">{((minValue + maxValue) / 2).toFixed(2)}</text>
                <text x="45" y="50" textAnchor="end" fontSize="10">{maxValue.toFixed(2)}</text>
              </svg>
            </div>
          ) : (
            <Alert variant="info">No real-time data available</Alert>
          )}
        </Card.Body>
      </Card>
      <div className="data-values">
        <p><strong>Device ID:</strong> {realTimeData.device_id}</p>
        <p><strong>Device Name:</strong> {realTimeData.device_name || 'N/A'}</p>
        <p><strong>Data Type:</strong> {realTimeData.data_type}</p>
        <p><strong>Current Value:</strong> {realTimeData.value?.toFixed(2) || 'N/A'}</p>
        <p><strong>Timestamp:</strong> {new Date(realTimeData.timestamp).toLocaleString()}</p>
        <p><strong>Region:</strong> {realTimeData.region?.name || 'N/A'}</p>
        <p><strong>Created At:</strong> {new Date(realTimeData.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}