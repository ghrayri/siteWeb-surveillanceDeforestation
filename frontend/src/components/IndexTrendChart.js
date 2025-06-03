import React, { useState, useEffect } from 'react';
import { Card, Form, Spinner, Alert } from 'react-bootstrap';
import { getLatestIndices } from '../services/satellite';

const IndexTrendChart = ({ regionId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indexType, setIndexType] = useState('NDVI');
  const [timeRange, setTimeRange] = useState('3');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch indices based on selected parameters
        const params = {
          type: indexType,
          days: timeRange * 365, // Convert years to days
          region: regionId
        };
        
        const indicesData = await getLatestIndices(params);
        
        // Format data for chart
        const formattedData = indicesData.map(index => ({
          date: new Date(index.acquisition_date).toLocaleDateString(),
          value: index.mean_value,
          min: index.min_value,
          max: index.max_value
        }));
        
        // Sort by date (oldest first)
        formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setChartData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trend data:', err);
        setError('Erreur lors du chargement des données de tendance');
        setLoading(false);
      }
    };

    if (regionId) {
      fetchData();
    }
  }, [regionId, indexType, timeRange]);

  // Get color based on index type
  const getIndexColor = () => {
    switch (indexType) {
      case 'NDVI':
        return '#1a9850'; // Green
      case 'NDWI':
        return '#4575b4'; // Blue
      case 'NDMI':
        return '#91bfdb'; // Light blue
      case 'NDBI':
        return '#d73027'; // Red
      case 'BSI':
        return '#fdae61'; // Orange
      default:
        return '#1a9850';
    }
  };

  // Get trend description
  const getTrendDescription = () => {
    if (chartData.length < 2) return 'Données insuffisantes pour analyser la tendance';
    
    const firstValue = chartData[0].value;
    const lastValue = chartData[chartData.length - 1].value;
    const percentChange = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
    
    let description = '';
    
    switch (indexType) {
      case 'NDVI':
        if (percentChange < -10) {
          description = 'Tendance à la baisse significative de la végétation, indiquant une possible déforestation ou dégradation des terres.';
        } else if (percentChange < -5) {
          description = 'Légère tendance à la baisse de la végétation, suggérant une possible dégradation progressive.';
        } else if (percentChange > 10) {
          description = 'Tendance à la hausse significative de la végétation, indiquant une possible reforestation ou revégétalisation.';
        } else if (percentChange > 5) {
          description = 'Légère tendance à la hausse de la végétation, suggérant une amélioration progressive de la couverture végétale.';
        } else {
          description = 'Pas de changement significatif dans la couverture végétale sur la période analysée.';
        }
        break;
      
      case 'NDWI':
        if (percentChange < -10) {
          description = 'Diminution significative des surfaces d\'eau, indiquant une possible sécheresse ou assèchement des plans d\'eau.';
        } else if (percentChange < -5) {
          description = 'Légère diminution des surfaces d\'eau, suggérant une réduction progressive des ressources hydriques.';
        } else if (percentChange > 10) {
          description = 'Augmentation significative des surfaces d\'eau, indiquant une possible inondation ou expansion des plans d\'eau.';
        } else if (percentChange > 5) {
          description = 'Légère augmentation des surfaces d\'eau, suggérant une amélioration progressive des ressources hydriques.';
        } else {
          description = 'Pas de changement significatif dans les surfaces d\'eau sur la période analysée.';
        }
        break;
      
      case 'NDMI':
        if (percentChange < -10) {
          description = 'Diminution significative de l\'humidité de la végétation, indiquant un possible stress hydrique ou sécheresse.';
        } else if (percentChange < -5) {
          description = 'Légère diminution de l\'humidité de la végétation, suggérant un début de stress hydrique.';
        } else if (percentChange > 10) {
          description = 'Augmentation significative de l\'humidité de la végétation, indiquant une amélioration des conditions hydriques.';
        } else if (percentChange > 5) {
          description = 'Légère augmentation de l\'humidité de la végétation, suggérant une amélioration progressive des conditions hydriques.';
        } else {
          description = 'Pas de changement significatif dans l\'humidité de la végétation sur la période analysée.';
        }
        break;
      
      case 'NDBI':
        if (percentChange > 10) {
          description = 'Augmentation significative des zones bâties, indiquant une urbanisation rapide ou un développement d\'infrastructures.';
        } else if (percentChange > 5) {
          description = 'Légère augmentation des zones bâties, suggérant une urbanisation progressive.';
        } else if (percentChange < -10) {
          description = 'Diminution significative des zones bâties, indiquant une possible démolition ou renaturalisation.';
        } else if (percentChange < -5) {
          description = 'Légère diminution des zones bâties, suggérant une réduction progressive des infrastructures.';
        } else {
          description = 'Pas de changement significatif dans les zones bâties sur la période analysée.';
        }
        break;
      
      case 'BSI':
        if (percentChange > 10) {
          description = 'Augmentation significative des sols nus, indiquant une possible déforestation, érosion ou désertification.';
        } else if (percentChange > 5) {
          description = 'Légère augmentation des sols nus, suggérant une dégradation progressive des terres.';
        } else if (percentChange < -10) {
          description = 'Diminution significative des sols nus, indiquant une possible revégétalisation ou restauration des terres.';
        } else if (percentChange < -5) {
          description = 'Légère diminution des sols nus, suggérant une amélioration progressive de la couverture des sols.';
        } else {
          description = 'Pas de changement significatif dans les sols nus sur la période analysée.';
        }
        break;
      
      default:
        description = 'Analyse de tendance non disponible pour cet indice.';
    }
    
    return `${description} Changement: ${percentChange.toFixed(2)}% sur ${timeRange} an(s).`;
  };

  if (loading) return <div className="text-center my-3"><Spinner animation="border" size="sm" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5>Tendance de l'indice {indexType}</h5>
          <div className="d-flex">
            <Form.Select 
              size="sm"
              className="me-2"
              style={{ width: '120px' }}
              value={indexType}
              onChange={(e) => setIndexType(e.target.value)}
            >
              <option value="NDVI">NDVI</option>
              <option value="NDWI">NDWI</option>
              <option value="NDMI">NDMI</option>
              <option value="NDBI">NDBI</option>
              <option value="BSI">BSI</option>
            </Form.Select>
            <Form.Select 
              size="sm"
              style={{ width: '100px' }}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1">1 an</option>
              <option value="2">2 ans</option>
              <option value="3">3 ans</option>
              <option value="5">5 ans</option>
              <option value="10">10 ans</option>
            </Form.Select>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {chartData.length > 0 ? (
          <>
            <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
              {/* SVG Chart */}
              <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                {/* Chart grid lines */}
                <line x1="50" y1="250" x2="950" y2="250" stroke="#ddd" strokeWidth="1" />
                <line x1="50" y1="200" x2="950" y2="200" stroke="#ddd" strokeWidth="1" />
                <line x1="50" y1="150" x2="950" y2="150" stroke="#ddd" strokeWidth="1" />
                <line x1="50" y1="100" x2="950" y2="100" stroke="#ddd" strokeWidth="1" />
                <line x1="50" y1="50" x2="950" y2="50" stroke="#ddd" strokeWidth="1" />
                
                {/* Y-axis */}
                <line x1="50" y1="50" x2="50" y2="250" stroke="#333" strokeWidth="1" />
                
                {/* X-axis */}
                <line x1="50" y1="250" x2="950" y2="250" stroke="#333" strokeWidth="1" />
                
                {/* Plot the line */}
                <polyline
                  points={
                    chartData.map((point, index) => {
                      const x = 50 + (900 / (chartData.length - 1 || 1)) * index;
                      // Scale value between -1 and 1 to fit in the chart (250 = bottom, 50 = top)
                      const y = 250 - ((point.value + 1) / 2) * 200;
                      return `${x},${y}`;
                    }).join(' ')
                  }
                  fill="none"
                  stroke={getIndexColor()}
                  strokeWidth="2"
                />
                
                {/* Plot points */}
                {chartData.map((point, index) => {
                  const x = 50 + (900 / (chartData.length - 1 || 1)) * index;
                  const y = 250 - ((point.value + 1) / 2) * 200;
                  return (
                    <g key={index}>
                      <circle cx={x} cy={y} r="4" fill={getIndexColor()} />
                      <text x={x} y="270" textAnchor="middle" fontSize="10">{point.date}</text>
                      <text x={x} y={y - 10} textAnchor="middle" fontSize="10">{point.value.toFixed(2)}</text>
                    </g>
                  );
                })}
                
                {/* Y-axis labels */}
                <text x="45" y="250" textAnchor="end" fontSize="10">-1.0</text>
                <text x="45" y="200" textAnchor="end" fontSize="10">-0.5</text>
                <text x="45" y="150" textAnchor="end" fontSize="10">0.0</text>
                <text x="45" y="100" textAnchor="end" fontSize="10">0.5</text>
                <text x="45" y="50" textAnchor="end" fontSize="10">1.0</text>
              </svg>
            </div>
            
            <div className="mt-3">
              <h6>Analyse de la tendance</h6>
              <p className="text-muted">{getTrendDescription()}</p>
            </div>
          </>
        ) : (
          <Alert variant="info">Aucune donnée disponible pour cette période</Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default IndexTrendChart;