import AppHeader from '@/components/AppHeader';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import { Etude, listEtudes, listenEtudes } from '@/lib/etudes';
import {
  buildMonthlyAmountData,
  buildMonthlyCountData,
  buildStatusPieData,
  computeKpis,
} from '@/lib/kpis';
import { colors, textStyles } from '@/styles/commonStyles';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function KpiScreen() {
  const [rows, setRows] = useState<Etude[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔵 Realtime : écoute Supabase
  useEffect(() => {
    const unsub = listenEtudes((next) => {
      setRows(next);
      setLoading(false);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  // 🔵 Chargement initial
  useEffect(() => {
    const load = async () => {
      try {
        const data = await listEtudes();
        setRows(data);
      } catch (e) {
        console.error("Erreur load KPI:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 🔵 Calculs KPI
  const kpis = useMemo(() => computeKpis(rows), [rows]);
  const statusPie = useMemo(() => buildStatusPieData(kpis.byStatus), [kpis.byStatus]);
  const monthlyAmount = useMemo(() => buildMonthlyAmountData(rows), [rows]);
  const monthlyCount = useMemo(() => buildMonthlyCountData(rows), [rows]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader onLogoPress={() => router.replace('/(tabs)/(home)')} actionLabel="" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={textStyles.bodySecondary}>Chargement des KPI...</Text>
          </View>
        ) : (
          <>
            {/* 🔶 Aperçu */}
            <Section title="Aperçu">
              <View style={styles.cardsRow}>
                <KpiCard label="Études totales" value={kpis.totalCount.toString()} />

                <KpiCard
                  label="Créées ce mois"
                  value={kpis.createdThisMonth.toString()}
                />
              </View>

              <View style={styles.cardsRow}>
                <KpiCard
                  label="Montant total"
                  value={kpis.totalAmount.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0,
                  })}
                />
                <KpiCard
                  label="Montant moyen"
                  value={kpis.averageAmount.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0,
                  })}
                />
              </View>
            </Section>

            <Section title="Études">
              <View style={styles.cardsGrid}>
                {(['en_cours', 'livre', 'facture', 'clos'] as const).map((status) => (
                  <KpiCard
                    key={status}
                    label={`Statut ${status.replace('_', ' ')}`}
                    value={kpis.byStatus[status].toString()}
                  />
                ))}
              </View>
            </Section>

            <Section title="Répartition">
              {statusPie.length === 0 ? (
                <Text style={textStyles.bodySecondary}>Aucune donnée à afficher.</Text>
              ) : (
                <PieChart data={statusPie} size={240} />
              )}
            </Section>

            <Section title="Financier">
              <Text style={textStyles.caption}>Montant total par mois (6 derniers)</Text>
              <BarChart data={monthlyAmount} />
            </Section>

            <Section title="Créations">
              <Text style={textStyles.caption}>Nombre d'études par mois (6 derniers)</Text>
              <LineChart data={monthlyCount} />
            </Section>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------------------------------
 *  Composants simples : Section & KPI card
 * --------------------------------------------------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={textStyles.h2}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={textStyles.bodySecondary}>{label}</Text>
      <Text style={[textStyles.h3, styles.cardValue]}>{value}</Text>
    </View>
  );
}

/* ---------------------------------------------------------
 *  Styles
 * --------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    gap: 24,
    paddingBottom: 40,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  section: {
    gap: 12,
  },
  sectionBody: {
    gap: 12,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardValue: {
    marginTop: 6,
  },
});
