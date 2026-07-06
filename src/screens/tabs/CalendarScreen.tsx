import React, {useEffect, useMemo} from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';

import {colors, radius, shadows, spacing} from '../../theme';
import {useAppStore, useMonthlyShiftLimit} from '../../store/useAppStore';
import {
  calculateMonthlySalarySummary,
  calculateShiftPay,
} from '../../services/salaryCalculator';
import {hapticLight, hapticSelection} from '../../services/haptics';
import {ZenCard} from '../../components/ZenCard';

export default function CalendarScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {t, i18n} = useTranslation();

  const jobs = useAppStore(s => s.jobs);
  const shifts = useAppStore(s => s.shifts);
  const premium = useAppStore(s => s.premium);
  const selectedMonth = useAppStore(s => s.selectedMonth);
  const selectedDate = useAppStore(s => s.selectedDate);
  const setSelectedMonth = useAppStore(s => s.setSelectedMonth);
  const setSelectedDate = useAppStore(s => s.setSelectedDate);
  const monthlyGoal = useAppStore(s => s.monthlyGoal);

  useEffect(() => {
    if (selectedDate && !selectedDate.startsWith(selectedMonth)) {
      setSelectedDate(dayjs(`${selectedMonth}-01`).format('YYYY-MM-DD'));
    }
  }, [selectedMonth, selectedDate, setSelectedDate]);

  const monthStart = dayjs(`${selectedMonth}-01`);
  const daysInMonth = monthStart.daysInMonth();
  const firstDow = monthStart.day();

  const cells: (string | null)[] = [];

  for (let i = 0; i < firstDow; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(monthStart.date(day).format('YYYY-MM-DD'));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const jobMap = useMemo(
    () => new Map(jobs.map(job => [job.id, job])),
    [jobs],
  );

  const summary = useMemo(
    () =>
      calculateMonthlySalarySummary({
        shifts,
        jobs,
        month: selectedMonth,
        isPremium: premium.isPremium,
      }),
    [shifts, jobs, selectedMonth, premium.isPremium],
  );

  const shiftsByDate = useMemo(() => {
    const map = new Map<string, typeof shifts>();

    for (const shift of shifts) {
      if (!shift.date.startsWith(selectedMonth)) {
        continue;
      }

      const list = map.get(shift.date) ?? [];
      list.push(shift);
      map.set(shift.date, list);
    }

    return map;
  }, [shifts, selectedMonth]);

  const selectedDateShifts = selectedDate
    ? shiftsByDate.get(selectedDate) ?? []
    : [];

  const limit = useMonthlyShiftLimit(selectedMonth);

  const goalPct = Math.min(
    100,
    Math.round((summary.totalGross / Math.max(1, monthlyGoal)) * 100),
  );

  const daysShort = t('calendar.days_short', {
    returnObjects: true,
  }) as string[];

  const monthLabel =
    i18n.language === 'ja'
      ? monthStart.format('YYYY年 M月')
      : monthStart.format('MMMM YYYY');

  const prevMonth = () => {
    hapticSelection();
    setSelectedMonth(monthStart.subtract(1, 'month').format('YYYY-MM'));
  };

  const nextMonth = () => {
    hapticSelection();
    setSelectedMonth(monthStart.add(1, 'month').format('YYYY-MM'));
  };

  const openShiftEditor = (dateStr?: string) => {
    hapticLight();

    const date = dateStr ?? selectedDate ?? dayjs().format('YYYY-MM-DD');

    navigation.navigate(
      'ShiftEditor' as never,
      {
        date,
      } as never,
    );
  };

  const openExistingShift = (shiftId: string) => {
    navigation.navigate(
      'ShiftEditor' as never,
      {
        shiftId,
      } as never,
    );
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <ScrollView
        contentContainerStyle={{paddingBottom: 140}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable
              testID="calendar-prev-month"
              onPress={prevMonth}
              style={styles.chevBtn}>
              <Feather name="chevron-left" size={20} color={colors.charcoal} />
            </Pressable>

            <Text testID="calendar-month-label" style={styles.monthLabel}>
              {monthLabel}
            </Text>

            <Pressable
              testID="calendar-next-month"
              onPress={nextMonth}
              style={styles.chevBtn}>
              <Feather name="chevron-right" size={20} color={colors.charcoal} />
            </Pressable>
          </View>

          <ZenCard style={styles.progressCard} testID="calendar-income-card">
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                {t('calendar.monthly_income')}
              </Text>

              <Text testID="calendar-monthly-gross" style={styles.progressAmount}>
                ¥{summary.totalGross.toLocaleString()}
              </Text>
            </View>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, {width: `${goalPct}%`}]} />
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.progressGoal}>
                {t('calendar.goal')} ¥{monthlyGoal.toLocaleString()} · {goalPct}%
              </Text>

              <Text
                testID="calendar-shift-count"
                style={[
                  styles.progressGoal,
                  !limit.canAdd &&
                    !premium.isPremium && {
                      color: colors.danger,
                    },
                ]}>
                {limit.count}/{premium.isPremium ? '∞' : limit.limit}
              </Text>
            </View>
          </ZenCard>
        </View>

        <View style={styles.gridWrap}>
          <View style={styles.dowRow}>
            {daysShort.map((day, index) => (
              <Text
                key={`${day}-${index}`}
                style={[
                  styles.dowCell,
                  (index === 0 || index === 6) && styles.dowWeekend,
                ]}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((cell, index) => {
              if (!cell) {
                return <View key={`empty-${index}`} style={styles.cell} />;
              }

              const dateObj = dayjs(cell);
              const dow = dateObj.day();
              const isToday = cell === dayjs().format('YYYY-MM-DD');
              const isSelected = cell === selectedDate;
              const dayShifts = shiftsByDate.get(cell) ?? [];
              const dots = dayShifts
                .slice(0, 3)
                .map(shift => jobMap.get(shift.jobId)?.color ?? colors.mint);

              return (
                <Pressable
                  key={cell}
                  testID={`calendar-cell-${cell}`}
                  onPress={() => {
                    hapticSelection();
                    setSelectedDate(cell);
                  }}
                  style={[
                    styles.cell,
                    isSelected && styles.cellSelected,
                    isToday && !isSelected && styles.cellToday,
                  ]}>
                  <Text
                    style={[
                      styles.cellDay,
                      dow === 0 && {color: colors.sakuraStrong},
                      dow === 6 && {color: '#64B5F6'},
                      isSelected && {color: '#FFFFFF'},
                    ]}>
                    {dateObj.date()}
                  </Text>

                  <View style={styles.dotsRow}>
                    {dots.map((color, dotIndex) => (
                      <View
                        key={`${color}-${dotIndex}`}
                        style={[
                          styles.dot,
                          {
                            backgroundColor: isSelected ? '#FFFFFF' : color,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.listWrap}>
          <Text style={styles.sectionTitle}>{t('calendar.shifts_today')}</Text>

          {selectedDateShifts.length === 0 ? (
            <ZenCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {t('calendar.no_shifts_selected')}
              </Text>
            </ZenCard>
          ) : (
            <FlatList
              data={selectedDateShifts}
              scrollEnabled={false}
              keyExtractor={item => item.id}
              ItemSeparatorComponent={() => <View style={{height: spacing.md}} />}
              renderItem={({item}) => {
                const job = jobMap.get(item.jobId);
                const pay = calculateShiftPay(item, job, premium.isPremium);
                const start = dayjs(item.startTime).format('HH:mm');
                const end = dayjs(item.endTime).format('HH:mm');

                return (
                  <Pressable
                    testID={`shift-item-${item.id}`}
                    onPress={() => openExistingShift(item.id)}>
                    <ZenCard>
                      <View style={styles.shiftRow}>
                        <View
                          style={[
                            styles.shiftDot,
                            {
                              backgroundColor: job?.color ?? colors.mint,
                            },
                          ]}>
                          <Text style={styles.shiftEmoji}>
                            {job?.emoji ?? '💼'}
                          </Text>
                        </View>

                        <View style={{flex: 1}}>
                          <Text style={styles.shiftName}>{job?.name ?? '—'}</Text>
                          <Text style={styles.shiftTimes}>
                            {start} – {end} ·{' '}
                            {(pay.workedMinutes / 60).toFixed(1)}
                            {t('calendar.hours_short')}
                          </Text>
                        </View>

                        <Text style={styles.shiftPay}>
                          ¥{pay.grossPay.toLocaleString()}
                        </Text>
                      </View>
                    </ZenCard>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </ScrollView>

      <Pressable
        testID="calendar-fab-add"
        onPress={() => openShiftEditor()}
        style={({pressed}) => [
          styles.fab,
          {bottom: 100 + insets.bottom * 0.2},
          pressed && {
            opacity: 0.9,
            transform: [{scale: 0.97}],
          },
        ]}>
        <Feather name="plus" size={26} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {paddingHorizontal: spacing.xl, paddingTop: spacing.md},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  chevBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.subtle,
  },
  monthLabel: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.charcoal,
  },
  progressCard: {marginBottom: spacing.lg},
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressLabel: {color: colors.mutedText, fontSize: 13},
  progressAmount: {
    color: colors.charcoal,
    fontSize: 24,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.mint,
    borderRadius: 999,
    marginVertical: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.mintStrong,
    borderRadius: 999,
  },
  progressGoal: {color: colors.mutedText, fontSize: 12},
  gridWrap: {paddingHorizontal: spacing.lg, marginTop: spacing.sm},
  dowRow: {flexDirection: 'row', marginBottom: spacing.sm},
  dowCell: {
    flex: 1,
    textAlign: 'center',
    color: colors.mutedText,
    fontSize: 12,
  },
  dowWeekend: {color: colors.sakuraStrong},
  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  cellSelected: {backgroundColor: colors.charcoal},
  cellToday: {backgroundColor: colors.mint},
  cellDay: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 3,
    height: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 999,
  },
  listWrap: {paddingHorizontal: spacing.xl, marginTop: spacing.xl},
  sectionTitle: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 14,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  shiftDot: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftEmoji: {fontSize: 20},
  shiftName: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '500',
  },
  shiftTimes: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 2,
  },
  shiftPay: {
    color: colors.charcoal,
    fontSize: 15,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
});