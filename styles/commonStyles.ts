
import { StyleSheet } from 'react-native';
import { StudyStatus, STUDY_STATUS_LABELS } from '@/types/study';

export const colors = {
  background: '#F5F5F5',      // Light gray for a clean look
  text: '#333333',            // Dark gray for readability
  textSecondary: '#666666',   // Slightly lighter gray for less important text
  primary: '#004F90',         // AMJE Blue
  secondary: '#FF7A00',       // AMJE Orange
  accent: '#00AEEF',          // A lighter blue as an accent color
  card: '#FFFFFF',            // White for cards to stand out
  highlight: '#E0E0E0',       // Light gray for highlighting elements
  success: '#4CAF50',         // Green for success states
  warning: '#FFC107',         // Yellow for warning states
  error: '#F44336',           // Red for error states
  border: '#E0E0E0',          // Light gray for borders
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const textStyles = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 24,
  },
  bodySecondary: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  buttonTextOutline: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.card,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  shadow: {
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
});

const statusColorMap: Record<StudyStatus, string> = {
  en_cours: '#355C9C',  // Bleu profond
  livre: '#4F8EC9',     // Bleu clair chaud
  facture: '#E9C46A',   // Jaune doré pastel
  clos: '#6ABF69',      // Vert pastel
};

const statusIconMap: Record<StudyStatus, string> = {
  en_cours: '⏳',
  livre: '📦',
  facture: '💰',
  clos: '✅',
};

export const statusColors: Record<StudyStatus, string> = statusColorMap;
export const statusIcons: Record<StudyStatus, string> = statusIconMap;
export const statusLabels: Record<StudyStatus, string> = STUDY_STATUS_LABELS;
