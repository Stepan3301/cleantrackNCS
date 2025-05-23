export interface HourEntry {
  hours: number;
  location: string;
  description?: string;
  submittedBy?: string;
  submittedOn?: string;
}

export interface StaffHoursMap {
  [userId: string]: {
    [day: string]: number | HourEntry;
  };
}

export interface LegacyHoursRecord {
  [userId: string]: {
    [day: string]: number;
  };
}

export interface HoursRecord {
  [userId: string]: {
    [day: string]: HourEntry;
  };
}

export interface DetailedHoursRecord {
  [day: number]: HourEntry;
}

export interface HoursNotification {
  day: number;
  staffId: string;
  supervisorId: string;
  staffHours: number;
  supervisorHours: number;
}

export interface HoursData {
  staffHours: StaffHoursMap;
  supervisorHours: StaffHoursMap;
  notifications: HoursNotification[];
}

export interface EmployeeHoursRecord {
  hours: number;
  date: string;
}

export interface EmployeeHoursData {
  records: EmployeeHoursRecord[];
  totalHours: number;
  targetHours: number;
}
