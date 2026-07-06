import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { useTranslation } from "react-i18next";

import { colors, radius, shadows, spacing } from "../../theme";
import { useAppStore, FREE_JOB_LIMIT } from "../../store/useAppStore";
import { ZenCard } from "../../components/ZenCard";
import { hapticLight, hapticWarning } from "../../services/haptics";

export default function JobsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const jobs = useAppStore((s) => s.jobs);
  const premium = useAppStore((s) => s.premium);
  const openPaywall = useAppStore((s) => s.openPaywall);

  const handleAdd = () => {
    if (!premium.isPremium && jobs.length >= FREE_JOB_LIMIT) {
      hapticWarning();
      openPaywall("MULTI_JOB_LIMIT");
      return;
    }

    hapticLight();
    navigation.navigate("JobEditor");
  };

  const handleEdit = (jobId: string) => {
    navigation.navigate("JobEditor", { jobId });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("jobs.title")}</Text>

        <Pressable testID="jobs-add-button" onPress={handleAdd} style={styles.addBtn}>
          <Feather name="plus" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {jobs.length === 0 ? (
          <ZenCard style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="briefcase" size={26} color={colors.sakuraStrong} />
            </View>

            <Text style={styles.emptyTitle}>{t("jobs.empty_title")}</Text>
            <Text style={styles.emptyBody}>{t("jobs.empty_body")}</Text>

            <Pressable testID="jobs-empty-add" onPress={handleAdd} style={styles.emptyCta}>
              <Text style={styles.emptyCtaText}>{t("jobs.add")}</Text>
            </Pressable>
          </ZenCard>
        ) : (
          <View style={styles.list}>
            {jobs.map((job) => (
              <Pressable
                key={job.id}
                testID={`job-card-${job.id}`}
                onPress={() => handleEdit(job.id)}
              >
                <ZenCard>
                  <View style={styles.jobRow}>
                    <View style={[styles.emojiCircle, { backgroundColor: `${job.color}33` }]}>
                      <Text style={styles.emoji}>{job.emoji}</Text>
                    </View>

                    <View style={styles.jobContent}>
                      <Text style={styles.jobName}>{job.name}</Text>

                      <View style={styles.metaRow}>
                        <Text style={styles.metaText}>
                          {t("jobs.hourly")} ¥{job.hourlyRate.toLocaleString()}
                        </Text>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaText}>
                          {t("jobs.payday")} {job.paydayDay}
                        </Text>
                      </View>

                      <View style={styles.tagRow}>
                        {job.commuteAllowance > 0 && (
                          <View style={styles.tag}>
                            <Text style={styles.tagText}>
                              {t("jobs.commute")} ¥{job.commuteAllowance}
                            </Text>
                          </View>
                        )}

                        {job.nightShiftEnabled && (
                          <View style={[styles.tag, styles.nightTag]}>
                            <Text style={[styles.tagText, styles.nightTagText]}>
                              {t("jobs.night_shift_on")}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Feather name="chevron-right" size={20} color={colors.mutedText} />
                  </View>
                </ZenCard>
              </Pressable>
            ))}

            {!premium.isPremium && jobs.length >= FREE_JOB_LIMIT && (
              <Pressable testID="jobs-locked-hint" onPress={handleAdd} style={styles.lockedHint}>
                <Feather name="lock" size={16} color={colors.gold} />
                <Text style={styles.lockedHintText}>{t("paywall.trigger_multi_job")}</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 26, fontWeight: "500", color: colors.charcoal },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.charcoal,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.subtle,
  },
  scrollContent: {
    paddingBottom: 140,
    paddingHorizontal: spacing.xl,
  },
  empty: { alignItems: "center", paddingVertical: spacing.xxl },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: colors.sakura,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontSize: 13,
    color: colors.mutedText,
    textAlign: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  emptyCta: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
  },
  emptyCtaText: { color: "#FFFFFF", fontSize: 14, fontWeight: "500" },
  list: { gap: spacing.md },
  jobRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 24 },
  jobContent: { flex: 1 },
  jobName: { color: colors.charcoal, fontSize: 16, fontWeight: "500" },
  metaRow: { flexDirection: "row", marginTop: 4, alignItems: "center", gap: 4 },
  metaText: { color: colors.mutedText, fontSize: 12 },
  metaDot: { color: colors.mutedText, fontSize: 12 },
  tagRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  tagText: { fontSize: 11, color: colors.mutedText },
  nightTag: { backgroundColor: colors.mint },
  nightTagText: { color: colors.mintStrong },
  lockedHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.goldSoft,
    marginTop: spacing.md,
  },
  lockedHintText: { color: colors.charcoal, fontSize: 13, flex: 1 },
});