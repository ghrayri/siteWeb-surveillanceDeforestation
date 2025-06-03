import React, { useState, useEffect } from "react";
import axios from "axios";
import DeforestationAnalysis from "../components/DeforestationAnalysis";
import SatelliteImageViewer from "../components/SatelliteImageViewer";
import IndexTrendChart from "../components/IndexTrendChart";

const DATA_TYPES = [
  { label: "Earth Observation (EO) Data", value: "eo" },
  { label: "IoT Data", value: "iot" },
  { label: "RealTime Data", value: "realtime" }
];

const DataDashboard = () => {
  const [selectedType, setSelectedType] = useState("eo");
  const [eoData, setEoData] = useState(null);
  const [iotData, setIotData] = useState(null);
  const [RealTime, setRealTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch EO, IoT, or RealTime data based on selection
  useEffect(() => {
    setLoading(true);
    setError("");
    let endpoint = "";
    if (selectedType === "eo") {
      endpoint = "/api/datalayers/";
    } else if (selectedType === "iot") {
      endpoint = "/api/iot-data/";
    } else {
      endpoint = "/api/real-time/";
    }
    axios
      .get(endpoint)
      .then((res) => {
        if (selectedType === "eo") setEoData(res.data);
        else if (selectedType === "iot") setIotData(res.data);
        else setRealTime(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch data.");
        setLoading(false);
      });
  }, [selectedType]);

  // Real-time updates using polling (simulate RIS/Celery push)
  useEffect(() => {
    const interval = setInterval(() => {
      let endpoint =
        selectedType === "eo"
          ? "/api/datalayers/"
          : selectedType === "iot"
          ? "/api/iot-data/"
          : "/api/real-time/";
      axios.get(endpoint).then((res) => {
        if (selectedType === "eo") setEoData(res.data);
        else if (selectedType === "iot") setIotData(res.data);
        else setRealTime(res.data);
      });
    }, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [selectedType]);

  return (
    <div className="dashboard-container">
      <h2>Deforestation Dashboard - Tunisia</h2>
      <div className="data-type-selector">
        {DATA_TYPES.map((type) => (
          <button
            key={type.value}
            className={selectedType === type.value ? "selected" : ""}
            onClick={() => setSelectedType(type.value)}
          >
            {type.label}
          </button>
        ))}
      </div>
      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {selectedType === "eo" && eoData && (
        <>
          <SatelliteImageViewer data={eoData} />
          <IndexTrendChart data={eoData} />
          <DeforestationAnalysis data={eoData} />
        </>
      )}
      {selectedType === "iot" && iotData && (
        <>
          {/* Replace below with actual IoT data visualization components */}
          <h3>IoT Sensor Data</h3>
          <pre>{JSON.stringify(iotData, null, 2)}</pre>
        </>
      )}
      {selectedType === "realtime" && RealTime && (
        <>
          <h3>RealTime Data</h3>
          <pre>{JSON.stringify(RealTime, null, 2)}</pre>
        </>
      )}
    </div>
  );
};

export default DataDashboard;