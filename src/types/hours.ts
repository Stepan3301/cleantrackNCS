
export interface HoursRecord {
  [userId: string]: {
    [day: string]: number;
  };
}

export interface HoursNotification {
  day: number;
  staffId: string;
  supervisorId: string;
  staffHours: number;
  supervisorHours: number;
}

export interface HoursData {
  staffHours: HoursRecord;
  supervisorHours: HoursRecord;
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
