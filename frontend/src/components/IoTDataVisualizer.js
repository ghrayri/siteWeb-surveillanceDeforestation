import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';


import IoTGauge from './IoTGauge';
import IoTDataExporter from './IoTDataExporter';

export default function IoTDataVisualizer({ iotData }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!iotData || !iotData.timeseries) {
      setChartData([]);
      return;
    }
    setLoading(true);
    try {
      // Suppose iotData.timeseries is an array of { timestamp, value }
      const formatted = iotData.timeseries.map(point => ({
        date: new Date(point.timestamp).toLocaleString(),
        value: point.value
      }));
      setChartData(formatted);
      setLoading(false);
    } catch (e) {
      setError("Erreur lors du chargement des données temporelles IoT.");
      setLoading(false);
    }
  }, [iotData]);

  // Calcul des bornes pour l'axe Y
  const minValue = chartData.length > 0 ? Math.min(...chartData.map(p => p.value)) : 0;
  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(p => p.value)) : 1;

  return (
    <div className="iot-data-visualizer-dashboard">
      <h3>Données IoT - {iotData.timestamp ? new Date(iotData.timestamp).toLocaleString() : 'N/A'}</h3>
      <IoTDataExporter data={iotData} />
      <div className="row mb-4">
        <div className="col-md-3">
          <IoTGauge 
            value={iotData.amg_avg_temp || 0}
            min={-20}
            max={50}
            title="Température moyenne"
            unit="°C"
          />
        </div>
        <div className="col-md-3">
          <IoTGauge 
            value={iotData.amg_max_temp || 0}
            min={-20}
            max={50}
            title="Température max"
            unit="°C"
          />
        </div>
        <div className="col-md-3">
          <IoTGauge 
            value={iotData.amg_min_temp || 0}
            min={-20}
            max={50}
            title="Température min"
            unit="°C"
          />
        </div>
        <div className="col-md-3">
          <IoTGauge 
            value={iotData.bme_temp || 0}
            min={-20}
            max={50}
            title="Température BME"
            unit="°C"
          />
        </div>
      </div>
      <Card className="mb-4">
        <Card.Header>
          <strong>Série temporelle des mesures</strong>
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
                {/* Lignes de grille horizontales */}
                <line x1="50" y1="150" x2="950" y2="150" stroke="#ddd" strokeWidth="1" />
                {/* Courbe */}
                <polyline
                  points={
                    chartData.map((point, index) => {
                      const x = 50 + (900 / (chartData.length - 1 || 1)) * index;
                      // Normalisation de la valeur sur l'axe Y
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
                {/* Labels Y */}
                <text x="45" y="250" textAnchor="end" fontSize="10">{minValue.toFixed(2)}</text>
                <text x="45" y="150" textAnchor="end" fontSize="10">{((minValue + maxValue) / 2).toFixed(2)}</text>
                <text x="45" y="50" textAnchor="end" fontSize="10">{maxValue.toFixed(2)}</text>
              </svg>
            </div>
          ) : (
            <Alert variant="info">Aucune donnée temporelle disponible</Alert>
          )}
        </Card.Body>
      </Card>
      <div className="data-values">
        <p><strong>Timestamp:</strong> {iotData.timestamp ? new Date(iotData.timestamp).toLocaleString() : 'N/A'}</p>
        <p><strong>Température moyenne:</strong> {iotData.amg_avg_temp?.toFixed(2) || 'N/A'} °C</p>
        <p><strong>Température max:</strong> {iotData.amg_max_temp?.toFixed(2) || 'N/A'} °C</p>
        <p><strong>Température min:</strong> {iotData.amg_min_temp?.toFixed(2) || 'N/A'} °C</p>
        <p><strong>Température BME:</strong> {iotData.bme_temp?.toFixed(2) || 'N/A'} °C</p>
        <p><strong>Humidité BME:</strong> {iotData.bme_humidity?.toFixed(2) || 'N/A'} %</p>
        <p><strong>Pression BME:</strong> {iotData.bme_pressure?.toFixed(2) || 'N/A'} hPa</p>
        <p><strong>Gaz BME:</strong> {iotData.bme_gas?.toFixed(2) || 'N/A'}</p>
        <p><strong>Humidité du sol:</strong> {iotData.soil_moisture?.toFixed(2) || 'N/A'} %</p>
        <p><strong>Luminosité:</strong> {iotData.luminosity?.toFixed(2) || 'N/A'}</p>
      </div>
    </div>
  );
}