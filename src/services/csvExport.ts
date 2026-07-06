import dayjs from 'dayjs';

import {Job, Shift} from '../types';
import {calculateShiftPay} from './salaryCalculator';

export function buildCSV(shifts: Shift[], jobs: Job[]): string {
  const jobMap = new Map(jobs.map(job => [job.id, job]));
  const header =
    'Date,Job Name,Start Time,End Time,Break Minutes,Hours,Base Pay,Night Premium,Commute Allowance,Gross Pay';

  const rows = shifts
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(shift => {
      const job = jobMap.get(shift.jobId);
      const pay = calculateShiftPay(shift, job, true);
      const hours = (pay.workedMinutes / 60).toFixed(1);
      const start = dayjs(shift.startTime).format('HH:mm');
      const end = dayjs(shift.endTime).format('HH:mm');
      const name = (job?.name ?? '').replace(/,/g, ' ');

      return [
        shift.date,
        name,
        start,
        end,
        shift.breakMinutes,
        hours,
        pay.basePay,
        pay.nightPremium,
        pay.commute,
        pay.grossPay,
      ].join(',');
    })
    .join('\n');

  return `${header}\n${rows}`;
}

export async function exportCSVToFile(
  shifts: Shift[],
  jobs: Job[],
): Promise<string> {
  return buildCSV(shifts, jobs);
}
