import { helloworld } from "../src";

describe("how to test", () => {
    test("that is returns helloworld", () => {
        expect(helloworld()).toBe("hello world");
    });
});
