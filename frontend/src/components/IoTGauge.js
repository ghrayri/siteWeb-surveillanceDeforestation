import React from 'react';
import { Card } from 'react-bootstrap';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function IoTGauge({ value, title = '', unit = '', color = '#30BF78', min = 0, max = 100 }) {
  // Sécurisation des valeurs
  const safeValue = typeof value === 'number' && isFinite(value) ? value : 0;
  const safeTitle = typeof title === 'string' ? title : '';
  const safeColor = typeof color === 'string' ? color : '#30BF78';
  const safeUnit = typeof unit === 'string' ? unit : '';

  // Calculate percentage based on min/max range
  const range = max - min;
  const percent = range !== 0 ? ((safeValue - min) / range) * 100 : 0;

  // Préparation des données pour Recharts
  const chartData = [
    {
      name: safeTitle,
      value: percent < 0 ? 0 : percent > 100 ? 100 : percent,
      fill: safeColor,
    },
  ];

  return (
    <Card className="mb-3">
      <Card.Header>{safeTitle}</Card.Header>
      <Card.Body style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={18}
            data={chartData}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              tick={false}
            />
            <RadialBar
              minAngle={15}
              background
              clockWise
              dataKey="value"
              cornerRadius={10}
              fill={safeColor}
            />
            {/* Affichage de la valeur au centre */}
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fill="#333"
              fontWeight="bold"
            >
              {`${safeValue.toFixed(2)} ${safeUnit}`}
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
}