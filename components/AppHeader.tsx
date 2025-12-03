import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import { colors, textStyles } from '@/styles/commonStyles';

interface AppHeaderProps {
  onLogoPress?: () => void;
  actionLabel?: string;
  onActionPress?: () => void;
  actionActive?: boolean;
}

const logoSource = require('../assets/images/amje-logo.png');

export default function AppHeader({
  onLogoPress,
  actionLabel = 'Créer une étude',
  onActionPress,
  actionActive = false,
}: AppHeaderProps) {
  const isActionDisabled = !onActionPress && !actionActive;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onLogoPress}
        style={styles.logoButton}
        activeOpacity={0.8}
      >
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onActionPress}
        activeOpacity={0.8}
        disabled={isActionDisabled}
        style={[
          styles.actionButton,
          actionActive && styles.actionButtonActive,
          isActionDisabled && styles.actionButtonDisabled,
        ]}
      >
        <Text
          style={[
            textStyles.caption,
            styles.actionText,
            actionActive && styles.actionTextActive,
          ]}
        >
          {actionLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  logoButton: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  logo: {
    width: 140,
    height: 36,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionButtonActive: {
    backgroundColor: colors.secondary,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionText: {
    color: colors.card,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionTextActive: {
    color: colors.card,
  },
});
