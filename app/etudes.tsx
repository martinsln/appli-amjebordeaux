import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { addEtudeFull, deleteEtude, Etude, listenEtudes, updateStatut } from '../lib/etudes'
import { statusLabels } from '@/styles/commonStyles'
import { normalizeStatus, StudyStatus, STUDY_STATUS_ORDER } from '@/types/study'

const STATUS_OPTIONS: StudyStatus[] = STUDY_STATUS_ORDER

export default function EtudesScreen() {
  const [items, setItems] = useState<Etude[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [titre, setTitre] = useState('')
  const [openSelectId, setOpenSelectId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const unsubscribe = listenEtudes((rows) => {
      if (!active) return
      setItems(rows)
      setLoading(false)
    })

    return () => {
      active = false
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const addBusy = (id: string) => setBusyIds((prev) => new Set(prev).add(id))
  const removeBusy = (id: string) =>
    setBusyIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })

  const handleAdd = async () => {
    const value = titre.trim()
    if (!value) return

    setAdding(true)
    try {
      const created = await addEtudeFull({ titre: value })
      if (!created) {
        Alert.alert('Erreur', "Impossible d'ajouter l'étude")
        return
      }
      setTitre('')
    } catch (err) {
      console.error('handleAdd error:', err)
      Alert.alert('Erreur', "Impossible d'ajouter l'étude")
    } finally {
      setAdding(false)
    }
  }

  const handleUpdateStatut = async (id: string, statut: StudyStatus) => {
    addBusy(id)
    try {
      const ok = await updateStatut(id, statut)
      if (!ok) {
        Alert.alert('Erreur', 'Mise à jour du statut impossible')
      } else {
        setOpenSelectId(null)
      }
    } catch (err) {
      console.error('handleUpdateStatut error:', err)
      Alert.alert('Erreur', 'Mise à jour du statut impossible')
    } finally {
      removeBusy(id)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer', "Supprimer cette étude ?", [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          addBusy(id)
          try {
            const ok = await deleteEtude(id)
            if (!ok) {
              Alert.alert('Erreur', 'Suppression impossible')
            }
          } catch (err) {
            console.error('handleDelete error:', err)
            Alert.alert('Erreur', 'Suppression impossible')
          } finally {
            removeBusy(id)
          }
        },
      },
    ])
  }

  const renderItem = ({ item }: { item: Etude }) => {
    const isBusy = busyIds.has(item.id)
    const currentStatus = normalizeStatus(item.statut)
    const statutLabel = statusLabels[currentStatus]

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.titre}</Text>
          <View style={styles.row}>
            <View style={[styles.chip, styles.statutChip]}>
              <Text style={styles.chipText}>{statutLabel}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setOpenSelectId(openSelectId === item.id ? null : item.id)}
              disabled={isBusy}
              style={[styles.smallBtn, isBusy && styles.disabled]}
            >
              <Text style={styles.smallBtnText}>Modifier</Text>
            </TouchableOpacity>
          </View>
          {openSelectId === item.id && (
            <View style={styles.selectRow}>
              {STATUS_OPTIONS.map((status) => {
                const active = currentStatus === status
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.chip, styles.optionChip, active && styles.optionChipActive]}
                    onPress={() => handleUpdateStatut(item.id, status)}
                    disabled={isBusy}
                  >
                    <Text style={[styles.chipText, active && styles.optionChipActiveText]}>
                      {statusLabels[status]}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          disabled={isBusy}
          style={styles.deleteBtn}
          accessibilityLabel="Supprimer l'étude"
        >
          <Text style={[styles.deleteText, isBusy && styles.disabledText]}>🗑️</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Études' }} />

      <View style={styles.formRow}>
        <TextInput
          placeholder="Nouvelle étude..."
          value={titre}
          onChangeText={setTitre}
          style={styles.input}
          editable={!adding}
        />
        <TouchableOpacity
          onPress={handleAdd}
          disabled={adding || !titre.trim()}
          style={[styles.addBtn, (adding || !titre.trim()) && styles.disabled]}
        >
          {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Ajouter</Text>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={items.length === 0 ? styles.emptyList : undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>Aucune étude</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.5,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statutChip: {
    backgroundColor: '#F3F4F6',
  },
  chipText: {
    fontSize: 12,
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionChip: {
    backgroundColor: '#F9FAFB',
  },
  optionChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionChipActiveText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  deleteText: {
    fontSize: 18,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 6,
  },
  emptyText: {
    color: '#666',
  },
})
