import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

const LOG_BASE = "log/";

class Logger {
    path: string;
    enabled: string;

    constructor(path: string, extension = "log") {
        this.path = resolve(LOG_BASE, `${path}-${new Date().toISOString().replace(/[\/\\:]/g, "_")}.${extension}`);
        const basePath = resolve(LOG_BASE);
        if (!existsSync(basePath)) {
            mkdirSync(basePath);
        }
        writeFileSync(this.path, "");
    }

    public log(message: string): void {
        appendFileSync(this.path, message + "\n");
    }
}

export default Logger;
