import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import RealTimeVisualizer from "../components/RealTimeVisualizer";

const RealTimeDetail = () => {
  const { id } = useParams();
  const [RealTime, setRealTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/RealTime/${id}/`)
      .then(res => {
        setRealTime(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Échec du chargement des données en temps réel.");
        setLoading(false);
      });
  }, [id]);

  return (
    <div>
      <h2>Détail RealTime</h2>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {RealTime && <RealTimeVisualizer RealTime={RealTime} />}
    </div>
  );
};

export default RealTimeDetail;