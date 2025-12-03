import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '@/styles/commonStyles';

type ChartDatum = { x: string | number; y: number };

type LineChartProps = {
  data: ChartDatum[];
  width?: number;
  height?: number;
};

export default function LineChart({ data, width = 320, height = 200 }: LineChartProps) {
  if (!data || data.length === 0) return null;

  const padding = 24;
  const yAxisWidth = 40;
  const chartWidth = width - padding * 2 - yAxisWidth;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...data.map((d) => d.y), 1);
  const yTicks = [0, maxValue * 0.33, maxValue * 0.66, maxValue];

  const points = data.map((d, idx) => {
    const x = padding + yAxisWidth + (chartWidth / Math.max(data.length - 1, 1)) * idx;
    const y = height - padding - (d.y / maxValue) * chartHeight;
    return { x, y, label: String(d.x) };
  });

  const path = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <View style={{ alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, paddingVertical: 8 }}>
      <Svg width={width} height={height}>
        {yTicks.map((t, idx) => {
          const y = padding + chartHeight - (t / maxValue) * chartHeight;
          return (
            <React.Fragment key={idx}>
              <Line
                x1={padding + yAxisWidth}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke={colors.border}
                strokeDasharray="4 4"
              />
              <SvgText
                x={padding + yAxisWidth - 6}
                y={y + 4}
                fontSize="10"
                fill={colors.textSecondary}
                textAnchor="end"
              >
                {Math.round(t).toLocaleString('fr-FR')}
              </SvgText>
            </React.Fragment>
          );
        })}

        <Path d={path} stroke={colors.primary} strokeWidth={3} fill="none" />
        {points.map((p, idx) => (
          <React.Fragment key={idx}>
            <Circle cx={p.x} cy={p.y} r={5} fill={colors.secondary} />
            <SvgText
              x={p.x}
              y={height - padding + 14}
              fontSize="10"
              fill={colors.textSecondary}
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}
