import {Competition} from "../Objects/Competition.js";
import {Match} from "../Objects/Match.js";

export abstract class Fetcher {
    /**
     * The base URL for this fetcher.
     * @protected
     */
    protected baseURL: string;

    /**
     * The name of this fetcher.
     * @protected
     */
    protected name: string;

    /**
     * The base URL for this fetcher.
     * @param name The name of this fetcher.
     * @param baseURL The base URL.
     */
    protected constructor(name: string, baseURL: string) {
        this.name = name;
        this.baseURL = baseURL;
    }

    /**
     * Get the base URL for this fetcher.
     */
    public getBaseURL(): string {
        return this.baseURL;
    }

    /**
     * Get the name of this fetcher.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Run this fetcher.
     */
    public abstract fetch(): Promise<Competition[]>;

    /**
     * Fetch the competitions and map them by their ID.
     */
    protected abstract fetchCompetitions(): Promise<Map<string, Competition>>;

    /**
     * Fetch the matches by a competition.
     * @param competition The competition.
     */
    protected abstract fetchMatches(competition: Competition): Promise<Map<string, Match>>;

    /**
     * Specifies what description to append to each match event when this fetcher is used.
     * @param competition The competition object.
     * @param match The match object.
     * @param html Whether to add HTML.
     */
    public abstract descriptionToAppend(competition: Competition, match: Match, html: boolean): string[];
}