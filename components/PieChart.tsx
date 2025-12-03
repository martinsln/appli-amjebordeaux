
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, textStyles } from '@/styles/commonStyles';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  strokeWidth?: number;
  showLabels?: boolean;
}

export default function PieChart({ 
  data, 
  size = 200, 
  strokeWidth = 2, 
  showLabels = true 
}: PieChartProps) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Calculate total value
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={[styles.emptyChart, { width: size, height: size }]}>
          <Text style={textStyles.caption}>Aucune donnée</Text>
        </View>
      </View>
    );
  }
  
  // Calculate angles for each segment
  let currentAngle = -90; // Start from top
  const segments = data.map(item => {
    const angle = (item.value / total) * 360;
    const segment = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      angle,
    };
    currentAngle += angle;
    return segment;
  });

  // Create SVG path for each segment
  const createPath = (startAngle: number, endAngle: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          {segments.map((segment, index) => (
            <Path
              key={index}
              d={createPath(segment.startAngle, segment.endAngle)}
              fill={segment.color}
              stroke={colors.card}
              strokeWidth={strokeWidth}
            />
          ))}
        </Svg>
      </View>
      
      {showLabels && (
        <View style={styles.legend}>
          {segments.map((segment, index) => (
            <View key={index} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { backgroundColor: segment.color }
                ]} 
              />
              <Text style={textStyles.caption}>
                {segment.label}: {segment.value.toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    marginBottom: 16,
  },
  emptyChart: {
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
});
