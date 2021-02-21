import { Name, Time, Event, Gender, Stroke, AlternateTime } from "../types/common";

const NAME_DECORATORS = /^\*/g;
const NAME_PATTERN = /^([a-zA-Z .'-]+_?[SsBbMm0-9]*)(, *[a-zA-Z .'-]*)?$/g; // This should cover most names and PARA names
const TIME_PATTERN = /^([0-5]?[0-9]:)?[0-5][0-9]\.[0-9][0-9]$/g;
const TIME_DECORATORS = /(^X)|(^J)/g;
const TEAM_PATTERN = /^[A-Za-z]{2,}([A-Za-z]|\s)*$/g; // Team has to start with 2 characters
const RELAY_PATTERN = /(^'[A-Z]'$)|(^[A-Z]$)/g;
const RELAY_DECORATORS = /'/g;
const POSITION_PATTERN = /^[0-9]+$/g;

class StringMatcher {

    public getLastFirstName(input: string): Name {
        const inputName = input.trim().replace(new RegExp(NAME_DECORATORS), "");
        if (inputName.search(new RegExp(NAME_PATTERN)) === -1) return undefined;
        const splitNames = inputName.split(",");
        if (!splitNames || splitNames.length === 0 || splitNames.length > 2) return undefined;
        if (splitNames.length === 1) splitNames[1] = "";

        const lastName = splitNames[0].trim();
        const firstName = splitNames[1].trim();
        return {
            lastName,
            firstName
        };
    }

    public getTeam(input: string): string {
        const trimmed = input.trim();
        if (trimmed.search(new RegExp(TEAM_PATTERN)) === -1) return undefined;

        return trimmed;
    }

    public getTime(input: string): Time | AlternateTime {
        // remove decorators (ex. X for Exhibition)
        const trimmed = input.trim().replace(new RegExp(TIME_DECORATORS), "");

        // Use alternate time as a fallback if no numeric time is found
        const alternateTimes: AlternateTime[] = Object.values(AlternateTime);
        let alternateTime: AlternateTime;
        for (const compare of alternateTimes) {
            if (compare === trimmed) alternateTime = compare;
        }

        const matched = trimmed.search(new RegExp(TIME_PATTERN));
        if (matched === -1) return alternateTime;
        const result: Time = {
            min: 0,
            sec: 0,
            frac: 0
        };
        let currentString = trimmed;
        let currentSplit = currentString.split(":");
        if (currentSplit.length === 1) {
            currentString = currentSplit[0];
        } else {
            result.min = parseInt(currentSplit[0]);
            currentString = currentSplit[1];
        }
        currentSplit = currentString.split(".");
        if (currentSplit.length !== 2) {
            return alternateTime;
        }
        result.sec = parseInt(currentSplit[0]);
        result.frac = parseInt(currentSplit[1]);

        return result;
    }

    // NOTE: This will not work with age group formats
    public getEvent(input: string): Event {
        const eventString = "Event";
        const relayString = "Relay";
        const result: Event = {
            eventNum: undefined,
            gender: undefined,
            distance: undefined,
            stroke: undefined,
            isRelay: undefined
        };

        let index = 0;
        let currentString = input;
        index = currentString.search(eventString);
        if (index === -1) return undefined;

        currentString = currentString.slice(index + eventString.length, currentString.length);
        result.eventNum = parseInt(currentString);
        if (isNaN(result.eventNum)) return undefined;

        Object.values(Gender).forEach((compare: Gender) => {
            const tmpIndex = currentString.search(compare);
            if (tmpIndex !== -1) {
                result.gender = compare;
                index = tmpIndex;
            }
        });

        if (!result.gender) return undefined;
        currentString = currentString.slice(index + result.gender.length, currentString.length);

        result.distance = parseInt(currentString);
        if (isNaN(result.distance)) return undefined;

        Object.values(Stroke).forEach((compare: Stroke) => {
            let tmpIndex = currentString.search(compare);
            if (tmpIndex !== -1) {
                result.stroke = compare;
            }
            if (compare === Stroke.MEDLEY) {
                tmpIndex = currentString.search("IM");
                if (tmpIndex !== -1) {
                    result.stroke = compare;
                }
            }
        });

        if (!result.stroke) return undefined;

        index = currentString.search(relayString);
        if (index !== -1) {
            result.isRelay = true;
        } else {
            result.isRelay = false;
        }
        return result;
    }

    public getRelay(input: string): string {
        if (input.trim().search(new RegExp(RELAY_PATTERN)) === -1) return undefined;
        
        return input.trim().replace(RELAY_DECORATORS, "");
    }

    public getPosition(input: string): number {
        if (input.trim().search(new RegExp(POSITION_PATTERN)) === -1) return undefined;
        const number = parseInt(input.trim());
        if (isNaN(number)) return undefined;
        return number;
    }
}

export default StringMatcher;
