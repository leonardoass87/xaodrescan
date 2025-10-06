import { useState, useCallback } from 'react';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationData = {
      id,
      ...notification,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Métodos de conveniência
  const success = useCallback((title: string, message: string, duration?: number) => {
    return addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const error = useCallback((title: string, message: string, duration?: number) => {
    return addNotification({ type: 'error', title, message, duration });
  }, [addNotification]);

  const warning = useCallback((title: string, message: string, duration?: number) => {
    return addNotification({ type: 'warning', title, message, duration });
  }, [addNotification]);

  const info = useCallback((title: string, message: string, duration?: number) => {
    return addNotification({ type: 'info', title, message, duration });
  }, [addNotification]);

  // Métodos específicos para confirmação de email
  const emailSent = useCallback((email: string) => {
    return addNotification({ 
      type: 'success', 
      title: '📧 Email Enviado!', 
      message: `Email de confirmação enviado para ${email}. Verifique sua caixa de entrada.`,
      duration: 8000
    });
  }, [addNotification]);

  const emailConfirmed = useCallback(() => {
    return addNotification({ 
      type: 'success', 
      title: '✅ Email Confirmado!', 
      message: 'Sua conta foi ativada com sucesso! Agora você pode acessar todas as funcionalidades.',
      duration: 10000
    });
  }, [addNotification]);

  const emailExpired = useCallback(() => {
    return addNotification({ 
      type: 'warning', 
      title: '⏰ Token Expirado', 
      message: 'O link de confirmação expirou. Solicite um novo email de confirmação.',
      duration: 8000
    });
  }, [addNotification]);

  const emailResent = useCallback((email: string) => {
    return addNotification({ 
      type: 'info', 
      title: '🔄 Email Reenviado', 
      message: `Novo email de confirmação enviado para ${email}.`,
      duration: 6000
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    // Métodos específicos para email
    emailSent,
    emailConfirmed,
    emailExpired,
    emailResent,
  };
};
