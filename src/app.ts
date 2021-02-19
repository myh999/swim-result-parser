import express from "express";
import multer from "multer";

import * as meetAnalysisController from "./controllers/meet-analysis";

const app = express();
const upload = multer({ dest: "./uploads/" });

app.post("/analysis/psychsheet", upload.single("psychsheet"), meetAnalysisController.analyzePsychSheet);

export default app;
