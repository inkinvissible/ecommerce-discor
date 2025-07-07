import pino from 'pino';

// Configuración del logger basada en el entorno
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configuración de transporte para desarrollo (pretty print)
const transport = isDevelopment ? {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'HH:MM:ss Z',
    ignore: 'pid,hostname',
    singleLine: false,
    hideObject: false,
  }
} : undefined;

// Crear el logger principal
const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'ecommerce-discor-api',
  },
});

// Logger específico para diferentes módulos
export const createModuleLogger = (module: string) => {
  return logger.child({ module });
};

// Loggers específicos para diferentes partes de la aplicación
export const serverLogger = createModuleLogger('server');
export const dbLogger = createModuleLogger('database');
export const erpLogger = createModuleLogger('erp-client');
export const jobLogger = createModuleLogger('jobs');
export const authLogger = createModuleLogger('auth');

// Función para loggear requests HTTP
export const logRequest = (req: any, res: any, responseTime?: number) => {
  const logData = {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    statusCode: res.statusCode,
    ...(responseTime && { responseTime: `${responseTime}ms` }),
  };

  if (res.statusCode >= 400) {
    serverLogger.warn(logData, 'HTTP Request');
  } else {
    serverLogger.info(logData, 'HTTP Request');
  }
};

// Función para loggear errores de manera consistente
export const logError = (error: Error, context?: any) => {
  logger.error({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  }, 'Application Error');
};

// Función para loggear operaciones de base de datos
export const logDbOperation = (operation: string, table?: string, duration?: number, error?: Error) => {
  const logData = {
    operation,
    ...(table && { table }),
    ...(duration && { duration: `${duration}ms` }),
  };

  if (error) {
    dbLogger.error({ ...logData, error: error.message }, 'Database Operation Failed');
  } else {
    dbLogger.debug(logData, 'Database Operation');
  }
};

// Función para loggear llamadas a APIs externas
export const logApiCall = (url: string, method: string, statusCode?: number, duration?: number, error?: Error) => {
  const logData = {
    url,
    method,
    ...(statusCode && { statusCode }),
    ...(duration && { duration: `${duration}ms` }),
  };

  if (error) {
    erpLogger.error({ ...logData, error: error.message }, 'External API Call Failed');
  } else if (statusCode && statusCode >= 400) {
    erpLogger.warn(logData, 'External API Call Warning');
  } else {
    erpLogger.info(logData, 'External API Call');
  }
};

// Función para loggear jobs/tareas programadas
export const logJobExecution = (jobName: string, status: 'start' | 'success' | 'error', duration?: number, error?: Error, metadata?: any) => {
  const logData = {
    jobName,
    status,
    ...(duration && { duration: `${duration}ms` }),
    ...metadata,
  };

  switch (status) {
    case 'start':
      jobLogger.info(logData, 'Job Started');
      break;
    case 'success':
      jobLogger.info(logData, 'Job Completed Successfully');
      break;
    case 'error':
      jobLogger.error({ ...logData, error: error?.message }, 'Job Failed');
      break;
  }
};

// Export del logger principal
export default logger;
