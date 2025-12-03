import AppHeader from '@/components/AppHeader';
import { IconSymbol } from '@/components/IconSymbol';
import StudyCard from '@/components/StudyCard';
import { deleteEtude, Etude, listenEtudes, listEtudes, updateStatut } from '@/lib/etudes';
import { colors, commonStyles, textStyles } from '@/styles/commonStyles';
import { normalizeStatus, Study, STUDY_STATUS_LABELS, STUDY_STATUS_ORDER, StudyStatus } from '@/types/study';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type DocumentKey = 'devis' | 'ce' | 'rm' | 'pvrf';

const DOCUMENTS: { key: DocumentKey; label: string }[] = [
  { key: 'devis', label: 'Devis' },
  { key: 'ce', label: "Convention d'étude (CE)" },
  { key: 'rm', label: 'Récapitulatif de mission (RM)' },
  { key: 'pvrf', label: 'PVRF' },
];

const createEmptyChecklist = (): Record<DocumentKey, boolean> =>
  DOCUMENTS.reduce((acc, doc) => ({ ...acc, [doc.key]: false }), {} as Record<DocumentKey, boolean>);

const toStudy = (etude: Etude): Study => ({
  id: etude.id,
  name: etude.titre ?? 'Sans titre',
  client: etude.client ?? 'Client inconnu',
  amount: etude.montant ?? 0,
  status: normalizeStatus(etude.statut),
  createdAt: etude.created_at ?? new Date().toISOString(),
});

