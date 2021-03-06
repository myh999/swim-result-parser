import { Name, Time, Event, Gender, Stroke } from "../../src/types/common";
import StringMatcher from "../../src/util/string-matcher";

describe("string-matcher", () => {

    let matcher: StringMatcher;

    beforeAll(() => {
        matcher = new StringMatcher();
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

        const input4 = "XNT";
        const output4 = "NT";

        const input5 = "Papadedes, Dimitri W";
        const output5 = undefined;

        expect(matcher.getTime(input1)).toEqual(output1);
        expect(matcher.getTime(input2)).toEqual(output2);
        expect(matcher.getTime(input3)).toEqual(output3);
        expect(matcher.getTime(input4)).toEqual(output4);
        expect(matcher.getTime(input5)).toEqual(output5);
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

        const input3 = "McCuaig_S9sb9sm9, Cameron";
        const output3: Name = {
            lastName: "McCuaig_S9sb9sm9",
            firstName: "Cameron"
        };

        const input4 = "   *Daniel, Jyasi   ";
        const output4: Name = {
            lastName: "Daniel",
            firstName: "Jyasi"
        };

        const input5 = "Tchervenelekov,";
        const output5: Name = {
            lastName: "Tchervenelekov",
            firstName: ""
        };

        const input6 = "Beaumont Stidwi";
        const output6: Name = {
            lastName: "Beaumont Stidwi",
            firstName: ""
        };

        const input7 = "Chaubet, Gaël";
        const output7: Name = {
            lastName: "Chaubet",
            firstName: "Gaël"
        };

        const input8 = "X1:07.45";
        const output8 = undefined;

        expect(matcher.getLastFirstName(input1)).toEqual(output1);
        expect(matcher.getLastFirstName(input2)).toEqual(output2);
        expect(matcher.getLastFirstName(input3)).toEqual(output3);
        expect(matcher.getLastFirstName(input4)).toEqual(output4);
        expect(matcher.getLastFirstName(input5)).toEqual(output5);
        expect(matcher.getLastFirstName(input6)).toEqual(output6);
        expect(matcher.getLastFirstName(input7)).toEqual(output7);
        expect(matcher.getLastFirstName(input8)).toEqual(output8);
    });

    test("parses a valid team", () => {
        const input1 = "WAT";
        const input2 = "Mustangs";
        const input3 = "McCuaig S9sb9sm9, Cameron";

        expect(matcher.getTeam(input1)).toBeTruthy();
        expect(matcher.getTeam(input2)).toBeTruthy();
        expect(matcher.getTeam(input3)).toBeFalsy();
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

        const input4 = "Event  17 ...(Women 800 SC Meter Freestyle)";
        const output4: Event = {
            eventNum: 17,
            gender: Gender.FEMALE,
            distance: 800,
            stroke: Stroke.FREESTYLE,
            isRelay: false
        };

        const input5 = "McCuaig S9sb9sm9, Cameron";
        const output5 = undefined;

        expect(matcher.getEvent(input1)).toEqual(output1);
        expect(matcher.getEvent(input2)).toEqual(output2);
        expect(matcher.getEvent(input3)).toEqual(output3);
        expect(matcher.getEvent(input4)).toEqual(output4);
        expect(matcher.getEvent(input5)).toEqual(output5);
    });

    test("parses a valid position", () => {
        const input1 = "1";
        const output1 = 1;

        const input2 = "   18   ";
        const output2 = 18;

        const input3 = "asdfsadf";
        const output3 = undefined;

        expect(matcher.getPosition(input1)).toEqual(output1);
        expect(matcher.getPosition(input2)).toEqual(output2);
        expect(matcher.getPosition(input3)).toEqual(output3);
    });

    test("parses a valid relay", () => {
        const input1 = "A";
        const output1 = "A";

        const input2 = "'A'";
        const output2 = "A";

        const input3 = "Warriors";
        const output3 = undefined;

        expect(matcher.getRelay(input1)).toEqual(output1);
        expect(matcher.getRelay(input2)).toEqual(output2);
        expect(matcher.getRelay(input3)).toEqual(output3);
    });
});
