import { Time } from "../../src/types/common";
import StringMatcher from "../../src/util/string-matcher";

describe("string-matcher", () => {
    test("parses a valid time", () => {
        const input1 = "31.80";
        const output1: Time = {
            min: 0,
            sec: 31,
            frac: 80
        };

        const input2 = "1:07.45";
        const output2: Time = {
            min: 1,
            sec: 7,
            frac: 45
        };

        expect(StringMatcher.getTime(input1)).toEqual(output1);
        expect(StringMatcher.getTime(input2)).toEqual(output2);
    });
});
