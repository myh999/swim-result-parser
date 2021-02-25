import { resolve } from "path";

import {Request, Response} from "express";

export const getPsychSheetDemo = (req: Request, res: Response): void => {
    res.sendFile(resolve(__dirname, "../public/demo/psych-sheet.html"));
};

export const getDemo = (req: Request, res: Response): void => {
    res.sendFile(resolve(__dirname, "../public/demo/demo.html"));
};
