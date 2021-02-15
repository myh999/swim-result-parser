import { Name, Team, Time, Event, Gender, Stroke } from "../../src/types/common";
import StringMatcher from "../../src/util/string-matcher";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("string-matcher", () => {

  let matcher: StringMatcher;

  beforeAll(() => {
    const rawConfig = readFileSync(resolve(__dirname, "../../data/config0.json"));
    const config = JSON.parse(rawConfig.toString());
    matcher = new StringMatcher(config);
  });

  test("parses a valid time", () => {
    const input1 = "31.80";
    const output1: Time = {
      min: 0,
      sec: 31,
      frac: 80,
    };

    const input2 = "   1:07.45   ";
    const output2: Time = {
      min: 1,
      sec: 7,
      frac: 45,
    };

    const input3 = "X1:07.45";
    const output3: Time = {
      min: 1,
      sec: 7,
      frac: 45,
    };

    const input4 = "Papadedes, Dimitri W";
    const output4 = undefined;

    expect(matcher.getTime(input1)).toEqual(output1);
    expect(matcher.getTime(input2)).toEqual(output2);
    expect(matcher.getTime(input3)).toEqual(output3);
    expect(matcher.getTime(input4)).toEqual(output4);
  });

  test("parses a valid name", () => {
    const input1 = "Papadedes, Dimitri W";
    const output1: Name = {
      lastName: "Papadedes",
      firstName: "Dimitri W",
    };

    const input2 = "   Miller-Junk, Devon    ";
    const output2: Name = {
      lastName: "Miller-Junk",
      firstName: "Devon",
    };

    const input3 = "McCuaig S9sb9sm9, Cameron";
    const output3: Name = {
      lastName: "McCuaig S9sb9sm9",
      firstName: "Cameron"
    };

    const input4 = "   *Daniel, Jyasi   ";
    const output4: Name = {
      lastName: "Daniel",
      firstName: "Jyasi"
    };

    const input5 = "X1:07.45";
    const output5 = undefined;

    expect(matcher.getLastFirstName(input1)).toEqual(output1);
    expect(matcher.getLastFirstName(input2)).toEqual(output2);
    expect(matcher.getLastFirstName(input3)).toEqual(output3);
    expect(matcher.getLastFirstName(input4)).toEqual(output4);
    expect(matcher.getLastFirstName(input5)).toEqual(output5);
  });

  test("parses a valid team", () => {
    const input1 = "WAT";
    const output1: Team = {
      name: "Waterloo Warriors",
      individualName: "WAT",
      relayName: "Warriors"
    };

    const input2 = "Mustangs";
    const output2: Team = {
      name: "Western Mustangs",
      individualName: "WES",
      relayName: "Mustangs"
    };

    const input3 = "McCuaig S9sb9sm9, Cameron";
    const output3 = undefined;

    expect(matcher.getTeam(input1, false)).toEqual(output1);
    expect(matcher.getTeam(input2, true)).toEqual(output2);
    expect(matcher.getTeam(input3, true)).toEqual(output3);
  });

  test("parses a valid event", () => {
    const input1 = "Event  26   Men 200 SC Meter Butterfly";
    const output1: Event = {
      eventNum: 26,
      gender: Gender.MALE,
      distance: 200,
      stroke: Stroke.BUTTERFLY,
      isRelay: false
    };

    const input2 = "Event  19   Women 200 SC Meter Medley Relay";
    const output2: Event = {
      eventNum: 19,
      gender: Gender.FEMALE,
      distance: 200,
      stroke: Stroke.MEDLEY,
      isRelay: true
    };

    const input3 = "Event  21   Women 200 SC Meter IM";
    const output3: Event = {
      eventNum: 21,
      gender: Gender.FEMALE,
      distance: 200,
      stroke: Stroke.MEDLEY,
      isRelay: false
    };

    const input4 = "McCuaig S9sb9sm9, Cameron";
    const output4 = undefined;

    expect(matcher.getEvent(input1)).toEqual(output1);
    expect(matcher.getEvent(input2)).toEqual(output2);
    expect(matcher.getEvent(input3)).toEqual(output3);
    expect(matcher.getEvent(input4)).toEqual(output4);
  });
});
