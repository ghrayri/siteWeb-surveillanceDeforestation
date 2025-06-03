import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { ButtonGroup, Button, Form } from 'react-bootstrap';

const COLORS = {
  NDVI: "#1a9850",
  NDWI: "#4575b4",
  NDMI: "#91bfdb",
  NDBI: "#d73027",
  BSI: "#fdae61",
  YEAR_COLORS: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a"]
};

const IndexLineChart = ({ data, indexType }) => {
  const [hovered, setHovered] = useState(null);
  if (!data || data.length === 0) return <Alert variant="info">Aucune donnée pour {indexType}</Alert>;
  // Process all years data
  const sorted = [...data].sort((a, b) => new Date(a.acquisition_date) - new Date(b.acquisition_date));
  // Get unique years and their first index for label spacing
  const yearPositions = {};
  sorted.forEach((point, i) => {
    const year = new Date(point.acquisition_date).getFullYear();
    if (!(year in yearPositions)) {
      yearPositions[year] = i;
    }
  });
  return (
    <div className="chart-container" style={{ height: "300px", position: "relative", marginBottom: 24 }}>
      <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
        {/* Axes */}
        <line x1="50" y1="250" x2="950" y2="250" stroke="#333" strokeWidth="1" />
        <line x1="50" y1="50" x2="50" y2="250" stroke="#333" strokeWidth="1" />
        {/* Courbe */}
        <polyline
          points={
            sorted.map((point, i) => {
              const x = 50 + (900 / (sorted.length - 1 || 1)) * i;
              const y = 250 - ((point.mean_value + 1) / 2) * 200;
              return `${x},${y}`;
            }).join(" ")
          }
          fill="none"
          stroke={COLORS[indexType] || "#1a9850"}
          strokeWidth="2"
        />
        {/* Points et tooltips */}
        {sorted.map((point, i) => {
          const x = 50 + (900 / (sorted.length - 1 || 1)) * i;
          const y = 250 - ((point.mean_value + 1) / 2) * 200;
          const year = new Date(point.acquisition_date).getFullYear();
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill={COLORS[indexType] || "#1a9850"} style={{cursor:'pointer'}}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {/* Show year label only at the first data point of each year, spaced proportionally */}
              {yearPositions[year] === i ? (
                <text x={x} y="270" textAnchor="middle" fontSize="12">{year}</text>
              ) : null}
              {hovered === i && (
                <g>
                  <rect x={x-40} y={y-45} width="80" height="30" fill="#fff" stroke="#888" rx="5"/>
                  <text x={x} y={y-30} textAnchor="middle" fontSize="12" fill="#333">{point.mean_value.toFixed(2)}</text>
                  <text x={x} y={y-15} textAnchor="middle" fontSize="10" fill="#666">{point.acquisition_date}</text>
                </g>
              )}
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
  );
};

const IndexPieChart = ({ data, indexType }) => {
  const [hovered, setHovered] = useState(null);
  if (!data || data.length === 0) return <Alert variant="info">Aucune donnée pour {indexType}</Alert>;
  // Process all years data
  const sorted = [...data].sort((a, b) => new Date(a.acquisition_date) - new Date(b.acquisition_date));
  const years = [...new Set(sorted.map(item => new Date(item.acquisition_date).getFullYear()))];
  
  // Group data by year for pie and bar charts
  const byYear = years.reduce((acc, year) => {
    acc[year] = data.filter(point => new Date(point.acquisition_date).getFullYear() === year);
    return acc;
  }, {});
  
  const filteredYears = years;
  const radius = 120;
  const centerX = 150;
  const centerY = 150;
  
  // Calculer les angles pour chaque année
  let startAngle = 0;
  const slices = years.map((year, i) => {
    const value = byYear[year].reduce((sum, point) => sum + point.mean_value, 0) / byYear[year].length;
    const angle = (value + 1) * 180; // Normaliser entre 0 et 360
    const endAngle = startAngle + angle;
    const slice = {
      year,
      startAngle,
      endAngle,
      color: COLORS.YEAR_COLORS[i % COLORS.YEAR_COLORS.length] || "#1a9850",
      value
    };
    startAngle = endAngle;
    return slice;
  });
  
  return (
    <div className="chart-container" style={{ height: "300px", position: "relative", marginBottom: 24 }}>
      <svg width="100%" height="100%" viewBox="0 0 300 300">
        {slices.map((slice, i) => {
          const startX = centerX + radius * Math.cos((slice.startAngle * Math.PI) / 180);
          const startY = centerY + radius * Math.sin((slice.startAngle * Math.PI) / 180);
          const endX = centerX + radius * Math.cos((slice.endAngle * Math.PI) / 180);
          const endY = centerY + radius * Math.sin((slice.endAngle * Math.PI) / 180);
          const largeArcFlag = slice.endAngle - slice.startAngle <= 180 ? 0 : 1;
          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{cursor:'pointer'}}>
              <path
                d={`M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z`}
                fill={slice.color}
                opacity={0.7}
              />
              {hovered === i && (
                <g>
                  <rect x={centerX-40} y={centerY-80} width="80" height="30" fill="#fff" stroke="#888" rx="5"/>
                  <text x={centerX} y={centerY-60} textAnchor="middle" fontSize="12" fill="#333">{slice.value.toFixed(2)}</text>
                  <text x={centerX} y={centerY-45} textAnchor="middle" fontSize="10" fill="#666">{slice.year}</text>
                </g>
              )}
            </g>
          );
        })}
        <circle cx={centerX} cy={centerY} r={radius * 0.3} fill="white" />
        <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline="middle" fontSize="14">
          {indexType}
        </text>
        
        {/* Légende */}
        {years.map((year, i) => (
          <g key={i} transform={`translate(200, ${20 + i * 20})`}>
            <rect width="15" height="15" fill={COLORS.YEAR_COLORS[i % COLORS.YEAR_COLORS.length] || "#1a9850"} opacity="0.7" />
            <text x="25" y="12" fontSize="12">{year}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const IndexBarChart = ({ data, indexType, selectedYear, onYearChange }) => {
  const [hovered, setHovered] = useState(null);
  if (!data || data.length === 0) return <Alert variant="info">Aucune donnée pour {indexType}</Alert>;
  // Get all unique years from data
  const allYears = Array.from(new Set(data.map(point => new Date(point.acquisition_date).getFullYear()))).sort();
  // If no year selected, default to first year
  const yearToShow = selectedYear || allYears[0];
  // Filter data for selected year only
  let filtered = data.filter(point => new Date(point.acquisition_date).getFullYear() === yearToShow);
  const sorted = [...filtered].sort((a, b) => new Date(a.acquisition_date) - new Date(b.acquisition_date));
  // Group data by month (YYYY-MM) for the selected year
  const byMonth = {};
  sorted.forEach(point => {
    const dateObj = new Date(point.acquisition_date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth(); // 0-indexed
    const key = `${year}-${(month+1).toString().padStart(2,'0')}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(point);
  });
  const months = Object.keys(byMonth).sort();
  const maxValue = Math.max(...months.map(m => byMonth[m].reduce((sum, p) => sum + p.mean_value, 0) / byMonth[m].length));
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return (
    <div className="chart-container" style={{ height: "300px", position: "relative", marginBottom: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <Form.Select size="sm" style={{ width: 120, display: 'inline-block' }} value={yearToShow} onChange={e => onYearChange(Number(e.target.value))}>
          {allYears.map(y => <option key={y} value={y}>{y}</option>)}
        </Form.Select>
      </div>
      <svg width="100%" height="100%" viewBox="0 0 600 300">
        {/* Axes */}
        <line x1="50" y1="250" x2="550" y2="250" stroke="#333" strokeWidth="1" />
        <line x1="50" y1="50" x2="50" y2="250" stroke="#333" strokeWidth="1" />
        {/* Bars */}
        {months.map((key, i) => {
          const value = byMonth[key].reduce((sum, point) => sum + point.mean_value, 0) / byMonth[key].length;
          const barHeight = ((value + 1) / (maxValue + 1)) * 180;
          const x = 50 + (i * 500) / months.length;
          const width = 400 / months.length - 4;
          const [year, month] = key.split('-');
          return (
            <g key={key}>
              <rect 
                x={x} 
                y={250 - barHeight} 
                width={width} 
                height={barHeight} 
                fill={COLORS[indexType] || "#1a9850"} 
                opacity={0.8}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{cursor:'pointer'}}
              />
              {/* Month label */}
              <text x={x + width/2} y="270" textAnchor="middle" fontSize="10">{monthLabels[parseInt(month,10)-1]}</text>
              {/* Tooltip */}
              {hovered === i && (
                <g>
                  <rect x={x-20} y={250-barHeight-40} width="60" height="30" fill="#fff" stroke="#888" rx="5"/>
                  <text x={x+10} y={250-barHeight-22} textAnchor="middle" fontSize="12" fill="#333">{value.toFixed(2)}</text>
                  <text x={x+10} y={250-barHeight-10} textAnchor="middle" fontSize="10" fill="#666">{monthLabels[parseInt(month,10)-1]} {year}</text>
                </g>
              )}
            </g>
          );
        })}
        {/* Y-axis labels */}
        <text x="45" y="250" textAnchor="end" fontSize="10">-1.0</text>
        <text x="45" y="200" textAnchor="end" fontSize="10">-0.5</text>
        <text x="45" y="150" textAnchor="end" fontSize="10">0.0</text>
        <text x="45" y="100" textAnchor="end" fontSize="10">0.5</text>
        <text x="45" y="50" textAnchor="end" fontSize="10">1.0</text>
        {/* X-axis year label */}
        <text x="300" y="295" textAnchor="middle" fontSize="12" fontWeight="bold">{yearToShow}</text>
      </svg>
    </div>
  );
};

const EODataList = () => {
  const [eoDataList, setEoDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChart, setSelectedChart] = useState("line");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedIndex, setSelectedIndex] = useState("");
  
  // Get all unique years from data
  const allYears = Array.from(new Set(eoDataList.map(point => new Date(point.acquisition_date).getFullYear()))).sort();
  
  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    let allData = [];
    let url = "/api/eo-data/";
    const fetchAllPages = async (nextUrl) => {
      try {
        const res = await axios.get(nextUrl);
        let data = res.data;
        if (Array.isArray(data)) {
          allData = allData.concat(data);
        } else if (Array.isArray(data.results)) {
          allData = allData.concat(data.results);
          if (data.next) {
            await fetchAllPages(data.next);
          }
        } else if (data && typeof data === "object") {
          allData.push(data);
        }
      } catch (err) {
        setError("Failed to fetch EO data list.");
      }
    };
    fetchAllPages(url).then(() => {
      setEoDataList(allData);
      setLoading(false);
    });
  }, []);

  // Regrouper par index_type
  const grouped = eoDataList.reduce((acc, eo) => {
    const type = (eo.index_type || "Autre").toUpperCase();
    if (!acc[type]) acc[type] = [];
    acc[type].push(eo);
    return acc;
  }, {});



return (
  <div>
    <h2>Evolution des indices EO (2020-2025)</h2>
    {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>}
    {error && <Alert variant="danger">{error}</Alert>}
    {!loading && !error && Object.keys(grouped).length === 0 && <Alert variant="info">Aucune donnée EO disponible.</Alert>}
    
    <div className="mb-3">
      <ButtonGroup>
        <Button 
          variant={selectedChart === "line" ? "primary" : "outline-primary"}
          onClick={() => setSelectedChart("line")}
        >
          Ligne
        </Button>
        <Button 
          variant={selectedChart === "pie" ? "primary" : "outline-primary"}
          onClick={() => setSelectedChart("pie")}
        >
          Camembert
        </Button>
        <Button 
          variant={selectedChart === "bar" ? "primary" : "outline-primary"}
          onClick={() => setSelectedChart("bar")}
        >
          Barres
        </Button>
      </ButtonGroup>
    </div>
    
    <div className="mb-3">
      <Form.Select 
        onChange={(e) => setSelectedIndex(e.target.value)}
        value={selectedIndex || ""}
      >
        <option value="">Tous les indices</option>
        {Object.keys(grouped).map(indexType => (
          <option key={indexType} value={indexType}>{indexType}</option>
        ))}
      </Form.Select>
    </div>
    
    {!loading && !error && Object.entries(grouped)
      .filter(([indexType]) => !selectedIndex || indexType === selectedIndex)
      .map(([indexType, data]) => (
        <Card className="mb-4 shadow-sm" key={indexType}>
          <Card.Header><b>{indexType}</b></Card.Header>
          <Card.Body>
            {selectedChart === "line" && <IndexLineChart data={data} indexType={indexType} />}
            {selectedChart === "pie" && <IndexPieChart data={data} indexType={indexType} />}
            {selectedChart === "bar" && <IndexBarChart data={data} indexType={indexType} selectedYear={selectedYear || allYears[0]} onYearChange={handleYearChange} />}
          </Card.Body>
        </Card>
      ))}
  </div>
);
};

export default EODataList;