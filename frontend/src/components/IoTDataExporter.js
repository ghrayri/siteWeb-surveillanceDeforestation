import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import axios from 'axios';

export default function IoTDataExporter({ data }) {
  const handleExport = async (format) => {
    try {
      // S'assurer que data est toujours un tableau pour l'export
      const exportData = Array.isArray(data) ? data : [data];
      const response = await axios.post('/api/iot-data/export/', {
        data: exportData,
        format
      }, {
        responseType: 'blob',
        withCredentials: true
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `iot_data.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
      if (error.response && error.response.status === 401) {
        alert('Vous n\'êtes pas autorisé à exporter les données. Veuillez vous connecter.');
      } else {
        alert('Erreur lors de l\'export des données. Veuillez réessayer.');
      }
    }
  };

  return (
    <Dropdown className="mb-3">
      <Dropdown.Toggle variant="primary" id="dropdown-export">
        Exporter les données
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleExport('json')}>JSON</Dropdown.Item>
        <Dropdown.Item onClick={() => handleExport('geojson')}>GeoJSON</Dropdown.Item>
        <Dropdown.Item onClick={() => handleExport('csv')}>CSV</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}