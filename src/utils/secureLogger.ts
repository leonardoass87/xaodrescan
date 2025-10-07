/**
 * Logger seguro que só exibe logs em ambiente de desenvolvimento
 * Para evitar exposição de dados sensíveis em produção
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const secureLog = {
  /**
   * Log normal - apenas em desenvolvimento
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log de erro - sempre exibido (mas sem dados sensíveis)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log de aviso - sempre exibido
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Log de informação - apenas em desenvolvimento
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log de debug - apenas em desenvolvimento
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

/**
 * Sanitiza dados sensíveis antes de logar
 * Remove senhas, tokens, etc.
 */
export const sanitizeData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveKeys = ['senha', 'password', 'token', 'secret', 'auth', 'authorization'];
  const sanitized = { ...data };

  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }

  return sanitized;
};

