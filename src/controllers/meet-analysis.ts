import PDFParser from "../util/pdf-parser";
import MeetManager, { MeetErrors, MissingEventInfo } from "../util/meet-manager";
import { Request, Response } from "express";
import { EventEntry, Gender, Meet, MeetInfo, PsychSheet, TeamPoints } from "../types/common";
import { rmSync } from "fs";

interface MeetAnalysis {
    meet: Meet;
    teamPoints: {
        [gender: string]: TeamPoints;
    }
    errors: MeetErrors;
}

export const analyzePsychSheet = async (req: Request, res: Response): Promise<void> => {
    const pdfFile = req.file;
    const path = pdfFile.path;
    const meetInfo: MeetInfo = req.body.meetInfo;

    const parser = new PDFParser(path);
    const manager = new MeetManager(meetInfo);

    const meetData: PsychSheet = await parser.getText();
    const missingData: MissingEventInfo = manager.getMissingEventEntries(meetData.eventEntries);
    const processedEvents: EventEntry[] = manager.getAccurateTeamNames(meetData.eventEntries);

    const genders: Gender[] = Object.values(Gender);
    const teamPoints = {};
    teamPoints["total"] = manager.calculateTeamPoints(processedEvents);
    for (const gender of genders) {
        const filteredPoints: EventEntry[] = processedEvents.filter((eventEntry: EventEntry) => { return eventEntry.event.gender === gender; });
        teamPoints[gender] = manager.calculateTeamPoints(filteredPoints);
    }

    const errors: MeetErrors = {
        missingEventInfo: missingData,
        unmappedRelayTeams: []
    };

    const analysis: MeetAnalysis = {
        meet: {
            meetInfo: meetInfo,
            eventEntries: processedEvents
        },
        teamPoints,
        errors
    };

    rmSync(path);

    res.send(analysis);
};
