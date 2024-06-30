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
    const timestamp = new Date().toISOString();
    const formattedMessages = Array.isArray(messages)
      ? messages.join("\n")
      : messages;
    console.log(`[${timestamp}] [${level}]: ${formattedMessages}`);
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
