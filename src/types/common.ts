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

export enum AlternateTimes {
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

export interface Team {
  name: string;
  individualName: string;
  relayName: string;
}

export interface Time {
  min: number;
  sec: number;
  frac: number;
}

// This includes entries + results
export interface Entry {
  rank: number;
  team: string;
  [other: string]: any;
}

export interface EventEntry {
  event: Event;
  entries: Entry[];
}

export interface Meet {
  eventEntries: EventEntry[];
}
