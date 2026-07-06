import {DB_KEYS, createId, nowIso, readJSON, writeJSON} from '../db';
import {Shift, ShiftInput} from '../../types';

async function readShifts(): Promise<Shift[]> {
  return readJSON<Shift[]>(DB_KEYS.shifts, []);
}

async function writeShifts(shifts: Shift[]): Promise<void> {
  await writeJSON(DB_KEYS.shifts, shifts);
}

export const shiftsRepository = {
  async getAll(): Promise<Shift[]> {
    const shifts = await readShifts();
    return [...shifts].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare === 0
        ? a.startTime.localeCompare(b.startTime)
        : dateCompare;
    });
  },

  async getById(id: string): Promise<Shift | undefined> {
    const shifts = await readShifts();
    return shifts.find(shift => shift.id === id);
  },

  async getByMonth(month: string): Promise<Shift[]> {
    const shifts = await readShifts();
    return shifts
      .filter(shift => shift.date.startsWith(month))
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.startTime.localeCompare(b.startTime),
      );
  },

  async getByDate(date: string): Promise<Shift[]> {
    const shifts = await readShifts();
    return shifts
      .filter(shift => shift.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  async create(input: ShiftInput): Promise<Shift> {
    const shifts = await readShifts();
    const timestamp = nowIso();
    const shift: Shift = {
      ...input,
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await writeShifts([...shifts, shift]);
    return shift;
  },

  async update(
    id: string,
    input: Partial<ShiftInput>,
  ): Promise<Shift | undefined> {
    const shifts = await readShifts();
    let updatedShift: Shift | undefined;
    const nextShifts = shifts.map(shift => {
      if (shift.id !== id) return shift;
      updatedShift = {
        ...shift,
        ...input,
        updatedAt: nowIso(),
      };
      return updatedShift;
    });

    await writeShifts(nextShifts);
    return updatedShift;
  },

  async delete(id: string): Promise<void> {
    const shifts = await readShifts();
    await writeShifts(shifts.filter(shift => shift.id !== id));
  },

  async deleteByJobId(jobId: string): Promise<void> {
    const shifts = await readShifts();
    await writeShifts(shifts.filter(shift => shift.jobId !== jobId));
  },

  async replaceAll(shifts: Shift[]): Promise<void> {
    await writeShifts(shifts);
  },

  async clear(): Promise<void> {
    await writeShifts([]);
  },
};

export type ShiftsRepository = typeof shiftsRepository;
