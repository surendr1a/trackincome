import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import dayjs from 'dayjs';

import {colors, radius, shadows, spacing} from '../theme';
import {useAppStore} from '../store/useAppStore';
import {calculateShiftPay} from '../services/salaryCalculator';
import {hapticLight, hapticSelection, hapticSuccess} from '../services/haptics';

type RouteParams = {
  shiftId?: string;
  date?: string;
};

function TimeStepper({
  value,
  onChange,
  testID,
}: {
  value: string;
  onChange: (value: string) => void;
  testID: string;
}) {
  const d = dayjs(value);

  const setHour = (h: number) => {
    onChange(d.hour(((h % 24) + 24) % 24).toISOString());
  };

  const setMinute = (m: number) => {
    onChange(d.minute(((m % 60) + 60) % 60).toISOString());
  };

  return (
    <View style={styles.stepper}>
      <View style={styles.stepperGroup}>
        <Pressable
          testID={`${testID}-hour-minus`}
          onPress={() => {
            hapticSelection();
            setHour(d.hour() - 1);
          }}
          style={styles.stepBtn}>
          <Text style={styles.stepIcon}>⌄</Text>
        </Pressable>

        <Text style={styles.stepValue}>{d.format('HH')}</Text>

        <Pressable
          testID={`${testID}-hour-plus`}
          onPress={() => {
            hapticSelection();
            setHour(d.hour() + 1);
          }}
          style={styles.stepBtn}>
          <Text style={styles.stepIcon}>⌃</Text>
        </Pressable>
      </View>

      <Text style={styles.stepColon}>:</Text>

      <View style={styles.stepperGroup}>
        <Pressable
          testID={`${testID}-min-minus`}
          onPress={() => {
            hapticSelection();
            setMinute(d.minute() - 15);
          }}
          style={styles.stepBtn}>
          <Text style={styles.stepIcon}>⌄</Text>
        </Pressable>

        <Text style={styles.stepValue}>{d.format('mm')}</Text>

        <Pressable
          testID={`${testID}-min-plus`}
          onPress={() => {
            hapticSelection();
            setMinute(d.minute() + 15);
          }}
          style={styles.stepBtn}>
          <Text style={styles.stepIcon}>⌃</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ShiftEditorModal() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {t} = useTranslation();

  const params: RouteParams = route.params ?? {};

  const jobs = useAppStore(s => s.jobs);
  const shifts = useAppStore(s => s.shifts);
  const premium = useAppStore(s => s.premium);
  const addShift = useAppStore(s => s.addShift);
  const updateShift = useAppStore(s => s.updateShift);
  const deleteShift = useAppStore(s => s.deleteShift);
  const showToast = useAppStore(s => s.showToast);

  const existing = params.shiftId
    ? shifts.find(s => s.id === params.shiftId)
    : undefined;

  const initialDate =
    existing?.date ?? params.date ?? dayjs().format('YYYY-MM-DD');

  const [jobId, setJobId] = useState<string>(
    existing?.jobId ?? jobs[0]?.id ?? '',
  );
  const [date, setDate] = useState<string>(initialDate);

  const baseDate = dayjs(date);

  const [startTime, setStartTime] = useState<string>(
    existing?.startTime ??
      baseDate.hour(18).minute(0).second(0).millisecond(0).toISOString(),
  );

  const [endTime, setEndTime] = useState<string>(
    existing?.endTime ??
      baseDate.hour(23).minute(0).second(0).millisecond(0).toISOString(),
  );

  const [breakMin, setBreakMin] = useState<string>(
    String(existing?.breakMinutes ?? 30),
  );
  const [memo, setMemo] = useState<string>(existing?.memo ?? '');
  const [isHoliday, setIsHoliday] = useState<boolean>(
    existing?.isHoliday ?? false,
  );

  const currentJob = jobs.find(j => j.id === jobId);

  const preview = useMemo(() => {
    if (!currentJob) return null;

    return calculateShiftPay(
      {
        id: 'preview',
        jobId,
        date,
        startTime,
        endTime,
        breakMinutes: parseInt(breakMin || '0', 10) || 0,
        memo,
        hourlyRateSnapshot: currentJob.hourlyRate,
        commuteAllowanceSnapshot: currentJob.commuteAllowance,
        isHoliday,
        createdAt: '',
        updatedAt: '',
      },
      currentJob,
      premium.isPremium,
    );
  }, [
    currentJob,
    jobId,
    date,
    startTime,
    endTime,
    breakMin,
    memo,
    isHoliday,
    premium.isPremium,
  ]);

  const dateNav = (delta: number) => {
    hapticSelection();

    const nextDate = dayjs(date).add(delta, 'day').format('YYYY-MM-DD');
    const newBase = dayjs(nextDate);

    setDate(nextDate);
    setStartTime(
      newBase
        .hour(dayjs(startTime).hour())
        .minute(dayjs(startTime).minute())
        .toISOString(),
    );
    setEndTime(
      newBase
        .hour(dayjs(endTime).hour())
        .minute(dayjs(endTime).minute())
        .toISOString(),
    );
  };

  const handleSave = async () => {
    if (!currentJob) {
      showToast?.(t('common.error'), 'error');
      return;
    }

    const payload = {
      jobId,
      date,
      startTime,
      endTime,
      breakMinutes: parseInt(breakMin || '0', 10) || 0,
      memo,
      hourlyRateSnapshot: currentJob.hourlyRate,
      commuteAllowanceSnapshot: currentJob.commuteAllowance,
      isHoliday,
    };

    if (existing) {
      await updateShift(existing.id, payload);
      hapticSuccess();
      showToast?.(t('common.save'), 'success');
      navigation.goBack();
      return;
    }

    const result = await addShift(payload);

    if (result.ok) {
      hapticSuccess();
      showToast?.(t('common.save'), 'success');
      navigation.goBack();
    }
  };

  const handleDelete = async () => {
    if (!existing) return;

    await deleteShift(existing.id);
    hapticSelection();
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}>
      <View style={[styles.header, {paddingTop: insets.top + spacing.md}]}>
        <Pressable
          testID="shift-editor-close"
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}>
          <Text style={styles.headerIcon}>×</Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          {existing ? t('shift_editor.edit_title') : t('shift_editor.new_title')}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Text style={styles.label}>{t('shift_editor.select_job')}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.jobChipRow}>
          {jobs.map(job => (
            <Pressable
              key={job.id}
              testID={`shift-job-chip-${job.id}`}
              onPress={() => {
                hapticSelection();
                setJobId(job.id);
              }}
              style={[
                styles.jobChip,
                jobId === job.id && styles.jobChipActive,
              ]}>
              <Text style={styles.jobChipEmoji}>{job.emoji}</Text>
              <Text
                style={[
                  styles.jobChipText,
                  jobId === job.id && styles.jobChipTextActive,
                ]}>
                {job.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.label}>{t('shift_editor.date')}</Text>

        <View style={styles.dateRow}>
          <Pressable
            testID="shift-date-prev"
            onPress={() => dateNav(-1)}
            style={styles.dateArrow}>
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>

          <Text style={styles.dateValue}>{dayjs(date).format('YYYY-MM-DD')}</Text>

          <Pressable
            testID="shift-date-next"
            onPress={() => dateNav(1)}
            style={styles.dateArrow}>
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeColumn}>
            <Text style={styles.label}>{t('shift_editor.start_time')}</Text>
            <TimeStepper
              value={startTime}
              onChange={setStartTime}
              testID="shift-start"
            />
          </View>

          <View style={styles.timeColumn}>
            <Text style={styles.label}>{t('shift_editor.end_time')}</Text>
            <TimeStepper
              value={endTime}
              onChange={setEndTime}
              testID="shift-end"
            />
          </View>
        </View>

        <Text style={styles.label}>{t('shift_editor.break')}</Text>

        <TextInput
          testID="shift-break-input"
          value={breakMin}
          onChangeText={setBreakMin}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
        />

        <Text style={styles.label}>{t('shift_editor.memo')}</Text>

        <TextInput
          testID="shift-memo-input"
          value={memo}
          onChangeText={setMemo}
          placeholder={t('shift_editor.memo_placeholder')}
          placeholderTextColor={colors.mutedText}
          multiline
          style={[styles.input, styles.memoInput]}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('shift_editor.is_holiday')}</Text>

          <Switch
            testID="shift-holiday-switch"
            value={isHoliday}
            onValueChange={value => {
              hapticLight();
              setIsHoliday(value);
            }}
            thumbColor={isHoliday ? colors.mintStrong : '#FFFFFF'}
            trackColor={{true: colors.mint, false: colors.border}}
          />
        </View>

        {preview && (
          <View style={styles.previewCard} testID="shift-pay-preview">
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>
                {t('shift_editor.worked_hours')}
              </Text>
              <Text style={styles.previewValue}>
                {(preview.workedMinutes / 60).toFixed(1)}h
              </Text>
            </View>

            {premium.isPremium && preview.nightMinutes > 0 && (
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>
                  {t('shift_editor.night_hours')}
                </Text>
                <Text style={styles.previewValue}>
                  {(preview.nightMinutes / 60).toFixed(1)}h · +¥
                  {preview.nightPremium.toLocaleString()}
                </Text>
              </View>
            )}

            <View style={[styles.previewRow, styles.previewTotal]}>
              <Text style={styles.previewTotalLabel}>
                {t('shift_editor.estimated_pay')}
              </Text>
              <Text style={styles.previewTotalValue}>
                ¥{preview.grossPay.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
        {existing && (
          <Pressable
            testID="shift-delete-button"
            onPress={handleDelete}
            style={styles.deleteBtn}>
            <Text style={styles.deleteText}>🗑</Text>
          </Pressable>
        )}

        <Pressable
          testID="shift-save-button"
          onPress={handleSave}
          disabled={!currentJob}
          style={[styles.saveBtn, !currentJob && styles.disabled]}>
          <Text style={styles.saveText}>{t('shift_editor.save')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.subtle,
  },
  headerIcon: {
    fontSize: 26,
    color: colors.charcoal,
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.charcoal,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 200,
  },
  label: {
    color: colors.mutedText,
    fontSize: 12,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  jobChipRow: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  jobChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexShrink: 0,
  },
  jobChipActive: {
    backgroundColor: colors.charcoal,
    borderColor: colors.charcoal,
  },
  jobChipEmoji: {
    fontSize: 14,
  },
  jobChipText: {
    color: colors.charcoal,
    fontSize: 13,
  },
  jobChipTextActive: {
    color: '#FFFFFF',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  dateArrow: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 24,
    color: colors.charcoal,
  },
  dateValue: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeColumn: {
    flex: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  stepperGroup: {
    alignItems: 'center',
  },
  stepBtn: {
    width: 32,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: {
    fontSize: 18,
    color: colors.charcoal,
  },
  stepValue: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.charcoal,
    marginVertical: 2,
  },
  stepColon: {
    fontSize: 22,
    color: colors.charcoal,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    color: colors.charcoal,
    fontSize: 15,
  },
  memoInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  switchLabel: {
    color: colors.charcoal,
    fontSize: 14,
  },
  previewCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.mint,
    padding: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    color: colors.mutedText,
    fontSize: 13,
  },
  previewValue: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '500',
  },
  previewTotal: {
    marginTop: 4,
  },
  previewTotalLabel: {
    color: colors.charcoal,
    fontWeight: '500',
  },
  previewTotalValue: {
    color: colors.mintStrong,
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.charcoal,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    ...shadows.subtle,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  deleteBtn: {
    width: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 18,
  },
  disabled: {
    opacity: 0.5,
  },
});
