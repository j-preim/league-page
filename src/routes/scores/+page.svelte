<script>
	import { ScoresAndBrackets } from '$lib/components';

	export let data;
	const {queryWeek, scoresData, bracketsData, playersData, leagueTeamManagersData} = data;
</script>

<style>
    #main {
        position: relative;
        z-index: 1;
    }
</style>

<div id="main">
    <ScoresAndBrackets {queryWeek} {scoresData} {bracketsData} {playersData} {leagueTeamManagersData} />
</div>