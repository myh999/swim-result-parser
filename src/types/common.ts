export enum Gender {
    MALE = "Men",
    FEMALE = "Women",
    MIXED = "Mixed",
}

export enum Stroke {
    BUTTERFLY = "Butterfly",
    BACKSTROKE = "Backstroke",
    BREASTSTROKE = "Breaststroke",
    FREESTYLE = "Freestyle",
    MEDLEY = "Medley",
}

export enum AlternateTime {
    NO_TIME = "NT",
    DISQUALIFIED = "DQ"
}

export interface Name {
    lastName: string;
    firstName: string;
}

export interface Event {
    eventNum: number;
    gender: Gender;
    distance: number;
    stroke: Stroke;
    isRelay: boolean;
}

export interface TeamMeetInfo {
    teamID: string;
    individualName: string;
    relayName?: string;
}

export interface Time {
    min: number;
    sec: number;
    frac: number;
}

// This includes entries + results
export interface Entry {
    position: number;
    team: string;
    [other: string]: number | string | Time | Name;
}

export interface EventEntry {
    event: Event;
    entries: Entry[];
}

export interface PsychSheet {
    eventEntries: EventEntry[];
}

export interface TeamPoints {
    teamName: string;
    points: number;
}

export interface MeetInfo {
    pointsSystem?: {
        individualPointsSystem: number[];
        relayPointsSystem?: number[];
    };
    teamInfo: TeamMeetInfo[];
}

export interface Meet {
    meetInfo: MeetInfo;
    eventEntries: EventEntry[];
}
