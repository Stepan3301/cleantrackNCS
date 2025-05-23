/// <reference types="vite/client" />

interface Window {
  supabase?: any;
  workingHoursService?: any;
  debugWorkingHours?: {
    insert: (userId: string) => Promise<any>;
    test: () => Promise<boolean>;
    directInsert: (date?: string) => Promise<{data?: any, error?: any}>;
  };
  debugAuth?: {
    getUserId: () => Promise<string | null>;
  };
}
