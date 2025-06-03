import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const RealtimeDataList = () => {
  const [realTimeData, setRealTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios.get("/api/realtime/")
      .then(res => {
        setRealTimeData(res.data.results || res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de récupérer la liste des données temps réel.");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>Liste des données temps réel</h2>
      {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Chargement...</span></Spinner>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <Card className="shadow-sm">
          <Card.Body>
            <ListGroup variant="flush">
              {realTimeData.length === 0 && <ListGroup.Item>Aucune donnée temps réel disponible.</ListGroup.Item>}
              {realTimeData.map(item => (
                <ListGroup.Item key={item.id}>
                  <Link to={`/realtime/${item.id}`}>{item.name || `RealTime #${item.id}`}</Link>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default RealtimeDataList;