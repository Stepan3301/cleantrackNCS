
export interface HoursRecord {
  [userId: string]: {
    [day: number]: number;
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
