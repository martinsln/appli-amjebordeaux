
import React, { useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, textStyles, commonStyles } from '@/styles/commonStyles';
import StudyCard from '@/components/StudyCard';
import { deleteEtude, listEtudes, listenEtudes, Etude } from '@/lib/etudes';
import { Study, StudyStatus, normalizeStatus, STUDY_STATUS_LABELS } from '@/types/study';

const statusOptions: { value: '' | StudyStatus; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en_cours', label: STUDY_STATUS_LABELS.en_cours },
  { value: 'livre', label: STUDY_STATUS_LABELS.livre },
  { value: 'facture', label: STUDY_STATUS_LABELS.facture },
  { value: 'clos', label: STUDY_STATUS_LABELS.clos },
];

const toStudy = (etude: Etude): Study => ({
  id: etude.id,
  name: etude.titre ?? 'Sans titre',
  client: etude.client ?? 'Client inconnu',
  amount: etude.montant ?? 0,
  status: normalizeStatus(etude.statut),
  createdAt: etude.created_at ?? new Date().toISOString(),
});

export default function StudiesScreen() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | StudyStatus>('');
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const applyFilters = useCallback((studiesData: Study[], search: string, status: string) => {
    let filtered = studiesData;

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(study =>
        study.name.toLowerCase().includes(searchLower) ||
        study.client.toLowerCase().includes(searchLower)
      );
    }

    if (status) {
      filtered = filtered.filter(study => study.status === status);
    }

    setFilteredStudies(filtered);
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

  useEffect(() => {
    applyFilters(studies, searchQuery, statusFilter);
  }, [studies, searchQuery, statusFilter, applyFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(studies, query, statusFilter);
  };

  const handleStatusFilter = (status: '' | StudyStatus) => {
    setStatusFilter(status);
    setShowStatusFilter(false);
    applyFilters(studies, searchQuery, status);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const rows = await listEtudes();
      setStudies(rows.map(toStudy));
    } catch (error) {
      console.error('Error refreshing studies:', error);
      Alert.alert('Erreur', 'Impossible de rafraîchir les études');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleNewStudy = () => {
    router.push('/new-study');
  };

  const handleBack = () => {
    router.back();
  };

  const deleteStudy = async (studyToDelete: Study) => {
    const previous = studies;
    LayoutAnimation.configureNext(
      LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)
    );
    setStudies(prevStudies => prevStudies.filter(study => study.id !== studyToDelete.id));

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

  const renderStudyItem = ({ item }: { item: Study }) => (
    <StudyCard
      study={item}
      onDelete={() => handleDeleteStudy(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={[commonStyles.center, styles.emptyState]}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={[textStyles.h3, styles.emptyTitle]}>
        {searchQuery || statusFilter ? 'Aucun résultat' : 'Aucune étude'}
      </Text>
      <Text style={[textStyles.bodySecondary, styles.emptySubtitle]}>
        {searchQuery || statusFilter 
          ? 'Essayez de modifier vos critères de recherche'
          : 'Commencez par créer votre première étude'
        }
      </Text>
      {!searchQuery && !statusFilter && (
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleNewStudy}
        >
          <Text style={[textStyles.buttonText, styles.createButtonText]}>
            Créer une étude
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const selectedStatusOption = statusOptions.find(option => option.value === statusFilter);

  return (
    <SafeAreaView style={commonStyles.container}>
      <Stack.Screen
        options={{
          title: 'Toutes les études',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <IconSymbol name="chevron.left" color={colors.primary} size={20} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleNewStudy} style={styles.headerButton}>
              <IconSymbol name="plus" color={colors.primary} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={commonStyles.content}>
        {loading && !refreshing ? (
          <View style={[commonStyles.center, styles.loadingContainer]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[textStyles.bodySecondary, styles.loadingText]}>
              Chargement des études...
            </Text>
          </View>
        ) : (
          <>
            {/* Search and Filter */}
            <View style={styles.filtersContainer}>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <IconSymbol name="magnifyingglass" color={colors.textSecondary} size={16} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Rechercher par nom ou client..."
                  placeholderTextColor={colors.textSecondary}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => handleSearch('')}>
                    <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={16} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Status Filter */}
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowStatusFilter(!showStatusFilter)}
              >
                <Text style={[textStyles.caption, styles.filterButtonText]}>
                  {selectedStatusOption?.label || 'Statut'}
                </Text>
                <IconSymbol 
                  name={showStatusFilter ? "chevron.up" : "chevron.down"} 
                  color={colors.primary} 
                  size={12} 
                />
              </TouchableOpacity>

              {showStatusFilter && (
                <View style={styles.statusFilterOptions}>
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.statusFilterOption,
                        statusFilter === option.value && styles.selectedStatusFilter
                      ]}
                      onPress={() => handleStatusFilter(option.value)}
                    >
                      <Text style={[
                        textStyles.body,
                        statusFilter === option.value && styles.selectedStatusFilterText
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
              <Text style={[textStyles.caption, styles.resultsCount]}>
                {filteredStudies.length} étude{filteredStudies.length !== 1 ? 's' : ''}
                {(searchQuery || statusFilter) && ` trouvée${filteredStudies.length !== 1 ? 's' : ''}`}
              </Text>
            </View>

            {/* Studies List */}
            <FlatList
              data={filteredStudies}
              renderItem={renderStudyItem}
              keyExtractor={(item) => item.id.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.listContainer,
                filteredStudies.length === 0 && styles.emptyListContainer
              ]}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 8,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  statusFilterOptions: {
    marginTop: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  statusFilterOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedStatusFilter: {
    backgroundColor: colors.primary,
  },
  selectedStatusFilterText: {
    color: colors.card,
    fontWeight: '600',
  },
  resultsHeader: {
    marginBottom: 12,
  },
  resultsCount: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  listContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
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
});
