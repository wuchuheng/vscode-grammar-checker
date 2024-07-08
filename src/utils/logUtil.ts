// Define log levels
enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

// Log utility class
export default class LogUtil {
  // Method to log messages with a specific log level
  static log(level: LogLevel, messages: string | string[]): void {
    const time = new Date();
    // Date time format like: 2021-09-01 12:00:00
    const datetimeFormat = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
    const formattedMessages = Array.isArray(messages)
      ? messages.join("\n")
      : messages;
    console.log(`[${datetimeFormat}] [${level}]: ${formattedMessages}`);
  }

  // Convenience methods for each log level
  static debug(messages: string | string[]): void {
    this.log(LogLevel.DEBUG, messages);
  }

  static info(messages: string | string[]): void {
    this.log(LogLevel.INFO, messages);
  }

  static warn(messages: string | string[]): void {
    this.log(LogLevel.WARN, messages);
  }

  static error(messages: string | string[]): void {
    this.log(LogLevel.ERROR, messages);
  }
}
