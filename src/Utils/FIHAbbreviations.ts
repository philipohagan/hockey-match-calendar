import * as fs from "node:fs";
import {ab} from "vitest/dist/chunks/reporters.C_zwCd4j.js";

export class FIHAbbreviations {
    /**
     * The match type abbreviations.
     * @private
     */
    private static MatchTypeAbbreviations: Record<string, string>;

    /**
     * The competition abbreviations.
     * @private
     */
    private static CompetitionAbbreviations: Record<string, string>;

    /**
     * Get the match type by the match type.
     * @param type The match type
     * @param gender The match gender
     * @param index The match index in this competition
     */
    public static getMatchType(type: string, gender: "M" | "W", index: number): string {
        if (!this.MatchTypeAbbreviations) this.getMatchTypeAbbreviations();
        let abbr = type.split(" ").map(v => v.slice(0, 1)).join("").toUpperCase();

        // Look for abbreviation.
        for (let [regex, value] of Object.entries(this.MatchTypeAbbreviations)) {
            const matches = type.match(regex);
            if (!matches) continue;

            // No groups, return value
            if (matches.length > 1) {
                // Replace groups.
                for (let i = 1; i < matches.length; i++) {
                    value = value.replaceAll(`%${i}`, matches[i]);
                }
            }

            abbr = value.replaceAll("%g", gender).replaceAll("%i", `${index}`);
            break;
        }

        // No match found
        abbr = abbr.length === 0 ? "" : `${abbr} `;
        return `${abbr}${gender}${this.padStart(index)}`;
    }

    /**
     * Add leading zeros to a number.
     * @param input The input number.
     * @param padLength The padding length.
     */
    static padStart(input: number, padLength: number = 2) {
        let str = String(input);
        while (str.length < padLength) {
            str = "0" + input;
        }
        return str;
    }

    /**
     * Get the match type by the match name.
     * @param name The match name
     */
    public static getCompetition(name: string): string {
        if (!this.CompetitionAbbreviations) this.getCompetitionAbbreviations();

        // Look for abbreviation.
        for (const [regex, value] of Object.entries(this.CompetitionAbbreviations)) {
            if (name.match(regex)) return value;
        }

        // No match found
        return name.replaceAll(/[^A-Za-z0-9]/g, "").split(" ").map(v => v.slice(0, 1)).join("").toUpperCase();
    }

    /**
     * Get the gender by match type.
     * @param type The match type.
     */
    public static getGender(type: string): "M" | "W" {
        if (type.toLowerCase().includes("womens")) return "W";
        if (type.toLowerCase().includes("mens")) return "M";
        throw new Error("Couldn't fetch gender for " + type);
    }

    /**
     * Get the match type abbreviations.
     */
    public static getMatchTypeAbbreviations() {
        const data = fs.readFileSync("includes/match-type-abbreviations.json", { encoding: "utf-8"});
        this.MatchTypeAbbreviations = JSON.parse(data);
    }

    /**
     * Get the competition abbreviations
     */
    public static getCompetitionAbbreviations() {
        const data = fs.readFileSync("includes/competition-abbreviations.json", { encoding: "utf-8"});
        this.CompetitionAbbreviations = JSON.parse(data);
    }
}