export default function AllStudiesScreen() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedStudyId, setExpandedStudyId] = useState<string | null>(null);
  const [checklists, setChecklists] = useState<Record<string, Record<DocumentKey, boolean>>>({});
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = listenEtudes((rows) => {
      setStudies(rows.map(toStudy));
      setRefreshing(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    setChecklists((prev) => {
      const next = { ...prev };
      studies.forEach((study) => {
        if (!next[study.id]) {
          next[study.id] = createEmptyChecklist();
        }
      });
      return next;
    });
  }, [studies]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const rows = await listEtudes();
      setStudies(rows.map(toStudy));
    } catch (error) {
      console.error('[ALL_ETUDES] refresh error', error);
      Alert.alert('Erreur', 'Impossible de rafraîchir les études');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleCreateStudy = () => {
    router.push('/new-study');
  };

  const deleteStudy = async (studyToDelete: Study) => {
    const previous = studies;
    LayoutAnimation.configureNext(
      LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)
    );
    setStudies(prev => prev.filter(study => study.id !== studyToDelete.id));

    try {
      const removed = await deleteEtude(studyToDelete.id);
      if (!removed) {
        throw new Error('deleteEtude failed');
      }
    } catch (error) {
      console.error('[ALL_ETUDES] delete error', error);
      setStudies(previous);
      Alert.alert('Erreur', 'Impossible de supprimer l\'étude');
    }
  };

  const handleDeleteStudy = (study: Study) => {
    Alert.alert(
      'Supprimer l\'étude',
      `Voulez-vous supprimer l'étude "${study.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteStudy(study),
        },
      ]
    );
  };

  const applyStatusChange = useCallback(async (study: Study, nextStatus: StudyStatus) => {
    if (study.status === nextStatus) return;

    const previous = studies;
    setStudies(prev =>
      prev.map(item => (item.id === study.id ? { ...item, status: nextStatus } : item))
    );

    try {
      const ok = await updateStatut(study.id, nextStatus);
      if (!ok) {
        throw new Error('updateStatut failed');
      }
    } catch (error) {
      console.error('[ALL_ETUDES] status error', error);
      setStudies(previous);
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    }
  }, [studies]);

  const promptStatusChange = (study: Study) => {
    if (Platform.OS === 'ios') {
      const labels = STUDY_STATUS_ORDER.map(status => STUDY_STATUS_LABELS[status]);
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: `Statut de "${study.name}"`,
          options: [...labels, 'Annuler'],
          cancelButtonIndex: labels.length,
        },
        (buttonIndex) => {
          if (buttonIndex !== undefined && buttonIndex < labels.length) {
            applyStatusChange(study, STUDY_STATUS_ORDER[buttonIndex]);
          }
        }
      );
      return;
    }

    Alert.alert(
      'Modifier le statut',
      `Choisissez le nouveau statut pour "${study.name}"`,
      [
        ...STUDY_STATUS_ORDER.map((status) => ({
          text: STUDY_STATUS_LABELS[status],
          onPress: () => applyStatusChange(study, status),
        })),
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const toggleExpand = (studyId: string) => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(200, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)
    );
    setExpandedStudyId((prev) => (prev === studyId ? null : studyId));
  };

  const toggleChecklistDoc = (studyId: string, doc: DocumentKey) => {
    setChecklists((prev) => {
      const current = prev[studyId] ?? createEmptyChecklist();
      return { ...prev, [studyId]: { ...current, [doc]: !current[doc] } };
    });
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="doc.text.fill" size={32} color={colors.primary} />
      <Text style={[textStyles.h3, styles.emptyTitle]}>Aucune étude</Text>
      <Text style={[textStyles.bodySecondary, styles.emptySubtitle]}>
        Créez une nouvelle étude pour démarrer le suivi.
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateStudy} activeOpacity={0.8}>
        <Text style={[textStyles.buttonText, styles.createButtonText]}>Créer une étude</Text>
      </TouchableOpacity>
    </View>
  );

  const renderChecklist = useCallback(
    (studyId: string) => (
      <View style={styles.checklistCard}>
        <View style={styles.checklistHeader}>
          <Text style={[textStyles.h3, styles.checklistTitle]}>Checklist documents</Text>
          <Text style={[textStyles.bodySecondary, styles.checklistSubtitle]}>
            Cochez les documents de l'étude.
          </Text>
        </View>
        <View style={styles.checklist}>
          {DOCUMENTS.map((doc) => {
            const checked = checklists[studyId]?.[doc.key] ?? false;
            return (
              <View key={doc.key} style={styles.docRow}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    checked && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
                  ]}
                  onPress={() => toggleChecklistDoc(studyId, doc.key)}
                  activeOpacity={0.8}
                >
                  {checked && <IconSymbol name="checkmark" size={16} color={colors.primary} />}
                </TouchableOpacity>
                <Text style={[textStyles.body, styles.docLabel]} numberOfLines={2}>
                  {doc.label}
                </Text>
                <View style={styles.docActions}>
                  <TouchableOpacity style={[styles.actionButton, styles.upload]} onPress={() => {}} activeOpacity={0.85}>
                    <IconSymbol name="arrow.up.doc.fill" size={18} color={colors.card} />
                    <Text style={[textStyles.caption, styles.actionText]}>Upload</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.download]} onPress={() => {}} activeOpacity={0.85}>
                    <IconSymbol name="square.and.arrow.down" size={18} color={colors.primary} />
                    <Text style={[textStyles.caption, styles.actionTextAlt]}>Download</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    ),
    [checklists]
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader onLogoPress={() => router.replace('/(tabs)/(home)')} onActionPress={handleCreateStudy} />
      <FlatList
        data={studies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 16 + insets.bottom },
          studies.length === 0 && { flex: 1 },
        ]}
        renderItem={({ item }) => (
          <View style={styles.studyBlock}>
            <StudyCard
              study={item}
              onDelete={() => handleDeleteStudy(item)}
              onStatusPress={() => promptStatusChange(item)}
              onPress={() => toggleExpand(item.id)}
            />
            {expandedStudyId === item.id && renderChecklist(item.id)}
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={textStyles.h1}>Toutes les études</Text>
            <Text style={[textStyles.bodySecondary, styles.subtitle]}>
              Vue complète des études en cours et terminées.
            </Text>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <IconSymbol name="doc.text.fill" size={22} color={colors.primary} />
                <Text style={[textStyles.h3, styles.infoTitle]}>Checklists par étude</Text>
              </View>
              <Text style={[textStyles.bodySecondary, styles.infoDescription]}>
                Cliquez sur une étude pour afficher et cocher ses documents.
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  header: {
    marginBottom: 8,
    gap: 4,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  infoCard: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    marginBottom: 0,
  },
  infoDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  studyBlock: {
    gap: 8,
  },
  checklistCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  checklistHeader: {
    gap: 4,
  },
  checklistTitle: {
    marginBottom: 0,
  },
  checklistSubtitle: {
    color: colors.textSecondary,
  },
  checklist: {
    gap: 10,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docLabel: {
    flex: 1,
    fontWeight: '600',
  },
  docActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  upload: {
    backgroundColor: colors.primary,
  },
  download: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionText: {
    color: colors.card,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  actionTextAlt: {
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    marginBottom: 2,
  },
  emptySubtitle: {
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  createButtonText: {
    color: colors.card,
    fontWeight: '700',
  },
});
