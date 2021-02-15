export enum Gender {
  MALE = "Men",
  FEMALE = "Women",
  MIXED = "Mixed"
}

export enum Stroke {
    FREESTYLE = "Freestyle",
    BACKSTROKE = "Backstroke",
    BREASTSTROKE = "Breaststroke",
    FREESTYPE = "Freestyle"
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
