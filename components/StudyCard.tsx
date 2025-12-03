
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, textStyles, commonStyles, statusColors, statusIcons, statusLabels } from '@/styles/commonStyles';
import { Study } from '@/types/study';
import { IconSymbol } from '@/components/IconSymbol';

interface StudyCardProps {
  study: Study;
  onPress?: () => void;
  onDelete?: () => void;
  onStatusPress?: () => void;
}

export default function StudyCard({ study, onPress, onDelete, onStatusPress }: StudyCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/study/${study.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const badgeColor = statusColors[study.status] ?? colors.accent;
  const badgeIcon = statusIcons[study.status] ?? '⏳';

  return (
    <TouchableOpacity 
      style={[commonStyles.card, styles.container]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[commonStyles.row, commonStyles.spaceBetween, styles.header]}>
        <View style={styles.titleContainer}>
          <Text style={[textStyles.h3, styles.title]} numberOfLines={1}>
            {study.name}
          </Text>
          <Text style={[textStyles.bodySecondary, styles.client]} numberOfLines={1}>
            {study.client}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: badgeColor }]}
            onPress={onStatusPress}
            activeOpacity={onStatusPress ? 0.7 : 1}
            disabled={!onStatusPress}
          >
            <Text style={styles.statusIcon}>
              {badgeIcon}
            </Text>
            <Text style={[textStyles.caption, styles.statusText]}>
              {statusLabels[study.status]}
            </Text>
          </TouchableOpacity>
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <IconSymbol name="trash" color={colors.error} size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[commonStyles.row, commonStyles.spaceBetween, styles.footer]}>
        <View>
          <Text style={[textStyles.caption, styles.label]}>Montant</Text>
          <Text style={[textStyles.body, styles.amount]}>
            {formatAmount(study.amount)}
          </Text>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={[textStyles.caption, styles.label]}>Ouverture</Text>
          <Text style={[textStyles.caption, styles.date]}>
            {formatDate(study.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    marginBottom: 4,
  },
  client: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 12,
  },
  deleteButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'flex-end',
  },
  label: {
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  amount: {
    fontWeight: '600',
    color: colors.primary,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontWeight: '500',
  },
});
