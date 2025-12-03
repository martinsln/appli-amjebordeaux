import React from 'react';
import { View, Text } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

type PieDatum = { x: string | number; y: number };

type PieChartProps = {
  data: PieDatum[];
  size?: number;
};

const DEFAULT_COLORS = ['#4F8EC9', '#355C9C', '#E9C46A', '#6ABF69', '#888888', '#BDBDBD'];

export default function PieChart({ data, size = 240 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.y, 0);
  if (total === 0) {
    return null;
  }

  const radius = size / 2;
  let currentAngle = -90;

  const segments = data.map((item, index) => {
    const angle = (item.y / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;
    return { ...item, startAngle, endAngle, color: DEFAULT_COLORS[index % DEFAULT_COLORS.length] };
  });

  const createPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(radius, radius, radius, endAngle);
    const end = polarToCartesian(radius, radius, radius, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} L ${radius} ${radius} Z`;
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G>
          {segments.map((seg, idx) => (
            <Path key={idx} d={createPath(seg.startAngle, seg.endAngle)} fill={seg.color} />
          ))}
        </G>
      </Svg>
      <View style={{ marginTop: 12, width: size }}>
        {segments.map((seg, idx) => (
          <View
            key={idx}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}
          >
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: seg.color }} />
            <Text>{`${seg.x}: ${seg.y}`}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type Point = { x: number; y: number };
const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number): Point => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
};
