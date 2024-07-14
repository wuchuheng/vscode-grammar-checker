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
    // 2. Processing logic.
    // 2.1 Get the current time
    const time = new Date();
    // Date time format like: 12:00:00
    const padStart = (value: number) => value.toString().padStart(2, "0");
    const datetimeFormat = `${padStart(time.getMonth() + 1)}-${padStart(time.getDate())} ${padStart(time.getHours())}:${padStart(time.getMinutes())}:${padStart(time.getSeconds())}`;
    const formattedMessages = Array.isArray(messages)
      ? messages.join("\n")
      : messages;

    // 2.2 Get the previou file name and line number
    const stack = new Error().stack;
    const stackLines = stack ? stack.split("\n") : [];
    const stackLine = stackLines.length > 3 ? stackLines[3] : "";
    const regexPatter = /\((.*)\)/;
    const pathList = stackLine.match(regexPatter)?.pop() || "";
    const fileName = pathList.split("/").pop();

    // 2.3 Build the log message
    const message = `[${datetimeFormat}][${fileName}][${level}]: ${formattedMessages}`;

    // 3. Print message.
    console.log(message);
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
