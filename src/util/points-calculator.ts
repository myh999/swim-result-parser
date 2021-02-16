import { EventEntry, TeamPoints } from "../types/common";

const DEFAULT_INDIVIDUAL_POINTS = [0, 20, 17, 16, 15, 14, 13, 12, 11, 9, 7, 6, 5, 4, 3, 2, 1];
const DEFAULT_RELAY_POINTS = [0, 40, 34, 32, 30, 28, 26, 24, 22, 18, 14, 12, 10, 8, 6, 4, 2];

interface PointsMap {
    [team: string]: number;
}

class PointsCalculator {
    private individualPointsSystem: number[];
    private relayPointsSystem: number[];

    constructor(individualPointsSystem = DEFAULT_INDIVIDUAL_POINTS, relayPointsSystem = DEFAULT_RELAY_POINTS) {
        this.individualPointsSystem = individualPointsSystem;
        this.relayPointsSystem = relayPointsSystem;
    }

    public calculateTeamPoints(eventEntries: EventEntry[]): TeamPoints[] {
        const teamPoints: TeamPoints[] = [];
        const points: PointsMap = {};
        for (const eventEntry of eventEntries) {
            for (const entry of eventEntry.entries) {
                if (!points[entry.team]) {
                    points[entry.team] = 0;
                }
                const pointsSystem: number[] = eventEntry.event.isRelay ? this.relayPointsSystem : this.individualPointsSystem;
                points[entry.team] += pointsSystem[entry.rank] ? pointsSystem[entry.rank] : 0;
            }
        }
        for (const [key, value] of Object.entries(points)) {
            teamPoints.push({
                teamName: key,
                points: value
            });
        }
        return teamPoints;
    }
}

export default PointsCalculator;
