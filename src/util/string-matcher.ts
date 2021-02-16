import { Team, Name, Time, Event, Gender, Stroke, AlternateTime } from "../types/common";
import { Config } from "../types/config";

const NAME_DECORATORS = "\\*";
const TIME_PATTERN = "([0-5][0-9]:)?[0-5][0-9]\\.[0-9][0-9]";
const TIME_DECORATORS = "X";

class StringMatcher {
    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    public getLastFirstName(input: string): Name {
        const splitNames = input.replace(new RegExp(NAME_DECORATORS), "").split(",");
        if (!splitNames || splitNames.length !== 2) return undefined;

        const lastName = splitNames[0].trim();
        const firstName = splitNames[1].trim();
        return {
            lastName,
            firstName
        };
    }

    public getTeam(input: string, isRelay: boolean): Team {
        const trimmed = input.trim();
        for (const team of this.config.teams) {
            if ((isRelay === false && trimmed === team.individualName) || (isRelay === true && trimmed === team.relayName)) {
                return team;
            }
        }

        return undefined;
    }

    public getTime(input: string): Time {
        // remove decorators (ex. X for Exhibition)
        const trimmed = input.replace(new RegExp(TIME_DECORATORS), "");

        const matched = trimmed.match(new RegExp(TIME_PATTERN));
        if (!matched || matched.length === 0) return undefined;
        let min: number;
        let sec: number;
        let frac: number;
        let currentString = trimmed;
        let currentSplit = currentString.split(":");
        if (currentSplit.length === 1) {
            min = 0;
            currentString = currentSplit[0];
        } else {
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

    public getAlternateTime(input: string): AlternateTime {
        const trimmed = input.trim().replace(TIME_DECORATORS, "");
        const alternateTimes: AlternateTime[] = Object.values(AlternateTime);
        for (const compare of alternateTimes) {
            if (compare === trimmed) return compare;
        }
        return undefined;
    }

    // NOTE: This will not work with age group formats
    public getEvent(input: string): Event {
        const eventString = "Event";
        const relayString = "Relay";

        let eventNum: number;
        let gender: Gender;
        let distance: number;
        let stroke: Stroke;
        let isRelay: boolean;

        let index = 0;
        let currentString = input;
        index = currentString.search(eventString);
        if (index === -1) return undefined;

        currentString = currentString.slice(index + eventString.length, currentString.length);
        eventNum = parseInt(currentString);
        if (isNaN(eventNum)) return undefined;

        Object.values(Gender).forEach((compare: Gender) => {
            const tmpIndex = currentString.search(compare);
            if (tmpIndex !== -1) {
                gender = compare;
                index = tmpIndex;
            }
        });

        if (!gender) return undefined;
        currentString = currentString.slice(index + gender.length, currentString.length);

        distance = parseInt(currentString);
        if (isNaN(distance)) return undefined;

        Object.values(Stroke).forEach((compare: Stroke) => {
            let tmpIndex = currentString.search(compare);
            if (tmpIndex !== -1) {
                stroke = compare;
            }
            if (compare === Stroke.MEDLEY) {
                tmpIndex = currentString.search("IM");
                if (tmpIndex !== -1) {
                    stroke = compare;
                }
            }
        });

        if (!stroke) return undefined;

        index = currentString.search(relayString);
        if (index !== -1) {
            isRelay = true;
        } else {
            isRelay = false;
        }

        return {
            eventNum,
            gender,
            distance,
            stroke,
            isRelay
        };
    }
}

export default StringMatcher;
