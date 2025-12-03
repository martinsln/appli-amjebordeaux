
import { colors, textStyles } from '@/styles/commonStyles';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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
  showLabels = true,
}: PieChartProps) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
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
  const segments = useMemo(() => {
    return data.map(item => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, total]);

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
      <TouchableWithoutFeedback onPress={() => setActiveLabel(null)}>
        <View style={styles.chartContainer}>
          <Svg width={size} height={size}>
            {segments.map((segment, index) => (
              <Path
                key={index}
                d={createPath(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                stroke={colors.card}
                strokeWidth={strokeWidth}
                onPress={() =>
                  setActiveLabel((prev) => (prev === segment.label ? null : segment.label))
                }
                onPressIn={() =>
                  setActiveLabel((prev) => (prev === segment.label ? null : segment.label))
                }
                // @ts-expect-error web hover support
                onMouseEnter={() => setActiveLabel(segment.label)}
                onMouseLeave={() => setActiveLabel(null)}
                opacity={activeLabel === null || activeLabel === segment.label ? 1 : 0.5}
              />
            ))}
          </Svg>
          {activeLabel && (
            <View style={styles.centerLabel}>
              <Text style={[textStyles.caption, styles.centerLabelText]}>Étude</Text>
              <Text style={[textStyles.h3, styles.centerLabelValue]} numberOfLines={2}>
                {activeLabel}
              </Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

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
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChart: {
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  centerLabelText: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  centerLabelValue: {
    textAlign: 'center',
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
