
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, textStyles, commonStyles } from '@/styles/commonStyles';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  color = colors.primary,
  icon 
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (title.toLowerCase().includes('ca') || title.toLowerCase().includes('chiffre')) {
        return val.toLocaleString('fr-FR', { 
          style: 'currency', 
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
      return val.toLocaleString('fr-FR');
    }
    return val;
  };

  return (
    <View style={[commonStyles.card, styles.container]}>
      <View style={styles.header}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={[textStyles.caption, styles.title]}>{title}</Text>
      </View>
      
      <Text style={[textStyles.h2, styles.value, { color }]}>
        {formatValue(value)}
      </Text>
      
      {subtitle && (
        <Text style={[textStyles.caption, styles.subtitle]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    textTransform: 'uppercase',
    fontWeight: '600',
    flex: 1,
  },
  value: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
});
