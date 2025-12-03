import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '@/styles/commonStyles';

type ChartDatum = { x: string | number; y: number };

type BarChartProps = {
  data: ChartDatum[];
  width?: number;
  height?: number;
};

export default function BarChart({ data, width = 320, height = 200 }: BarChartProps) {
  if (!data || data.length === 0) return null;

  const padding = 24;
  const yAxisWidth = 40;
  const chartWidth = width - padding * 2 - yAxisWidth;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...data.map((d) => d.y), 1);
  const barWidth = chartWidth / data.length - 12;
  const yTicks = [0, maxValue * 0.33, maxValue * 0.66, maxValue];

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

        {data.map((d, idx) => {
          const x = padding + yAxisWidth + idx * (barWidth + 12);
          const barHeight = (d.y / maxValue) * chartHeight;
          const y = height - padding - barHeight;
          return (
            <React.Fragment key={idx}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={colors.primary}
                rx={6}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - padding + 14}
                fontSize="10"
                fill={colors.textSecondary}
                textAnchor="middle"
              >
                {String(d.x)}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={{ marginTop: 8 }}>
        <Text style={{ color: colors.textSecondary }}> </Text>
      </View>
    </View>
  );
}
