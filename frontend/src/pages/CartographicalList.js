import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner, Alert } from "react-bootstrap";

const CartographicalList = () => {
  const [cartos, setCartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    axios.get("/api/cartographicals/")
      .then(res => {
        setCartos(Array.isArray(res.data) ? res.data : (res.data.results || []));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch cartographical data.");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>Cartographical Data</h2>
      {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && cartos.length === 0 && <Alert variant="info">No cartographical data available.</Alert>}
      <div>
        {cartos.map(carto => (
          <Card className="mb-3" key={carto.id}>
            <Card.Body>
              <Card.Title>{carto.name || carto.id}</Card.Title>
              <Card.Text>
                <strong>Description:</strong> {carto.description || "N/A"}<br/>
                <strong>Date:</strong> {carto.acquisition_date || "N/A"}<br/>
                <strong>Region:</strong> {carto.region || "N/A"}
              </Card.Text>
              {carto.geometry && (
                <pre style={{background:'#f8f9fa', padding:'8px', borderRadius:'4px', fontSize:'0.9em'}}>{JSON.stringify(carto.geometry, null, 2)}</pre>
              )}
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CartographicalList;