import React, { useEffect, useState } from "react";
import { Button, Form, Spinner, Alert, Table } from "react-bootstrap";
import axios from "axios";

const RealTimeSatelliteData = () => {
  const [satellites, setSatellites] = useState([]);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [regionId, setRegionId] = useState("");
  const [loadingSatellites, setLoadingSatellites] = useState(true);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingProcess, setLoadingProcess] = useState(false);
  const [error, setError] = useState("");
  const [realTimeData, setRealTimeData] = useState(null);

  useEffect(() => {
    setLoadingSatellites(true);
    axios
      .get("/api/satellites/")
      .then((res) => {
        setSatellites(res.data);
        setLoadingSatellites(false);
      })
      .catch(() => {
        setError("Failed to load satellites.");
        setLoadingSatellites(false);
      });
  }, []);

  const handleFetchImages = () => {
    setLoadingFetch(true);
    setError("");
    axios
      .post("/api/satellites/fetch-images/", { region_id: regionId })
      .then((res) => {
        setLoadingFetch(false);
        alert("Fetch satellite images task started.");
      })
      .catch(() => {
        setError("Failed to start fetch images task.");
        setLoadingFetch(false);
      });
  };

  const handleProcessImages = () => {
    setLoadingProcess(true);
    setError("");
    axios
      .post("/api/satellites/process-images/", { index_type: "NDVI" })
      .then((res) => {
        setLoadingProcess(false);
        alert("Process satellite images task started.");
      })
      .catch(() => {
        setError("Failed to start process images task.");
        setLoadingProcess(false);
      });
  };

  const handleLoadRealTimeData = () => {
    setError("");
    axios
      .get("/api/realtime-data/indices/", { params: { region_id: regionId } })
      .then((res) => {
        setRealTimeData(res.data.data);
      })
      .catch(() => {
        setError("Failed to load real-time index data.");
        setRealTimeData(null);
      });
  };

  return (
    <div>
      <h2>Real-Time Satellite Index Data</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group className="mb-3" controlId="regionId">
        <Form.Label>Region ID (optional)</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter region ID"
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
        />
      </Form.Group>

      <div className="mb-3">
        <Button
          variant="primary"
          onClick={handleFetchImages}
          disabled={loadingFetch}
        >
          {loadingFetch ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Fetch Satellite Images"
          )}
        </Button>{" "}
        <Button
          variant="secondary"
          onClick={handleProcessImages}
          disabled={loadingProcess}
        >
          {loadingProcess ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Process Satellite Images (NDVI)"
          )}
        </Button>{" "}
        <Button variant="success" onClick={handleLoadRealTimeData}>
          Load Real-Time Index Data
        </Button>
      </div>

      {loadingSatellites ? (
        <Spinner animation="border" />
      ) : (
        <div>
          <h4>Available Satellites</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {satellites.map((sat) => (
                <tr key={sat.id}>
                  <td>{sat.id}</td>
                  <td>{sat.name}</td>
                  <td>{sat.active ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {realTimeData && (
        <div>
          <h4>Real-Time Index Data</h4>
          <pre>{JSON.stringify(realTimeData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default RealTimeSatelliteData;
