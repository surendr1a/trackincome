import {DB_KEYS, createId, nowIso, readJSON, writeJSON} from '../db';
import {Job, JobInput} from '../../types';

async function readJobs(): Promise<Job[]> {
  return readJSON<Job[]>(DB_KEYS.jobs, []);
}

async function writeJobs(jobs: Job[]): Promise<void> {
  await writeJSON(DB_KEYS.jobs, jobs);
}

export const jobsRepository = {
  async getAll(): Promise<Job[]> {
    const jobs = await readJobs();
    return [...jobs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async getById(id: string): Promise<Job | undefined> {
    const jobs = await readJobs();
    return jobs.find(job => job.id === id);
  },

  async create(input: JobInput): Promise<Job> {
    const jobs = await readJobs();
    const timestamp = nowIso();
    const job: Job = {
      ...input,
      id: createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await writeJobs([...jobs, job]);
    return job;
  },

  async update(id: string, input: Partial<JobInput>): Promise<Job | undefined> {
    const jobs = await readJobs();
    let updatedJob: Job | undefined;
    const nextJobs = jobs.map(job => {
      if (job.id !== id) return job;
      updatedJob = {
        ...job,
        ...input,
        updatedAt: nowIso(),
      };
      return updatedJob;
    });

    await writeJobs(nextJobs);
    return updatedJob;
  },

  async delete(id: string): Promise<void> {
    const jobs = await readJobs();
    await writeJobs(jobs.filter(job => job.id !== id));
  },

  async replaceAll(jobs: Job[]): Promise<void> {
    await writeJobs(jobs);
  },

  async clear(): Promise<void> {
    await writeJobs([]);
  },
};

export type JobsRepository = typeof jobsRepository;
