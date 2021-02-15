import { Team, Name, Time } from "../types/common";
import { Config } from "../types/config";

const TIME_PATTERN = "([0-5][0-9]:)?[0-5][0-9]\\.[0-9][0-9]";

class StringMatcher {
    static getLastFirstName(input: string): Name {
        const nameString = input.trim();
        const splitNames = nameString.split(",");
        if (splitNames.length !== 2) return undefined;

        const lastName = splitNames[0].trim();
        const firstName = splitNames[1].trim();
        return {
            lastName,
            firstName
        };
    }

    static getTeam(input: string, config: Config): Team {
        const trimmed = input.trim();
        config.teams.forEach((team: Team) => {
            if (trimmed === team.individualName || trimmed === team.relayName) {
                return team;
            }
        });

        return undefined;
    }

    static getTime(input: string): Time {
        const trimmed = input.trim();
        const matched = trimmed.match(new RegExp(TIME_PATTERN));
        if (matched.length === 0) return undefined;
        let min: number;
        let sec: number;
        let frac: number;
        let currentString = trimmed;
        let currentSplit = currentString.split(":");
        if (currentSplit.length === 1) {
            min = 0;
            currentString = currentSplit[0];
        } else {
            console.log(currentSplit);
            min = parseInt(currentSplit[0]);
            currentString = currentSplit[1];
        }
        currentSplit = currentString.split(".");
        if (currentSplit.length !== 2) {
            return undefined;
        }
        sec = parseInt(currentSplit[0]);
        frac = parseInt(currentSplit[1]);

        return {
            min,
            sec,
            frac
        };
    }
}

export default StringMatcher;
