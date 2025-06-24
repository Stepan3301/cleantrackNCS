import React, { useState, useEffect, ReactNode } from 'react';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import { User } from '@/contexts/auth-context';

interface AdaptiveLayoutProps {
  children: ReactNode;
  user: User;
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({ children, user }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsLoading(false);
    };

    // Проверяем при загрузке
    checkMobile();

    // Добавляем слушатель изменения размера окна
    const debouncedResize = debounce(checkMobile, 150);
    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  // Показываем загрузку пока определяем тип устройства
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Рендерим соответствующий layout
  return isMobile ? (
    <MobileLayout user={user}>{children}</MobileLayout>
  ) : (
    <DesktopLayout user={user}>{children}</DesktopLayout>
  );
};

// Утилита debounce для оптимизации
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 