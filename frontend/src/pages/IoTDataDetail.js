import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import IoTGauge from "../components/IoTGauge";
import IoTDataExporter from "../components/IoTDataExporter";

const IoTDataDetail = () => {
  const { id } = useParams();
  const [iotData, setIoTData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/iot-data/latest/')
      .then((res) => {
        setIoTData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Échec du chargement des données IoT.");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>Détail IoTData</h2>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {iotData && (
        <div className="row">
          <div className="col-md-6">
            <IoTGauge 
              title="Température moyenne" 
              value={iotData.amg_avg_temp ?? 0} 
              min={0} 
              max={50} 
              unit="°C" 
              color="#FF5E5E"
            />
            <IoTGauge 
              title="Température max" 
              value={iotData.amg_max_temp ?? 0} 
              min={0} 
              max={50} 
              unit="°C" 
              color="#FF0000"
            />
            <IoTGauge 
              title="Température min" 
              value={iotData.amg_min_temp ?? 0} 
              min={0} 
              max={50} 
              unit="°C" 
              color="#00AAFF"
            />
          </div>
          <div className="col-md-6">
            <IoTGauge 
              title="Température BME" 
              value={iotData.bme_temp ?? 0} 
              min={-20} 
              max={60} 
              unit="°C" 
              color="#FFA500"
            />
            <IoTGauge 
              title="Humidité" 
              value={iotData.bme_humidity ?? 0} 
              min={0} 
              max={100} 
              unit="%" 
              color="#00AAFF"
            />
            <IoTGauge 
              title="Pression" 
              value={iotData.bme_pressure ?? 0} 
              min={900} 
              max={1100} 
              unit="hPa" 
              color="#8884d8"
            />
          </div>
          <div className="col-12 mt-3">
            <IoTDataExporter data={iotData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default IoTDataDetail;
