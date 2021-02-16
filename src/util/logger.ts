import { appendFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const LOG_BASE = "log/";

class Logger {
    path: string;

    constructor(path: string) {
        this.path = resolve(LOG_BASE, path);
        writeFileSync(this.path, "");
    }

    public log(message: string): void {
        appendFileSync(this.path, message + "\n");
    }

    public static clearLog(path: string) {
        const resolvedPath = resolve(LOG_BASE, path);
        writeFileSync(resolvedPath, "");
    }

    public static log(message: string, path: string) {
        const resolvedPath = resolve(LOG_BASE, path);
        appendFileSync(resolvedPath, message + "\n");
    }
}

export default Logger;
