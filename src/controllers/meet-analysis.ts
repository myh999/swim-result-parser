import PDFParser from "../util/pdf-parser";
import MeetManager, { MeetErrors, MissingEventInfo } from "../util/meet-manager";
import { Request, Response } from "express";
import { EventEntry, Gender, Meet, MeetInfo, PsychSheet, TeamPoints } from "../types/common";
import { rmSync } from "fs";
import LiveResultsParser from "../util/live-results-parser";

interface MeetAnalysis {
    meet: Meet;
    teamPoints: {
        [gender: string]: TeamPoints;
    }
    errors: MeetErrors;
}

const analyzeEventEntries = (eventEntries: EventEntry[], meetInfo: MeetInfo): MeetAnalysis => {
    const manager = new MeetManager(meetInfo);

    const missingData: MissingEventInfo = manager.getMissingEventEntries(eventEntries);
    const processedEvents: EventEntry[] = manager.getAccurateTeamNames(eventEntries);

    const genders: Gender[] = Object.values(Gender);
    const teamPoints = {};
    teamPoints["total"] = manager.calculateTeamPoints(processedEvents);
    for (const gender of genders) {
        const filteredPoints: EventEntry[] = processedEvents.filter((eventEntry: EventEntry) => { return eventEntry.event.gender === gender; });
        const pointsCalculation: TeamPoints[] = manager.calculateTeamPoints(filteredPoints);
        if (pointsCalculation && pointsCalculation.length > 0) teamPoints[gender] = manager.calculateTeamPoints(filteredPoints);
    }

    const errors: MeetErrors = {
        missingEventInfo: missingData,
        unmappedRelayTeams: []
    };

    return {
        meet: {
            meetInfo: meetInfo,
            eventEntries: processedEvents
        },
        teamPoints,
        errors
    };
};

export const analyzePsychSheet = async (req: Request, res: Response): Promise<void> => {
    try {
        const pdfFile = req.file;
        const path = pdfFile.path;
        const meetInfo: MeetInfo = req.body.meetInfo ? JSON.parse(req.body.meetInfo) : undefined;

        const parser = new PDFParser(path);

        const meetData: PsychSheet = await parser.getText();

        const analysis: MeetAnalysis = analyzeEventEntries(meetData.eventEntries, meetInfo);

        rmSync(path);

        res.send(analysis);
    } catch (err) {
        res.status(500);
        console.error(err);
        res.send(err);
    }
};

export const analyzeLiveResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const url: string = req.body.baseUrl;
        const events: number[] = req.body.events.map((numString: string) => parseInt(numString));
        const meetInfo: MeetInfo = req.body.meetInfo ? JSON.parse(req.body.meetInfo) : undefined;

        const parser = new LiveResultsParser();
        const meetData: EventEntry[] = await parser.parseBaseUrl(url, events);
        const analysis: MeetAnalysis = analyzeEventEntries(meetData, meetInfo);

        res.send(analysis);
    } catch (err) {
        res.status(500);
        console.error(err);
        res.send(err);
    }
};
