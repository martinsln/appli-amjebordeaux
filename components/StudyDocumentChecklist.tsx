import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { colors, textStyles } from '@/styles/commonStyles';
import { Study, StudyStatus, STUDY_STATUS_LABELS } from '@/types/study';
import { IconSymbol } from '@/components/IconSymbol';

type DocumentKey = 'devis' | 'ce' | 'rm' | 'pvrf';

const DOCUMENTS: { key: DocumentKey; label: string }[] = [
  { key: 'devis', label: 'Devis' },
  { key: 'ce', label: "Convention d'étude (CE)" },
  { key: 'rm', label: 'Récapitulatif de mission (RM)' },
  { key: 'pvrf', label: 'PVRF' },
];

const createEmptyDocState = (): Record<DocumentKey, boolean> =>
  DOCUMENTS.reduce((acc, doc) => ({ ...acc, [doc.key]: false }), {} as Record<DocumentKey, boolean>);

const statusTone: Record<StudyStatus, string> = {
  en_cours: '#FFC107',
  livre: '#2196F3',
  facture: '#9C27B0',
  clos: '#4CAF50',
};

/**
 * A ready-to-use checklist view for studies.
 * Drop <StudyDocumentChecklist /> into any screen; replace the sample data with your own studies array.
 */
export function StudyDocumentChecklist() {
  const [studies] = useState<Study[]>([
    {
      id: '1',
      name: 'Refonte site AMJE',
      client: 'Client Interne',
      amount: 12000,
      status: 'en_cours',
      createdAt: '2024-12-01',
    },
    {
      id: '2',
      name: 'Audit UX',
      client: 'Startup SaaS',
      amount: 8500,
      status: 'facture',
      createdAt: '2024-11-12',
    },
  ]);

  const [checklists, setChecklists] = useState<Record<string, Record<DocumentKey, boolean>>>(() =>
    Object.fromEntries(studies.map((study) => [study.id, createEmptyDocState()]))
  );

  const documentsByStudy = useMemo(() => {
    // Always ensure every study has a full checklist object
    const base = createEmptyDocState();
    return studies.map((study) => ({
      study,
      documents: { ...base, ...checklists[study.id] },
    }));
  }, [checklists, studies]);

  const toggleDocument = (studyId: string, document: DocumentKey) => {
    setChecklists((prev) => {
      const prevDocs = prev[studyId] ?? createEmptyDocState();
      return {
        ...prev,
        [studyId]: { ...prevDocs, [document]: !prevDocs[document] },
      };
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {documentsByStudy.map(({ study, documents }) => {
        const tone = statusTone[study.status] ?? colors.primary;
        return (
          <View key={study.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleBlock}>
                <Text style={[textStyles.h3, styles.title]} numberOfLines={1}>
                  {study.name}
                </Text>
                <Text style={[textStyles.bodySecondary, styles.client]} numberOfLines={1}>
                  {study.client}
                </Text>
              </View>
              <View style={[styles.statusBadge, { borderColor: tone, backgroundColor: `${tone}10` }]}>
                <View style={[styles.statusDot, { backgroundColor: tone }]} />
                <Text style={[textStyles.caption, styles.statusText]}>{STUDY_STATUS_LABELS[study.status]}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.checklist}>
              {DOCUMENTS.map((doc) => {
                const checked = documents[doc.key];
                return (
                  <View key={doc.key} style={styles.row}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        checked && { borderColor: colors.primary, backgroundColor: `${colors.primary}22` },
                      ]}
                      onPress={() => toggleDocument(study.id, doc.key)}
                      activeOpacity={0.8}
                    >
                      {checked && <IconSymbol name="checkmark" size={16} color={colors.primary} />}
                    </TouchableOpacity>

                    <Text style={[textStyles.body, styles.docLabel]} numberOfLines={2}>
                      {doc.label}
                    </Text>

                    <View style={styles.actions}>
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
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    marginBottom: 0,
  },
  client: {
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    marginBottom: 0,
    color: colors.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  checklist: {
    gap: 12,
  },
  row: {
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
  actions: {
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
});
