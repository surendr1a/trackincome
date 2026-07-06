import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import { useTranslation } from "react-i18next";

import { colors, radius, spacing } from "../../theme";
import { useAppStore } from "../../store/useAppStore";
import { setLanguage } from "../../i18n";
import { ZenCard } from "../../components/ZenCard";
import { hapticSelection } from "../../services/haptics";

const APP_VERSION = "1.0.0";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();

  const premium = useAppStore((s) => s.premium);
  const openPaywall = useAppStore((s) => s.openPaywall);
  const restore = useAppStore((s) => s.restorePurchases);
  const devToggle = useAppStore((s) => s.devTogglePremiumAction);
  const resetData = useAppStore((s) => s.resetAllUserData);
  const showToast = useAppStore((s) => s.showToast);

  const changeLang = async (lng: "en" | "ja") => {
    hapticSelection();
    await setLanguage(lng);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("settings.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ZenCard style={styles.premiumCard} testID="settings-premium-card">
          <View style={styles.premiumRow}>
            <View style={styles.crownWrap}>
              <Feather
                name="award"
                size={24}
                color={premium.isPremium ? colors.gold : colors.mutedText}
              />
            </View>

            <View style={styles.flex}>
              <Text style={styles.premiumTitle}>{t("settings.premium_status")}</Text>
              <Text style={styles.premiumSub}>
                {premium.isPremium
                  ? t("settings.premium_active")
                  : t("settings.premium_inactive")}
              </Text>
            </View>

            {!premium.isPremium && (
              <Pressable
                testID="settings-upgrade-button"
                onPress={() => openPaywall("BACKUP")}
                style={styles.upgradeBtn}
              >
                <Text style={styles.upgradeText}>{t("settings.upgrade")}</Text>
              </Pressable>
            )}
          </View>
        </ZenCard>

        <Text style={styles.sectionTitle}>{t("settings.language")}</Text>

        <ZenCard style={styles.langCard}>
          <Pressable
            testID="settings-lang-jp"
            onPress={() => changeLang("ja")}
            style={[
              styles.langOption,
              i18n.language === "ja" && styles.langOptionActive,
            ]}
          >
            <Text
              style={[
                styles.langLabel,
                i18n.language === "ja" && styles.langLabelActive,
              ]}
            >
              {t("settings.japanese")}
            </Text>
            {i18n.language === "ja" && (
              <Feather name="check" size={16} color="#FFFFFF" />
            )}
          </Pressable>

          <Pressable
            testID="settings-lang-en"
            onPress={() => changeLang("en")}
            style={[
              styles.langOption,
              i18n.language === "en" && styles.langOptionActive,
            ]}
          >
            <Text
              style={[
                styles.langLabel,
                i18n.language === "en" && styles.langLabelActive,
              ]}
            >
              {t("settings.english")}
            </Text>
            {i18n.language === "en" && (
              <Feather name="check" size={16} color="#FFFFFF" />
            )}
          </Pressable>
        </ZenCard>

        <ZenCard style={styles.purchaseCard}>
          <SettingRow
            testID="settings-restore"
            icon="refresh-cw"
            label={t("settings.restore_purchases")}
            onPress={async () => {
              await restore();
              showToast(t("paywall.restored_toast"), "info");
            }}
          />

          <View style={styles.divider} />

          <SettingRow
            testID="settings-privacy"
            icon="shield"
            label={t("settings.privacy_policy")}
            onPress={() => showToast(t("settings.privacy_policy"), "info")}
          />

          <View style={styles.divider} />

          <SettingRow
            testID="settings-terms"
            icon="file-text"
            label={t("settings.terms")}
            onPress={() => showToast(t("settings.terms"), "info")}
          />
        </ZenCard>

        <Text style={styles.sectionTitle}>{t("settings.developer")}</Text>

        <ZenCard>
          <View style={styles.devRow}>
            <View style={styles.flex}>
              <Text style={styles.devLabel}>{t("settings.toggle_premium_dev")}</Text>
              <Text style={styles.devSub}>{t("settings.premium_status")}</Text>
            </View>

            <Switch
              testID="settings-dev-toggle"
              value={premium.isPremium}
              onValueChange={async () => {
                hapticSelection();
                await devToggle();
              }}
              thumbColor={premium.isPremium ? colors.mintStrong : "#FFFFFF"}
              trackColor={{ true: colors.mint, false: colors.border }}
            />
          </View>

          <View style={styles.divider} />

          <SettingRow
            testID="settings-reset"
            icon="trash-2"
            label={t("settings.reset_data")}
            danger
            onPress={async () => {
              await resetData();
              showToast(t("settings.reset_data"), "success");
            }}
          />
        </ZenCard>

        <Text testID="settings-version" style={styles.version}>
          {t("settings.version")} {APP_VERSION}
        </Text>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  onPress,
  danger,
  testID,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  testID?: string;
}) {
  return (
    <Pressable testID={testID} onPress={onPress} style={styles.row}>
      <Feather
        name={icon}
        size={18}
        color={danger ? colors.danger : colors.charcoal}
      />
      <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
      <Feather name="chevron-right" size={18} color={colors.mutedText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: { fontSize: 26, fontWeight: "500", color: colors.charcoal },
  scrollContent: {
    paddingBottom: 140,
    paddingHorizontal: spacing.xl,
  },
  flex: { flex: 1 },
  premiumCard: { marginBottom: spacing.lg },
  premiumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  crownWrap: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumTitle: { color: colors.charcoal, fontSize: 15, fontWeight: "500" },
  premiumSub: { color: colors.mutedText, fontSize: 12, marginTop: 2 },
  upgradeBtn: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  upgradeText: { color: "#FFFFFF", fontSize: 13, fontWeight: "500" },
  sectionTitle: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  langCard: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  langOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  langOptionActive: { backgroundColor: colors.charcoal },
  langLabel: { color: colors.charcoal, fontSize: 14 },
  langLabelActive: { color: "#FFFFFF", fontWeight: "500" },
  purchaseCard: { marginTop: spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowLabel: { flex: 1, color: colors.charcoal, fontSize: 14 },
  dangerText: { color: colors.danger },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
  devRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  devLabel: { color: colors.charcoal, fontSize: 14 },
  devSub: { color: colors.mutedText, fontSize: 12, marginTop: 2 },
  version: {
    color: colors.mutedText,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});