/**
 * Structured Logger for Services
 *
 * Provides consistent, structured logging across all services.
 * In production, outputs JSON for easy parsing by log aggregators.
 * In development, outputs human-readable format.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
    service: string
    method?: string
    [key: string]: unknown
}

interface LogEntry {
    timestamp: string
    level: LogLevel
    message: string
    context: LogContext
    error?: {
        name: string
        message: string
        stack?: string
    }
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
}

const isProduction = process.env.NODE_ENV === 'production'
const minLogLevel = (process.env.LOG_LEVEL as LogLevel) || (isProduction ? 'info' : 'debug')

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[minLogLevel]
}

function formatError(error: unknown): LogEntry['error'] | undefined {
    if (!error) return undefined

    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: isProduction ? undefined : error.stack,
        }
    }

    return {
        name: 'UnknownError',
        message: String(error),
    }
}

function formatLogEntry(level: LogLevel, message: string, context: LogContext, error?: unknown): LogEntry {
    return {
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
        error: formatError(error),
    }
}

function outputLog(entry: LogEntry): void {
    const consoleFn = entry.level === 'error' ? console.error
        : entry.level === 'warn' ? console.warn
        : console.log

    if (isProduction) {
        // JSON output for production (log aggregators)
        consoleFn(JSON.stringify(entry))
    } else {
        // Human-readable output for development
        const contextStr = entry.context.method
            ? `[${entry.context.service}.${entry.context.method}]`
            : `[${entry.context.service}]`

        const extraContext = Object.entries(entry.context)
            .filter(([key]) => key !== 'service' && key !== 'method')
            .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
            .join(' ')

        const prefix = `${entry.timestamp.split('T')[1].split('.')[0]} ${entry.level.toUpperCase().padEnd(5)} ${contextStr}`
        const contextSuffix = extraContext ? ` ${extraContext}` : ''

        consoleFn(`${prefix} ${entry.message}${contextSuffix}`)

        if (entry.error) {
            consoleFn(`  Error: ${entry.error.name}: ${entry.error.message}`)
            if (entry.error.stack) {
                consoleFn(`  Stack: ${entry.error.stack}`)
            }
        }
    }
}

/**
 * Creates a logger instance for a specific service.
 *
 * @example
 * const logger = createLogger('OccurrenceService')
 * logger.info('Processing occurrence', { method: 'create', occurrenceId: 123 })
 * logger.error('Failed to upload attachment', { method: 'addAttachment' }, error)
 */
export function createLogger(service: string) {
    return {
        debug(message: string, context: Omit<LogContext, 'service'> = {}): void {
            if (!shouldLog('debug')) return
            outputLog(formatLogEntry('debug', message, { service, ...context }))
        },

        info(message: string, context: Omit<LogContext, 'service'> = {}): void {
            if (!shouldLog('info')) return
            outputLog(formatLogEntry('info', message, { service, ...context }))
        },

        warn(message: string, context: Omit<LogContext, 'service'> = {}): void {
            if (!shouldLog('warn')) return
            outputLog(formatLogEntry('warn', message, { service, ...context }))
        },

        error(message: string, context: Omit<LogContext, 'service'> = {}, error?: unknown): void {
            if (!shouldLog('error')) return
            outputLog(formatLogEntry('error', message, { service, ...context }, error))
        },
    }
}

export type Logger = ReturnType<typeof createLogger>