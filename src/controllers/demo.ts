import { resolve } from "path";

import {Request, Response} from "express";

export const getDemo = (req: Request, res: Response): void => {
    res.sendFile(resolve(__dirname, "../public/demo.html"));
};
