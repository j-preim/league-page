import { getLeagueData } from "./leagueData"
import { leagueID } from '$lib/utils/leagueInfo';
import { getNflState } from "./nflState"
import { waitForAll } from './multiPromise';
import { get } from 'svelte/store';
import {scoresStore} from '$lib/stores';

export const getLeagueScores = async () => {
	if(get(scoresStore).scoreWeeks) {
		return get(scoresStore);
	}

	const [nflState, leagueData] = await waitForAll(
		getNflState(),
		getLeagueData(),
	).catch((err) => { console.error(err); });

	let week = 1;
	if(nflState.season_type == 'regular') {
		week = nflState.display_week;
	} else if(nflState.season_type == 'post') {
		week = 18;
	}
	const year = leagueData.season;
	const regularSeasonLength = leagueData.settings.playoff_week_start - 1;

	// pull in all score data for the season
	const scoresPromises = [];
	for(let i = 1; i < leagueData.settings.playoff_week_start; i++) {
		scoresPromises.push(fetch(`https://api.sleeper.app/v1/league/${leagueID}/matchups/${i}`, {compress: true}))
	}
	const scoresRes = await waitForAll(...scoresPromises);

	// convert the json score responses
	const scoresJsonPromises = [];
	for(const scoresRes of scoresRes) {
		const data = scoresRes.json();
		scoresJsonPromises.push(data)
		if (!scoresRes.ok) {
			throw new Error(data);
		}
	}
	const scoresData = await waitForAll(...scoresJsonPromises).catch((err) => { console.error(err); }).catch((err) => { console.error(err); });

	const scoreWeeks = [];
	// process all the scores
	for(let i = 1; i < scoresData.length + 1; i++) {
		const processed = processScores(scoresData[i - 1], i);
		if(processed) {
			scoreWeeks.push({
				scores: processed.scores,
				week: processed.week
			});
		}
	}

	const scoresResponse = {
		scoreWeeks,
		year,
		week,
		regularSeasonLength
	}
	
	scoresStore.update(() => scoresResponse);

	return scoresResponse;
}

const processScores = (inputScores, week) => {
	if(!inputScores || inputScores.length == 0) {
		return false;
	}
	const scores = {};
	for(const score of inputScores) {
		if(!scores[score.matchup_id]) {
			scores[score.matchup_id] = [];
		}
		scores[score.matchup_id].push({
			roster_id: score.roster_id,
			starters: score.starters,
			points: score.starters_points,
		})
	}
	return {scores, week};
}
