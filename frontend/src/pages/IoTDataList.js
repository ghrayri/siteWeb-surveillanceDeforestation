import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert, Row, Col, ListGroup, Form } from "react-bootstrap";
import axios from "axios";
import IoTGauge from "../components/IoTGauge";
import IoTDataExporter from "../components/IoTDataExporter";

const IoTDataList = () => {
  const [iotData, setIotData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/iot-data/")
      .then((res) => {
        // Ensure data is always treated as an array
        const data = Array.isArray(res.data.results) ? res.data.results : [res.data.results];
        setIotData(data);
        // Extraire les dates et heures uniques
        const uniqueDates = [...new Set(data.map(item => new Date(item.timestamp).toISOString().split('T')[0]))];
        const uniqueTimes = [...new Set(data.map(item => {
          const d = new Date(item.timestamp);
          return `${d.getHours()}:${d.getMinutes()}`;
        }))];
        setAvailableDates(uniqueDates);
        setAvailableTimes(uniqueTimes);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch IoT data list.");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>IoT Data Dashboard</h2>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Sélectionner une date</Form.Label>
            <Form.Select 
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                const filtered = iotData.filter(item => 
                  new Date(item.timestamp).toISOString().split('T')[0] === e.target.value
                );
                setFilteredData(filtered.length > 0 ? filtered : iotData);
              }}
            >
              <option value="">Toutes les dates</option>
              {availableDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Sélectionner une heure</Form.Label>
            <Form.Select 
              value={selectedTime}
              onChange={(e) => {
                setSelectedTime(e.target.value);
                const filtered = iotData.filter(item => {
                  const d = new Date(item.timestamp);
                  return `${d.getHours()}:${d.getMinutes()}` === e.target.value;
                });
                setFilteredData(filtered.length > 0 ? filtered : iotData);
              }}
            >
              <option value="">Toutes les heures</option>
              {availableTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      {loading && (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Card className="shadow-sm">
          <Card.Body>
            <IoTDataExporter data={filteredData.length > 0 ? filteredData : iotData} />
            {/* Dashboard synthétique façon Grafana */}
            <div>
              {(filteredData.length > 0 ? filteredData : iotData).length > 0 ? (
                <Row>
                  <Col md={4} sm={6} xs={12} className="mb-3">
                    <IoTGauge title="Température moyenne" value={(filteredData.length > 0 ? filteredData : iotData)[0].amg_avg_temp ?? 0} min={0} max={50} unit="°C" color="#FF5E5E" />
                  </Col>
                  <Col md={4} sm={6} xs={12} className="mb-3">
                    <IoTGauge title="Température max" value={(filteredData.length > 0 ? filteredData : iotData)[0].amg_max_temp ?? 0} min={0} max={50} unit="°C" color="#FF0000" />
                  </Col>
                  <Col md={4} sm={6} xs={12} className="mb-3">
                    <IoTGauge title="Température min" value={(filteredData.length > 0 ? filteredData : iotData)[0].amg_min_temp ?? 0} min={0} max={50} unit="°C" color="#00AAFF" />
                  </Col>
                  <Col md={4} sm={6} xs={12} className="mb-3">
                    <IoTGauge title="Température BME" value={(filteredData.length > 0 ? filteredData : iotData)[0].bme_temp ?? 0} min={-20} max={60} unit="°C" color="#FFA500" />
                  </Col>
                  
                  <Col md={4} sm={6} xs={12} className="mb-3">
                    <IoTGauge title="Pression" value={(filteredData.length > 0 ? filteredData : iotData)[0].bme_pressure ?? 0} min={900} max={1100} unit="hPa" color="#8884d8" />
                  </Col>
                  <Col md={4} sm={6} xs={12} className="mb-3">
                    <IoTGauge title="Humidité" value={(filteredData.length > 0 ? filteredData : iotData)[0].bme_humidity ?? 0} min={0} max={100} unit="%" color="#00FFAA" />
                  </Col>
                  <Col md={4} sm={6} xs={12} className="mb-3">
                    <IoTGauge title="Gaz BME" value={(filteredData.length > 0 ? filteredData : iotData)[0].bme_gas ?? 0} min={0} max={500000} unit="Ohm" color="#FFA500" />
                  </Col>
                  
                  
                  <Col md={4} sm={6} xs={12} className="mb-3">
                    <IoTGauge title="Humidité du sol" value={(filteredData.length > 0 ? filteredData : iotData)[0].soil_moisture ?? 0} min={0} max={100} unit="%" color="#228B22" />
                  </Col>
                  <Col md={4} sm={6} xs={12} className="mb-3">
                    <IoTGauge title="Luminosité" value={(filteredData.length > 0 ? filteredData : iotData)[0].luminosity ?? 0} min={0} max={100000} unit="lux" color="#FFD700" />
                  </Col>
                </Row>
              ) : (
                <ListGroup.Item>Aucune donnée IoT disponible.</ListGroup.Item>
              )}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default IoTDataList;
