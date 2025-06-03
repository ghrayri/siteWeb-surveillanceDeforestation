import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import RealTimeVisualizer from "../components/RealTimeVisualizer";
import { Spinner, Alert } from "react-bootstrap";

const RealTimeDetail = () => {
  const { id } = useParams();
  const [realTimeData, setRealTimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/realtime/${id}/`)
      .then(res => {
        setRealTimeData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger la donnée temps réel.");
        setLoading(false);
      });
  }, [id]);

  return (
    <div>
      <h2>Détail de la donnée temps réel</h2>
      {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Chargement...</span></Spinner>}
      {error && <Alert variant="danger">{error}</Alert>}
      {realTimeData && <RealTimeVisualizer realTimeData={realTimeData} />}
    </div>
  );
};

export default RealTimeDetail;