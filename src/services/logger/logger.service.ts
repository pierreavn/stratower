/**
 * Logger service
 */
export class LoggerService {
    static info(...data: unknown[]): void {
        console.log(new Date().toISOString(), `[INFO]`, ...data);
    }

    static warn(...data: unknown[]): void {
        console.warn(new Date().toISOString(), `[WARN]`, ...data);
    }

    static error(...data: unknown[]): void {
        console.error(new Date().toISOString(), `[ERROR]`, ...data);
    }
}
