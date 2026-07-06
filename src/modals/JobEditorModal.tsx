import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

import {colors, JOB_COLORS, JOB_EMOJIS, radius, shadows, spacing} from '../theme';
import {useAppStore} from '../store/useAppStore';
import {hapticLight, hapticSelection, hapticSuccess} from '../services/haptics';

type JobEditorRouteParams = {
  JobEditor: {
    jobId?: string;
  };
};

type JobEditorRouteProp = RouteProp<JobEditorRouteParams, 'JobEditor'>;

export default function JobEditorModal(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<JobEditorRouteProp>();
  const {t} = useTranslation();

  const jobId = route.params?.jobId;

  const jobs = useAppStore(s => s.jobs);
  const addJob = useAppStore(s => s.addJob);
  const updateJob = useAppStore(s => s.updateJob);
  const deleteJob = useAppStore(s => s.deleteJob);
  const showToast = useAppStore(s => s.showToast);

  const existing = jobId ? jobs.find(j => j.id === jobId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '💼');
  const [color, setColor] = useState(existing?.color ?? JOB_COLORS[0]);
  const [hourlyRate, setHourlyRate] = useState(
    String(existing?.hourlyRate ?? 1200),
  );
  const [commute, setCommute] = useState(
    String(existing?.commuteAllowance ?? 0),
  );
  const [payday, setPayday] = useState(String(existing?.paydayDay ?? 25));
  const [weekendMul, setWeekendMul] = useState(
    String(existing?.weekendMultiplier ?? 1.0),
  );
  const [holidayMul, setHolidayMul] = useState(
    String(existing?.holidayMultiplier ?? 1.25),
  );
  const [nightOn, setNightOn] = useState(
    existing?.nightShiftEnabled ?? true,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const goBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast(t('common.error'), 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      emoji,
      color,
      hourlyRate: parseInt(hourlyRate || '0', 10) || 0,
      commuteAllowance: parseInt(commute || '0', 10) || 0,
      paydayDay: Math.min(
        31,
        Math.max(1, parseInt(payday || '25', 10) || 25),
      ),
      weekendMultiplier: parseFloat(weekendMul || '1') || 1,
      holidayMultiplier: parseFloat(holidayMul || '1') || 1,
      nightShiftEnabled: nightOn,
    };

    if (existing) {
      await updateJob(existing.id, payload);
      hapticSuccess();
      showToast(t('common.save'), 'success');
      goBack();
      return;
    }

    const res = await addJob(payload);

    if (res.ok) {
      hapticSuccess();
      showToast(t('common.save'), 'success');
      goBack();
    }
  };

  const handleDelete = async () => {
    if (!existing) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    await deleteJob(existing.id);
    hapticLight();
    goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: colors.background}}>
      <View style={[styles.header, {paddingTop: insets.top + spacing.md}]}>
        <Pressable
          testID="job-editor-close"
          onPress={goBack}
          style={styles.headerBtn}>
          <Feather name="x" size={22} color={colors.charcoal} />
        </Pressable>

        <Text style={styles.headerTitle}>
          {existing ? t('job_editor.edit_title') : t('job_editor.new_title')}
        </Text>

        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={{padding: spacing.xl, paddingBottom: 200}}>
        <View style={styles.preview}>
          <View style={[styles.previewCircle, {backgroundColor: `${color}33`}]}>
            <Text style={styles.previewEmoji}>{emoji}</Text>
          </View>

          <Text style={styles.previewName}>
            {name || t('job_editor.name_placeholder')}
          </Text>
        </View>

        <Text style={styles.label}>{t('job_editor.emoji')}</Text>
        <View style={styles.pickerRow}>
          {JOB_EMOJIS.map(item => (
            <Pressable
              key={item}
              testID={`job-emoji-${item}`}
              onPress={() => {
                hapticSelection();
                setEmoji(item);
              }}
              style={[styles.emojiBtn, emoji === item && styles.emojiBtnActive]}>
              <Text style={styles.emojiText}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>{t('job_editor.color')}</Text>
        <View style={styles.pickerRow}>
          {JOB_COLORS.map(item => (
            <Pressable
              key={item}
              testID={`job-color-${item}`}
              onPress={() => {
                hapticSelection();
                setColor(item);
              }}
              style={[
                styles.colorBtn,
                {backgroundColor: item},
                color === item && styles.colorBtnActive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.label}>{t('job_editor.name')}</Text>
        <TextInput
          testID="job-name-input"
          value={name}
          onChangeText={setName}
          placeholder={t('job_editor.name_placeholder')}
          placeholderTextColor={colors.mutedText}
          style={styles.input}
        />

        <Text style={styles.label}>{t('job_editor.hourly_rate')}</Text>
        <TextInput
          testID="job-rate-input"
          value={hourlyRate}
          onChangeText={setHourlyRate}
          keyboardType="number-pad"
          style={styles.input}
          placeholderTextColor={colors.mutedText}
        />

        <Text style={styles.label}>{t('job_editor.commute_allowance')}</Text>
        <TextInput
          testID="job-commute-input"
          value={commute}
          onChangeText={setCommute}
          keyboardType="number-pad"
          style={styles.input}
          placeholderTextColor={colors.mutedText}
        />

        <Text style={styles.label}>{t('job_editor.payday_day')}</Text>
        <TextInput
          testID="job-payday-input"
          value={payday}
          onChangeText={setPayday}
          keyboardType="number-pad"
          style={styles.input}
          placeholderTextColor={colors.mutedText}
        />

        <View style={{flexDirection: 'row', gap: spacing.md}}>
          <View style={{flex: 1}}>
            <Text style={styles.label}>{t('job_editor.weekend_multiplier')}</Text>
            <TextInput
              testID="job-weekend-input"
              value={weekendMul}
              onChangeText={setWeekendMul}
              keyboardType="decimal-pad"
              style={styles.input}
              placeholderTextColor={colors.mutedText}
            />
          </View>

          <View style={{flex: 1}}>
            <Text style={styles.label}>{t('job_editor.holiday_multiplier')}</Text>
            <TextInput
              testID="job-holiday-input"
              value={holidayMul}
              onChangeText={setHolidayMul}
              keyboardType="decimal-pad"
              style={styles.input}
              placeholderTextColor={colors.mutedText}
            />
          </View>
        </View>

        <View style={[styles.switchRow, nightOn && {backgroundColor: colors.mint}]}>
          <View style={{flex: 1, paddingRight: spacing.md}}>
            <Text style={styles.switchLabel}>
              {t('job_editor.night_shift_enabled')}
            </Text>
          </View>

          <Switch
            testID="job-night-switch"
            value={nightOn}
            onValueChange={value => {
              hapticLight();
              setNightOn(value);
            }}
            thumbColor={nightOn ? colors.mintStrong : '#FFFFFF'}
            trackColor={{true: colors.mintStrong, false: colors.border}}
          />
        </View>

        {existing ? (
          <View style={styles.dangerZone}>
            <Pressable
              testID="job-delete-button"
              onPress={handleDelete}
              style={styles.deleteRow}>
              <Feather name="trash-2" size={18} color={colors.danger} />

              <View style={{flex: 1}}>
                <Text style={styles.deleteTitle}>
                  {confirmDelete
                    ? t('job_editor.delete_confirm_title')
                    : t('job_editor.delete')}
                </Text>

                {confirmDelete ? (
                  <Text style={styles.deleteBody}>
                    {t('job_editor.delete_confirm_body')}
                  </Text>
                ) : null}
              </View>

              <Text style={styles.deleteAction}>
                {confirmDelete ? t('job_editor.confirm_delete') : ''}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
        <Pressable
          testID="job-save-button"
          onPress={handleSave}
          style={styles.saveBtn}>
          <Text style={styles.saveText}>{t('job_editor.save')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: {fontSize: 17, fontWeight: '500', color: colors.charcoal},
  preview: {alignItems: 'center', marginBottom: spacing.md},
  previewCircle: {
    width: 84,
    height: 84,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  previewEmoji: {fontSize: 36},
  previewName: {color: colors.charcoal, fontSize: 18, fontWeight: '500'},
  label: {
    color: colors.mutedText,
    fontSize: 12,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  pickerRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emojiBtnActive: {
    borderColor: colors.charcoal,
    backgroundColor: colors.background,
  },
  emojiText: {fontSize: 20},
  colorBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorBtnActive: {borderColor: colors.charcoal},
  input: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    color: colors.charcoal,
    fontSize: 15,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  switchLabel: {color: colors.charcoal, fontSize: 14},
  dangerZone: {marginTop: spacing.xl},
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  deleteTitle: {color: colors.danger, fontSize: 14, fontWeight: '500'},
  deleteBody: {color: colors.charcoal, fontSize: 12, marginTop: 2},
  deleteAction: {color: colors.danger, fontSize: 13, fontWeight: '500'},
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  saveBtn: {
    backgroundColor: colors.charcoal,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    ...shadows.subtle,
  },
  saveText: {color: '#FFFFFF', fontSize: 15, fontWeight: '500'},
});