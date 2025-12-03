
import AppHeader from '@/components/AppHeader';
import PieChart from '@/components/PieChart';
import StatsCard from '@/components/StatsCard';
import StudyCard from '@/components/StudyCard';
import { deleteEtude, listEtudes, listenEtudes, updateStatut, Etude } from '@/lib/etudes';
import { colors, commonStyles, textStyles } from '@/styles/commonStyles';
import { Study, StudyStatus, normalizeStatus, STUDY_STATUS_LABELS, STUDY_STATUS_ORDER } from '@/types/study';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  LayoutAnimation,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const computeStatsFromStudies = (studyList: Study[]) => {
  const totalRevenue = studyList.reduce((sum, study) => sum + study.amount, 0);
  const totalStudies = studyList.length;
  const studiesInProgress = studyList.filter(study => study.status === 'en_cours').length;

  const statusDistribution = studyList.reduce((acc, study) => {
    acc[study.status] = (acc[study.status] || 0) + 1;
    return acc;
  }, {} as Record<StudyStatus, number>);

  return {
    totalRevenue,
    totalStudies,
    studiesInProgress,
    statusDistribution,
  };
};

const COLOR_PALETTE = [
  '#FF6B6B',
  '#FF914D',
  '#2EC4B6',
  '#3777FF',
  '#B5179E',
  '#FFBE0B',
  '#00A6FB',
  '#F71735',
];

const toStudy = (etude: Etude): Study => ({
  id: etude.id,
  name: etude.titre ?? 'Sans titre',
  client: etude.client ?? 'Client inconnu',
  amount: etude.montant ?? 0,
  status: normalizeStatus(etude.statut),
  createdAt: etude.created_at ?? new Date().toISOString(),
});

