import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { Form, Button, Row, Col } from "react-bootstrap";

const RealTimeList = () => {
  const [realTimeData, setRealTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [regionId, setRegionId] = useState("");
  const [days, setDays] = useState(1);
  const [cloudCoverMax, setCloudCoverMax] = useState(100);

  useEffect(() => {
    setLoading(true);
    // Trigger fetch satellite images task on load
    axios
      .post("/api/satellite-tasks/fetch-images/")
      .then(() => {
        // After triggering fetch, load the real-time data list
        axios
          .get("/api/realtime/")
          .then((res) => {
            setRealTimeData(res.data.results);
            setLoading(false);
          })
          .catch(() => {
            setError("Failed to fetch real-time data list.");
            setLoading(false);
          });
      })
      .catch(() => {
        setError("Failed to trigger fetch satellite images task.");
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    axios
      .post("/api/satellite-tasks/fetch-images/", {
        region_id: regionId,
        days: days,
        cloud_cover_max: cloudCoverMax,
      })
      .then(() => {
        axios
          .get("/api/realtime/")
          .then((res) => {
            setRealTimeData(res.data.results);
            setLoading(false);
          })
          .catch(() => {
            setError("Failed to fetch real-time data list.");
            setLoading(false);
          });
      })
      .catch(() => {
        setError("Failed to trigger fetch satellite images task.");
        setLoading(false);
      });
  };

  return (
    <div>
      <h2>Real-Time Data List</h2>
      {loading && (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Card className="shadow-sm">
          <Card.Body>
            <ListGroup variant="flush">
              {realTimeData.length === 0 && (
                <ListGroup.Item>No real-time data available.</ListGroup.Item>
              )}
              {realTimeData.map((item) => (
                <ListGroup.Item key={item.id}>
                  <Link to={`/realtime/${item.id}`}>
                    {item.name || `RealTimeData #${item.id}`}
                  </Link>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      )}
      <Form onSubmit={handleSubmit} className="mb-4 mt-4">
        <Row>
          <Col md={4}>
            <Form.Group controlId="regionId">
              <Form.Label>Region ID</Form.Label>
              <Form.Control
                type="text"
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="days">
              <Form.Label>Days</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="cloudCoverMax">
              <Form.Label>Cloud Cover Max (%)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                max={100}
                value={cloudCoverMax}
                onChange={(e) => setCloudCoverMax(Number(e.target.value))}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" className="mt-3" disabled={loading}>
          Lancer la tâche
        </Button>
      </Form>
    </div>
  );
};

export default RealTimeList;
