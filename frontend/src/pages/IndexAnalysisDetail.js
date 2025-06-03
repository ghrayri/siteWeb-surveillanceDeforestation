import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import IndexAnalysisVisualizer from "../components/IndexAnalysisVisualizer";

const IndexAnalysisDetail = () => {
  const { id } = useParams();
  const [indexAnalysis, setIndexAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/indexanalysis/${id}/`)
      .then(res => {
        setIndexAnalysis(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Échec du chargement de l'analyse d'indice.");
        setLoading(false);
      });
  }, [id]);

  return (
    <div>
      <h2>Détail IndexAnalysis</h2>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {indexAnalysis && <IndexAnalysisVisualizer indexAnalysis={indexAnalysis} />}
    </div>
  );
}

export default IndexAnalysisDetail;