export default function HomeScreen() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenEtudes((rows) => {
      const mapped = rows.map(toStudy);
      setStudies(mapped);
      setLoading(false);
      setRefreshing(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const rows = await listEtudes();
      setStudies(rows.map(toStudy));
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      Alert.alert('Erreur', 'Impossible de rafraîchir les données');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const stats = useMemo(() => computeStatsFromStudies(studies), [studies]);

  const handleLogoPress = () => {
    router.replace('/(tabs)/(home)');
  };

  const handleNewStudy = () => {
    router.push('/new-study');
  };

  const handleViewAllStudies = () => {
    router.push('/studies');
  };

  const deleteStudy = useCallback(async (studyToDelete: Study) => {
    let previous: Study[] = [];
    LayoutAnimation.configureNext(
      LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)
    );

    setStudies(prevStudies => {
      previous = prevStudies;
      return prevStudies.filter(study => study.id !== studyToDelete.id);
    });

    try {
      const supabaseDeleted = await deleteEtude(studyToDelete.id);
      if (!supabaseDeleted) {
        throw new Error('deleteEtude failed');
      }
    } catch (error) {
      console.error('Error deleting study:', error);
      setStudies(previous);
      Alert.alert('Erreur', 'Impossible de supprimer l\'étude');
    }
  }, []);

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
    if (study.status === nextStatus) {
      return;
    }

    let previous: Study[] = [];
    setStudies(prevStudies => {
      previous = prevStudies;
      return prevStudies.map(item =>
        item.id === study.id ? { ...item, status: nextStatus } : item
      );
    });

    try {
      const updated = await updateStatut(study.id, nextStatus);
      if (!updated) {
        throw new Error('updateStatut failed');
      }
    } catch (error) {
      console.error('Error updating study status:', error);
      setStudies(previous);
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    }
  }, []);

  const promptStatusChange = useCallback((study: Study) => {
    if (Platform.OS === 'ios') {
      const options = STUDY_STATUS_ORDER.map(status => STUDY_STATUS_LABELS[status]);
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: `Statut de "${study.name}"`,
          options: [...options, 'Annuler'],
          cancelButtonIndex: options.length,
        },
        (buttonIndex) => {
          if (buttonIndex !== undefined && buttonIndex < options.length) {
            applyStatusChange(study, STUDY_STATUS_ORDER[buttonIndex]);
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
          onPress: () => applyStatusChange(study, status),
        })),
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  }, [applyStatusChange]);

  const chartData = useMemo(() => {
    const getStudyColor = (study: Study) => {
      const key = `${study.id}-${study.name}`;
      let hash = 0;

      for (let i = 0; i < key.length; i += 1) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
        hash |= 0;
      }

      const index = Math.abs(hash) % COLOR_PALETTE.length;
      return COLOR_PALETTE[index];
    };

    return studies
      .filter(study => study.amount > 0)
      .map(study => ({
        label: study.name,
        value: study.amount,
        color: getStudyColor(study),
      }));
  }, [studies]);

  const recentStudies = useMemo(
    () =>
      [...studies]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [studies]
  );

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <AppHeader
          onLogoPress={handleLogoPress}
          onActionPress={handleNewStudy}
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
          headerShown: false,
        }}
      />
      <AppHeader
        onLogoPress={handleLogoPress}
        onActionPress={handleNewStudy}
      />
      
      <ScrollView 
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[textStyles.h1, styles.welcomeTitle]}>
            Tableau de bord
          </Text>
          <Text style={textStyles.bodySecondary}>
            Gérez vos études AMJE en toute simplicité
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatsCard
            title="CA Total"
            value={stats.totalRevenue}
            icon="💰"
            color={colors.primary}
          />
          <StatsCard
            title="Études"
            value={stats.totalStudies}
            subtitle="Total"
            icon="📊"
            color={colors.secondary}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatsCard
            title="En cours"
            value={stats.studiesInProgress}
            subtitle="Études actives"
            icon="⏳"
            color={colors.success}
          />
          <StatsCard
            title="Statuts"
            value={Object.keys(stats.statusDistribution).length}
            subtitle="Différents"
            icon="📈"
            color={colors.accent}
          />
        </View>

        {/* Revenue Chart */}
        {chartData.length > 0 && (
          <View style={[commonStyles.card, styles.chartSection]}>
            <Text style={[textStyles.h3, styles.sectionTitle]}>
              Répartition du CA par étude
            </Text>
            <PieChart data={chartData} size={250} />
          </View>
        )}

        {/* Recent Studies */}
        <View style={styles.studiesSection}>
          <View style={[commonStyles.row, commonStyles.spaceBetween, styles.sectionHeader]}>
            <Text style={[textStyles.h3, styles.sectionTitle]}>
              Études récentes
            </Text>
            <TouchableOpacity
              onPress={handleViewAllStudies}
              disabled={studies.length === 0}
              style={[styles.viewAllButton, studies.length === 0 && styles.viewAllButtonDisabled]}
            >
              <Text style={[
                textStyles.caption,
                styles.viewAllText,
                studies.length === 0 && styles.viewAllTextDisabled,
              ]}>
                Voir tout
              </Text>
            </TouchableOpacity>
          </View>

          {recentStudies.length > 0 ? (
            recentStudies.map((study) => (
              <StudyCard
                key={study.id}
                study={study}
                onDelete={() => handleDeleteStudy(study)}
                onStatusPress={() => promptStatusChange(study)}
              />
            ))
          ) : (
            <View style={[commonStyles.card, commonStyles.center, styles.emptyState]}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={[textStyles.body, styles.emptyTitle]}>
                Aucune étude
              </Text>
              <Text style={[textStyles.bodySecondary, styles.emptySubtitle]}>
                Commencez par créer votre première étude
              </Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleNewStudy}
              >
                <Text style={[textStyles.buttonText, styles.createButtonText]}>
                  Créer une étude
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 8,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    color: colors.primary,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  chartSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  studiesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.primary,
  },
  viewAllText: {
    color: colors.primary,
    fontWeight: '600',
  },
  viewAllTextDisabled: {
    color: colors.textSecondary,
  },
  viewAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewAllButtonDisabled: {
    opacity: 0.6,
  },
  emptyState: {
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.card,
  },
  bottomSpacing: {
    height: 100,
  },
});
