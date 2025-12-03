import { useCallback, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/IconSymbol';
import { deleteEtude, updateStatut } from '@/lib/etudes';
import { colors, commonStyles, statusColors, statusIcons, statusLabels, textStyles } from '@/styles/commonStyles';
import { Study, StudyStatus, normalizeStatus, STUDY_STATUS_LABELS, STUDY_STATUS_ORDER } from '@/types/study';
import { supabase } from '@/utils/supabase';

const formatAmount = (amount: number) =>
  amount.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const formatDate = (value: string) => new Date(value).toLocaleDateString('fr-FR');

export default function StudyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStudyData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('etudes')
        .select('id,titre,client,montant,statut,created_at')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw error ?? new Error('Étude introuvable');
      }

      setStudy({
        id: data.id,
        name: data.titre ?? 'Sans titre',
        client: data.client ?? 'Client inconnu',
        amount: data.montant ?? 0,
        status: normalizeStatus(data.statut),
        createdAt: data.created_at ?? new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error loading study data:', err);
      Alert.alert('Erreur', 'Impossible de charger les données de l\'étude', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadStudyData();
    }, [loadStudyData])
  );

  const handleBack = () => {
    router.back();
  };

  const handleDelete = useCallback(() => {
    if (!study) return;

    Alert.alert(
      'Supprimer l\'étude',
      `Êtes-vous sûr de vouloir supprimer l'étude "${study.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteEtude(study.id);
              if (!success) {
                throw new Error('deleteEtude failed');
              }
              router.back();
            } catch (error) {
              console.error('Error deleting study:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'étude');
            }
          },
        },
      ]
    );
  }, [study]);

  const applyStatusChange = useCallback(
    async (nextStatus: StudyStatus) => {
      if (!study || study.status === nextStatus) {
        return;
      }

      const previousStudy = study;
      setStudy({ ...study, status: nextStatus });

      try {
        const updated = await updateStatut(study.id, nextStatus);
        if (!updated) {
          throw new Error('updateStatut failed');
        }
      } catch (error) {
        console.error('Error updating study status:', error);
        setStudy(previousStudy);
        Alert.alert('Erreur', 'Impossible de modifier le statut');
      }
    },
    [study]
  );

  const promptStatusChange = useCallback(() => {
    if (!study) return;

    const options = STUDY_STATUS_ORDER.map(status => STUDY_STATUS_LABELS[status]);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: `Statut de "${study.name}"`,
          options: [...options, 'Annuler'],
          cancelButtonIndex: options.length,
        },
        (buttonIndex) => {
          if (buttonIndex !== undefined && buttonIndex < options.length) {
            applyStatusChange(STUDY_STATUS_ORDER[buttonIndex]);
          }
        }
      );
      return;
    }

    Alert.alert(
      'Changer le statut',
      `Sélectionnez le nouveau statut pour "${study.name}"`,
      [
        ...STUDY_STATUS_ORDER.map(status => ({
          text: STUDY_STATUS_LABELS[status],
          onPress: () => applyStatusChange(status),
        })),
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  }, [applyStatusChange, study]);

  if (loading || !study) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <Stack.Screen
          options={{
            title: 'Étude',
            headerLeft: () => (
              <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                <IconSymbol name="chevron.left" color={colors.primary} size={20} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={[commonStyles.container, commonStyles.center]}>
          <Text style={textStyles.body}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: study.name,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <IconSymbol name="chevron.left" color={colors.primary} size={20} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <IconSymbol name="trash" color={colors.error} size={20} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <View style={[commonStyles.card, styles.section]}>
          <Text style={[textStyles.h2, styles.title]}>{study.name}</Text>
          <Text style={[textStyles.bodySecondary, styles.client]}>{study.client}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={[textStyles.caption, styles.label]}>Montant</Text>
              <Text style={[textStyles.h3, styles.value]}>{formatAmount(study.amount)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[textStyles.caption, styles.label]}>Créée le</Text>
              <Text style={[textStyles.body, styles.value]}>{formatDate(study.createdAt)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[study.status] ?? colors.primary },
            ]}
            onPress={promptStatusChange}
            activeOpacity={0.7}
          >
            <Text style={styles.statusIcon}>{statusIcons[study.status]}</Text>
            <Text style={[textStyles.body, styles.statusText]}>{statusLabels[study.status]}</Text>
            <Text style={[textStyles.caption, styles.statusHint]}>Appuyer pour modifier</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteRow} onPress={handleDelete}>
          <IconSymbol name="trash" color={colors.card} size={18} />
          <Text style={[textStyles.buttonText, styles.deleteRowText]}>Supprimer l'étude</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 4,
  },
  client: {
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoItem: {
    flex: 1,
  },
  label: {
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  statusIcon: {
    fontSize: 20,
  },
  statusText: {
    color: colors.card,
    fontWeight: '600',
  },
  statusHint: {
    color: colors.card,
    opacity: 0.8,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.error,
  },
  deleteRowText: {
    color: colors.card,
  },
});
