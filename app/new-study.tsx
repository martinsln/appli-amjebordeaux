import AppHeader from '@/components/AppHeader';
import { IconSymbol } from '@/components/IconSymbol';
import { addEtudeFull } from '@/lib/etudes';
import { colors, commonStyles, textStyles } from '@/styles/commonStyles';
import { StudyStatus, STUDY_STATUS_LABELS } from '@/types/study';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const statusOptions: { value: StudyStatus; label: string }[] = [
  { value: 'en_cours', label: STUDY_STATUS_LABELS.en_cours },
  { value: 'livre', label: STUDY_STATUS_LABELS.livre },
  { value: 'facture', label: STUDY_STATUS_LABELS.facture },
  { value: 'clos', label: STUDY_STATUS_LABELS.clos },
];

export default function NewStudyScreen() {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    amount: '',
    status: 'en_cours' as StudyStatus,
  });

  const [loading, setLoading] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const handleLogoPress = () => {
    router.replace('/(tabs)/(home)');
  };

  const handleInputChange = (field: 'name' | 'client' | 'amount', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusSelect = (status: StudyStatus) => {
    setFormData((prev) => ({ ...prev, status }));
    setShowStatusPicker(false);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', "Le nom de l'étude est requis");
      return false;
    }
    if (!formData.client.trim()) {
      Alert.alert('Erreur', 'Le nom du client est requis');
      return false;
    }
    if (!formData.amount.trim() || isNaN(Number(formData.amount))) {
      Alert.alert('Erreur', 'Le montant doit être un nombre valide');
      return false;
    }
    if (Number(formData.amount) < 0) {
      Alert.alert('Erreur', 'Le montant ne peut pas être négatif');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      console.log('Creating new study:', formData);

      // ✅ insertion complète dans Supabase
      const supabaseEtude = await addEtudeFull({
        titre: formData.name.trim(),
        statut: formData.status,
        montant: Number(formData.amount),
        client: formData.client.trim(),
      });

      if (!supabaseEtude) {
        Alert.alert('Erreur', "Impossible de créer l'étude sur Supabase");
        return;
      }

      // ✅ Retour automatique vers l'accueil
      router.replace('/(tabs)/(home)');
    } catch (error) {
      console.error('Error creating study:', error);
      Alert.alert('Erreur', "Impossible de créer l'étude");
    } finally {
      setLoading(false);
    }
  };

  const selectedStatus = statusOptions.find((option) => option.value === formData.status);

  return (
    <SafeAreaView style={commonStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader onLogoPress={handleLogoPress} actionActive />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={commonStyles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {/* Nom de l'étude */}
            <View style={styles.fieldContainer}>
              <Text style={[textStyles.body, styles.label]}>Nom de l'étude *</Text>
              <TextInput
                style={[commonStyles.input, styles.input]}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Ex: Étude de marché textile"
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
              />
            </View>

            {/* Client */}
            <View style={styles.fieldContainer}>
              <Text style={[textStyles.body, styles.label]}>Client *</Text>
              <TextInput
                style={[commonStyles.input, styles.input]}
                value={formData.client}
                onChangeText={(value) => handleInputChange('client', value)}
                placeholder="Ex: Entreprise ABC"
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
              />
            </View>

            {/* Montant */}
            <View style={styles.fieldContainer}>
              <Text style={[textStyles.body, styles.label]}>Montant (€) *</Text>
              <TextInput
                style={[commonStyles.input, styles.input]}
                value={formData.amount}
                onChangeText={(value) => handleInputChange('amount', value)}
                placeholder="Ex: 5000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {/* Statut */}
            <View style={styles.fieldContainer}>
              <Text style={[textStyles.body, styles.label]}>Statut</Text>
              <TouchableOpacity
                style={[commonStyles.input, styles.pickerButton]}
                onPress={() => setShowStatusPicker(!showStatusPicker)}
              >
                <Text style={[textStyles.body, styles.pickerText]}>
                  {selectedStatus?.label}
                </Text>
                <IconSymbol
                  name={showStatusPicker ? 'chevron.up' : 'chevron.down'}
                  color={colors.textSecondary}
                  size={16}
                />
              </TouchableOpacity>

              {showStatusPicker && (
                <View style={styles.pickerOptions}>
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.pickerOption,
                        formData.status === option.value && styles.selectedOption,
                      ]}
                      onPress={() => handleStatusSelect(option.value)}
                    >
                      <Text
                        style={[
                          textStyles.body,
                          formData.status === option.value && styles.selectedOptionText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Bouton de création */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={[textStyles.buttonText, styles.submitButtonText]}>
                {loading ? 'Création en cours...' : "Créer l'étude"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { paddingBottom: 40 },
  fieldContainer: { marginBottom: 24 },
  label: { marginBottom: 8, fontWeight: '600', color: colors.text },
  input: { marginBottom: 0 },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: { flex: 1 },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedOption: { backgroundColor: colors.primary },
  selectedOptionText: { color: colors.card, fontWeight: '600' },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonText: { color: colors.card, fontSize: 16, fontWeight: '600' },
  disabledButton: { opacity: 0.5 },
});
