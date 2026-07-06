export type RootStackParamList = {
  index: undefined;
  onboarding: undefined;
  '(tabs)': undefined;
  'shift-editor': {shiftId?: string; date?: string} | undefined;
  'job-editor': {jobId?: string} | undefined;
};

export type MainTabParamList = {
  index: undefined;
  jobs: undefined;
  dashboard: undefined;
  settings: undefined;
};

export type ShiftEditorParams = NonNullable<RootStackParamList['shift-editor']>;
export type JobEditorParams = NonNullable<RootStackParamList['job-editor']>;
