import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import { useTranslation } from "react-i18next";
import Svg, { Rect } from "react-native-svg";
import dayjs from "dayjs";

import { colors, radius, shadows, spacing } from "../../theme";
import { useAppStore } from "../../store/useAppStore";
import {
  calculateMonthlySalarySummary,
  calculateYearlyGross,
  getIncomeBarrierStatus,
} from "../../services/salaryCalculator";
import { ZenCard } from "../../components/ZenCard";
import { PremiumBlurOverlay } from "../../components/PremiumBlurOverlay";
import { buildCSV } from "../../services/csvExport";
import { hapticSelection, hapticWarning } from "../../services/haptics";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const shifts = useAppStore((s) => s.shifts);
  const jobs = useAppStore((s) => s.jobs);
  const premium = useAppStore((s) => s.premium);
  const selectedMonth = useAppStore((s) => s.selectedMonth);
  const openPaywall = useAppStore((s) => s.openPaywall);
  const showToast = useAppStore((s) => s.showToast);

  const summary = useMemo(
    () =>
      calculateMonthlySalarySummary({
        shifts,
        jobs,
        month: selectedMonth,
        isPremium: premium.isPremium,
      }),
    [shifts, jobs, selectedMonth, premium.isPremium]
  );

  const year = parseInt(selectedMonth.slice(0, 4), 10);

  const yearlyGross = useMemo(
    () => calculateYearlyGross(shifts, jobs, year, premium.isPremium),
    [shifts, jobs, year, premium.isPremium]
  );

  const barrier = getIncomeBarrierStatus(yearlyGross);

  const barData = useMemo(() => {
    const anchor = dayjs(`${selectedMonth}-01`);

    return Array.from({ length: 6 }, (_, i) => {
      const month = anchor.subtract(5 - i, "month").format("YYYY-MM");

      const monthSummary = calculateMonthlySalarySummary({
        shifts,
        jobs,
        month,
        isPremium: premium.isPremium,
      });

      return {
        month,
        gross: monthSummary.totalGross,
      };
    });
  }, [selectedMonth, shifts, jobs, premium.isPremium]);

  const max = Math.max(1, ...barData.map((d) => d.gross));
  const chartH = 140;
  const chartW = 320;

  const handleCsvExport = () => {
    if (!premium.isPremium) {
      hapticWarning();
      openPaywall("CSV_EXPORT");
      return;
    }

    hapticSelection();

    const csv = buildCSV(shifts, jobs);
    console.log("CSV export:\n", csv);
    showToast("CSV export ready (see console)", "success");
  };

  const barrierMap: Record<
    string,
    { title: string; body: string; color: string; bg: string }
  > = {
    safe: {
      title: t("barriers.safe_title"),
      body: t("barriers.safe_body"),
      color: colors.success,
      bg: colors.successSoft,
    },
    warning_103: {
      title: t("barriers.warn_103_title"),
      body: t("barriers.warn_103_body"),
      color: colors.gold,
      bg: colors.goldSoft,
    },
    warning_106: {
      title: t("barriers.warn_106_title"),
      body: t("barriers.warn_106_body"),
      color: colors.gold,
      bg: colors.goldSoft,
    },
    danger_130: {
      title: t("barriers.danger_130_title"),
      body: t("barriers.danger_130_body"),
      color: colors.danger,
      bg: colors.dangerSoft,
    },
  };

  const barrierInfo = barrierMap[barrier] ?? barrierMap.safe;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t("dashboard.title")}</Text>
          <Text style={styles.subtitle}>
            {dayjs(`${selectedMonth}-01`).format("MMMM YYYY")}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <ZenCard style={styles.metricCard} testID="metric-gross">
            <Text style={styles.metricLabel}>{t("dashboard.gross_pay")}</Text>
            <Text style={styles.metricValue}>
              ¥{summary.totalGross.toLocaleString()}
            </Text>
          </ZenCard>

          <ZenCard style={styles.metricCard} testID="metric-net">
            <Text style={styles.metricLabel}>{t("dashboard.net_pay")}</Text>
            <Text style={[styles.metricValue, { color: colors.mintStrong }]}>
              ¥{summary.netPay.toLocaleString()}
            </Text>
          </ZenCard>
        </View>

        <View style={styles.metricRow}>
          <ZenCard style={styles.metricCard} testID="metric-hours">
            <Text style={styles.metricLabel}>
              {t("dashboard.hours_worked")}
            </Text>
            <Text style={styles.metricValue}>
              {(summary.totalMinutes / 60).toFixed(1)}h
            </Text>
          </ZenCard>

          <ZenCard style={styles.metricCard} testID="metric-shifts">
            <Text style={styles.metricLabel}>
              {t("dashboard.shifts_count")}
            </Text>
            <Text style={styles.metricValue}>{summary.shiftCount}</Text>
          </ZenCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("dashboard.income_velocity")}
          </Text>

          <ZenCard testID="chart-card" padded>
            {summary.shiftCount === 0 &&
            barData.every((d) => d.gross === 0) ? (
              <Text style={styles.emptyText}>{t("dashboard.no_data")}</Text>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Svg width={chartW} height={chartH}>
                  {barData.map((d, i) => {
                    const bw = 28;
                    const gap =
                      (chartW - bw * barData.length) / (barData.length + 1);
                    const h = Math.max(3, (d.gross / max) * (chartH - 30));
                    const x = gap + i * (bw + gap);
                    const y = chartH - h - 20;
                    const focused = d.month === selectedMonth;

                    return (
                      <Rect
                        key={d.month}
                        x={x}
                        y={y}
                        width={bw}
                        height={h}
                        rx={8}
                        fill={focused ? colors.charcoal : colors.mintStrong}
                      />
                    );
                  })}
                </Svg>

                <View style={styles.chartLabels}>
                  {barData.map((d) => (
                    <Text key={d.month} style={styles.chartLabel}>
                      {dayjs(`${d.month}-01`).format("MMM")}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </ZenCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("dashboard.monthly_summary")}
          </Text>

          <View style={{ position: "relative" }}>
            <ZenCard>
              <View style={styles.rowBetween}>
                <Text style={styles.rowLabel}>
                  {t("dashboard.night_premium")}
                </Text>
                <Text style={styles.rowValue}>
                  ¥{summary.totalNightPremium.toLocaleString()}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.rowBetween}>
                <Text style={styles.rowLabel}>
                  {t("dashboard.commute_total")}
                </Text>
                <Text style={styles.rowValue}>
                  ¥{summary.totalCommute.toLocaleString()}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.rowBetween}>
                <Text style={styles.rowLabel}>
                  {t("dashboard.deductions")}
                </Text>
                <Text style={styles.rowValue}>
                  ¥{summary.deductions.toLocaleString()}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.rowBetween}>
                <Text
                  style={[
                    styles.rowLabel,
                    { color: colors.charcoal, fontWeight: "500" },
                  ]}
                >
                  {t("dashboard.net_pay")}
                </Text>
                <Text style={[styles.rowValue, { color: colors.mintStrong }]}>
                  ¥{summary.netPay.toLocaleString()}
                </Text>
              </View>
            </ZenCard>

            {!premium.isPremium && (
              <PremiumBlurOverlay
                testID="dashboard-premium-overlay"
                onUnlock={() => openPaywall("NIGHT_SHIFT_ANALYTICS")}
                height={260}
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("dashboard.yearly_progress")}
          </Text>

          <ZenCard testID="yearly-progress-card">
            <View style={styles.rowBetween}>
              <Text style={styles.rowLabel}>{year}</Text>
              <Text style={styles.rowValue}>
                ¥{yearlyGross.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.progressBarBg, { marginTop: spacing.md }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, (yearlyGross / 1300000) * 100)}%`,
                    backgroundColor: barrierInfo.color,
                  },
                ]}
              />
            </View>

            <View style={styles.barrierMarks}>
              <Text style={styles.mark}>103万</Text>
              <Text style={styles.mark}>106万</Text>
              <Text style={styles.mark}>130万</Text>
            </View>
          </ZenCard>

          <Pressable
            testID="barrier-status"
            onPress={() => {
              if (!premium.isPremium) {
                hapticWarning();
                openPaywall("TAX_ESTIMATOR");
              }
            }}
            style={[
              styles.barrierBanner,
              { backgroundColor: barrierInfo.bg, marginTop: spacing.md },
            ]}
          >
            <Feather
              name={barrier === "safe" ? "check-circle" : "alert-triangle"}
              size={18}
              color={barrierInfo.color}
            />

            <View style={{ flex: 1 }}>
              <Text style={[styles.barrierTitle, { color: barrierInfo.color }]}>
                {barrierInfo.title}
              </Text>
              <Text style={styles.barrierBody}>{barrierInfo.body}</Text>
            </View>

            {!premium.isPremium && (
              <Feather name="lock" size={14} color={colors.gold} />
            )}
          </Pressable>
        </View>

        <View style={[styles.section, { marginBottom: 0 }]}>
          <Pressable
            testID="dashboard-csv-export"
            onPress={handleCsvExport}
            style={styles.csvBtn}
          >
            <Feather name="download" size={18} color={colors.charcoal} />
            <Text style={styles.csvText}>{t("dashboard.export_csv")}</Text>
            {!premium.isPremium && (
              <Feather name="lock" size={14} color={colors.gold} />
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: "500",
    color: colors.charcoal,
  },
  subtitle: {
    fontSize: 13,
    color: colors.mutedText,
    marginTop: 2,
  },
  metricRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1,
  },
  metricLabel: {
    color: colors.mutedText,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  metricValue: {
    color: colors.charcoal,
    fontSize: 20,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: "500",
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.mutedText,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: 320,
    marginTop: 4,
  },
  chartLabel: {
    fontSize: 11,
    color: colors.mutedText,
    width: 40,
    textAlign: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    color: colors.mutedText,
    fontSize: 14,
  },
  rowValue: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.mint,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  barrierMarks: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  mark: {
    fontSize: 10,
    color: colors.mutedText,
  },
  barrierBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  barrierTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  barrierBody: {
    fontSize: 12,
    color: colors.charcoal,
    marginTop: 2,
  },
  csvBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadows.subtle,
  },
  csvText: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: "500",
  },
});