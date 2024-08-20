import { Competition } from "../../Objects/Competition.js";
import { Match } from "../../Objects/Match.js";
import { Fetcher } from "../Fetcher.js";
import { KNHBCompetitionFetcher } from "./KNHBCompetitionFetcher.js";
import { KNHBMatchFetcher } from "./KNHBMatchFetcher.js";
import { ICSCreator } from "../../Utils/ICSCreator.js";
import { Gender } from "../../Objects/Gender.js";
import { KNHBClub, KNHBClubFetcher } from "./KNHBClubFetcher.js";

export class KNHBFetcher extends Fetcher {
    /**
     * The base URL for the KNHB fetcher.
     */
    public static readonly KNHB_BASE_URL = "https://publicaties.hockeyweerelt.nl/mc";

    /**
     * The id for the KNHB fetcher.
     */
    public static readonly KNHB_FETCHER_ID = "knhb";

    /**
     * The competition fetcher.
     * @private
     */
    private competitionFetcher: KNHBCompetitionFetcher;

    /**
     * The match fetcher.
     * @private
     */
    private matchFetcher: KNHBMatchFetcher;

    /**
     * The club fetcher.
     * @private
     */
    private clubFetcher: KNHBClubFetcher;

    /**
     * Constructor for KNHBFetcher.
     * @param id The id of this fetcher.
     * @param name The name of this fetcher.
     * @param index The index of this fetcher.
     * @param baseURL The base URL of the TMS system.
     */
    constructor(id: string, name: string, index: number, baseURL: string) {
        super(id, name, index, baseURL);

        this.competitionFetcher = new KNHBCompetitionFetcher(this);
        this.matchFetcher = new KNHBMatchFetcher(this);
        this.clubFetcher = new KNHBClubFetcher(this);
    }

    /**
     * @override
     */
    protected async fetch(): Promise<Competition[]> {
        this.log("info", "Fetching competitions.");
        const competitions = await this.fetchCompetitions();
        const promises = [];

        this.log("info", `Found ${competitions.size} competitions.`);
        this.log("info", "Fetching matches and creating competition files.");

        for (const competition of competitions.values()) {
            // Fetch match for every competition
            const result = await this.fetchMatches(competition);
            competition.getMatches().push(...result.values());
            await ICSCreator.createCompetitionICS(competition);
        }

        // Wait for all matches to fetch
        await Promise.all(promises);
        const competitionsArray = Array.from(competitions.values());

        // Create total calendar files.
        await Promise.all([
            ICSCreator.createTotalICS(this, competitionsArray, true),
            ICSCreator.createGenderTotalICS(this, competitionsArray,
                Gender.MEN, true),
            ICSCreator.createGenderTotalICS(this, competitionsArray,
                Gender.WOMEN, true),
        ]);

        this.log("info", "Finished.");
        return competitionsArray;
    }
    /**
     * @override
     */
    async fetchCompetitions(): Promise<Map<string, Competition>> {
        return await this.competitionFetcher.fetch();
    }

    /**
     * @override
     */
    async fetchMatches(competition: Competition): Promise<Map<string, Match>> {
        const clubs = await this.fetchClubs();

        const upcomingMatches =
            await this.matchFetcher.fetch("upcoming", competition, clubs);
        const officialMatches =
            await this.matchFetcher.fetch("official", competition, clubs);

        return new Map([...upcomingMatches, ...officialMatches]);
    }

    /**
     * Fetch the available clubs, mapped by their name.
     */
    async fetchClubs(): Promise<Map<string, KNHBClub>> {
        return await this.clubFetcher.fetch();
    }

    /**
     * @override
     */
    descriptionToAppend(competition: Competition, match: Match,
                        html: boolean): string[] {

        const lines: string[] = [];
        const KNHBUrl: string = "https://www.knhb.nl/match-center#";

        // Add KNHB links
        if (html) {
            if (match.getID())
                lines.push(`<a href="${KNHBUrl}/matches/${
                    match.getID()}">View match details</a>`);
            if (competition.getID())
                lines.push(`<a href="${KNHBUrl}/competitions/${
                    competition.getID()}/program">View competition details</a>`);
        } else {
            if (match.getID())
                lines.push("Match link: " + `${KNHBUrl}/matches/${match.getID()}`);
            if (competition.getID())
                lines.push("Competition link: " + `${KNHBUrl}/competitions/${
                    competition.getID()}/program`);
        }

        return lines;
    }
}