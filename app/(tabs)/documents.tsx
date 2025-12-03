import React, { useMemo } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, textStyles } from '@/styles/commonStyles';

const DOCUMENT_NOTES = [
  {
    id: 'drive',
    title: 'Drive AMJE',
    description: 'Les dossiers partagés restent la source principale pour stocker les fichiers volumineux.',
    icon: 'folder.fill' as const,
  },
  {
    id: 'coming-soon',
    title: 'Centralisation à venir',
    description: 'Une vue unifiée des téléchargements sera ajoutée ici pour éviter les doublons.',
    icon: 'info.circle.fill' as const,
  },
];

const DRIVE_URL = 'https://drive.google.com/drive/u/1/folders/1jWhjDfTez_2YOK6HIpBujqBvEI_8_3wf?dmr=1&ec=wgc-drive-globalnav-goto';

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();

  const quickActions = useMemo(
    () => [
      { id: 'upload', label: 'Uploader un document', icon: 'arrow.up.doc.fill' as const, onPress: undefined },
      { id: 'drive', label: 'Ouvrir le Drive', icon: 'folder' as const, onPress: () => Linking.openURL(DRIVE_URL) },
    ],
    []
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader onLogoPress={() => router.replace('/(tabs)/(home)')} actionLabel="" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 16 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={textStyles.h1}>Documents</Text>
          <Text style={[textStyles.bodySecondary, styles.subtitle]}>
            Les documents sont liés aux études. Cette section centralisera bientôt les téléchargements et dépôts.
          </Text>
        </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <IconSymbol name="tray.and.arrow.down.fill" size={24} color={colors.primary} />
              <Text style={[textStyles.h3, styles.cardTitle]}>Actions rapides</Text>
            </View>
            <View style={styles.actionRow}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionPill}
                  activeOpacity={action.onPress ? 0.8 : 1}
                  onPress={action.onPress}
                >
                  <IconSymbol name={action.icon} size={18} color={colors.primary} />
                  <Text style={[textStyles.caption, styles.actionText]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
        </View>

        {DOCUMENT_NOTES.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <IconSymbol name={item.icon} size={24} color={colors.secondary} />
              <Text style={[textStyles.h3, styles.cardTitle]}>{item.title}</Text>
            </View>
            <Text style={[textStyles.bodySecondary, styles.cardDescription]}>{item.description}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  header: {
    gap: 6,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    marginBottom: 0,
  },
  cardDescription: {
    lineHeight: 20,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.highlight,
  },
  actionText: {
    color: colors.text,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
    flexShrink: 1,
  },
});
