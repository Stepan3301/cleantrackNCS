// Централизованные утилиты для работы с датами
export const dateUtils = {
  // Безопасный парсинг даты из строки в локальном часовом поясе
  parseLocalDate: (dateString: string): Date => {
    if (!dateString || typeof dateString !== 'string') {
      throw new Error('Invalid date string provided');
    }
    
    const parts = dateString.split('-');
    if (parts.length !== 3) {
      throw new Error('Date string must be in YYYY-MM-DD format');
    }
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // месяцы в JS начинаются с 0
    const day = parseInt(parts[2], 10);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error('Invalid date components');
    }
    
    return new Date(year, month, day);
  },

  // Форматирование даты в строку YYYY-MM-DD
  formatToString: (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid Date object provided');
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Безопасное получение дня месяца из строки даты
  getDayFromString: (dateString: string): number => {
    try {
      const date = dateUtils.parseLocalDate(dateString);
      return date.getDate();
    } catch (error) {
      console.error('Error parsing date:', error);
      return 0;
    }
  },

  // Сравнение дат по дню, месяцу и году
  isSameDay: (date1: Date | string, date2: Date | string): boolean => {
    try {
      const d1 = typeof date1 === 'string' ? dateUtils.parseLocalDate(date1) : date1;
      const d2 = typeof date2 === 'string' ? dateUtils.parseLocalDate(date2) : date2;
      
      return d1.getDate() === d2.getDate() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getFullYear() === d2.getFullYear();
    } catch (error) {
      console.error('Error comparing dates:', error);
      return false;
    }
  },

  // Получение текущей даты в формате строки
  getCurrentDateString: (): string => {
    return dateUtils.formatToString(new Date());
  },

  // Добавление дней к дате
  addDays: (dateString: string, days: number): string => {
    const date = dateUtils.parseLocalDate(dateString);
    date.setDate(date.getDate() + days);
    return dateUtils.formatToString(date);
  },

  // Получение начала и конца месяца
  getMonthBounds: (dateString: string): { start: string; end: string } => {
    const date = dateUtils.parseLocalDate(dateString);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return {
      start: dateUtils.formatToString(start),
      end: dateUtils.formatToString(end)
    };
  }
}; 