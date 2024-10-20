
<script>
	import LinearProgress from '@smui/linear-progress';
	import ScoreWeeks from './ScoreWeeks.svelte';
	import Brackets from './Brackets.svelte';
    import Button, { Group, Label } from '@smui/button';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { loadPlayers } from '$lib/utils/helper';

	export let queryWeek, leagueTeamManagersData, scoresData, bracketsData, playersData;

    let players, scoreWeeks, year, week, regularSeasonLength, brackets, leagueTeamManagers;

    let loading = true;

    onMount(async () => {
        brackets = await bracketsData;
        const scoresInfo = await scoresData;
        leagueTeamManagers = await leagueTeamManagersData;
        scoreWeeks = scoresInfo.scoreWeeks;
        year = scoresInfo.year;
        week = scoresInfo.week;
        regularSeasonLength = scoresInfo.regularSeasonLength;
        const playersInfo = await playersData;
        players = playersInfo.players;
        loading = false;

        if(playersInfo.stale) {
            const newPlayersInfo = await loadPlayers(null, true);
            players = newPlayersInfo.players;
        }
    });

    const changeSelection = (s) => {
        if(s == 'regular') {
            queryWeek = 1;
            goto(`/scores?week=1`, {noscroll: true});
        } else if(selection == 'regular') {
            queryWeek = 99;
            goto(`/scores?week=99`, {noscroll: true});
        }
        selection = s;
    }

    let selection = 'regular';
</script>

<style>
    .message {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }

    .buttonHolder {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 3em 0;
    }
</style>



{#if loading}
    <!-- promise is pending -->
    <div class="message">
        <p>Loading league scores...</p>
        <LinearProgress indeterminate />
    </div>
{:else}
    {#if scoreWeeks.length}
        {#if selection == 'regular'}
            <ScoreWeeks {players} {queryWeek} {scoreWeeks} {regularSeasonLength} {year} {week} bind:selection={selection} {leagueTeamManagers} />
        {/if}
    {:else}
        <div class="message">
            <p>No upcoming scores...</p>
        </div>
    {/if}
{/if}