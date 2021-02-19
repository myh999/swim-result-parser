import express from "express";
import multer from "multer";
import { resolve } from "path";

import * as meetAnalysisController from "./controllers/meet-analysis";
import * as demoController from "./controllers/demo";

const app = express();
const upload = multer({ dest: "./uploads/" });

app.use(
    express.static(resolve(__dirname, "./public"), { maxAge: 31557600000 })
);

app.post("/analysis/psychsheet", upload.single("psychsheet"), meetAnalysisController.analyzePsychSheet);
app.get("/demo", demoController.getDemo);

export default app;
