<script>
	import { Icon } from '@smui/tab';
    import Score from './Score.svelte'
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    export let queryWeek, players, scoreWeeks, year, week, regularSeasonLength, selection, leagueTeamManagers;

    let displayWeek = queryWeek * 1 || 1;

    onMount(() => {
        if(!queryWeek || queryWeek < 1) {
            queryWeek = week;
            displayWeek = queryWeek * 1;
            goto(`/scores?week=${queryWeek}`, {noscroll: true});
            if(queryWeek > regularSeasonLength) {
                selection = 'champions';
                return;
            }
            processDisplayScore(queryWeek)
            return;
        }
        if(queryWeek > regularSeasonLength) {
            selection = 'champions';
            return;
        }
        processDisplayScore(displayWeek)
    })

    let scoreArray = [];

    // rand is used as a hacky way to make sure that the each block re-renders when the scoreArray changes
    // the new arrays are too similar to the old ones for Svelte to pick up the difference
    let rand;

    const processDisplayScore = (newWeek) => {
        const score = scoreWeeks[newWeek-1];
        const allScores = score.scores;
        scoreArray = [];
        for (const key in allScores) {
            scoreArray.push(allScores[key]);
        }
        rand = Math.random();
    }

    let active;
    
    const changeWeek = (newWeek) => {
        displayWeek = newWeek;
        processDisplayScore(displayWeek);
        active = null;
        goto(`/scores?week=${displayWeek}`, {noscroll: true});
    }
</script>

<style>
    .scores {
        margin: 2em 0 6em;
    }
    .weekContainer {
        display: flex;
        width: 95%;
        max-width: 600px;
        margin: 0 auto;
        align-items: center;
    }

    :global(.changeWeek) {
        font-size: 3em;
        cursor: pointer;
        color: #888;
    }

    :global(.changeWeek:hover) {
        color: #00316b;
    }

    .spacer {
        width: 48px;
    }

    .weekText {
        flex-grow: 1;
        text-align: center;
        font-size: 2em;
    }

    @media (max-width: 800px) {
        .weekText {
            font-size: 1.6em;
        }
    }

    @media (max-width: 400px) {
        .weekText {
            font-size: 1.3em;
        }
    }

    @media (max-width: 350px) {
        .weekText {
            font-size: 1.2em;
        }
    }
</style>

<div class="scores">
    <div class="weekContainer">
        {#if displayWeek > 1}
            <Icon class="material-icons changeWeek" on:click={() => changeWeek(displayWeek - 1)}>chevron_left</Icon>
        {:else}
            <span class="spacer" />
        {/if}
        <h3 class="weekText">{year} Week {displayWeek} Scores</h3>
        {#if displayWeek < scoreWeeks.length}
            <Icon class="material-icons changeWeek" on:click={() => changeWeek(displayWeek + 1)}>chevron_right</Icon>
        {:else}
            <span class="spacer" />
        {/if}
    </div>
    {#each scoreArray as score, ix (rand * (ix + 1))}
        <Score {ix} {score} {players} {displayWeek} bind:active={active} {leagueTeamManagers} />
    {/each}
</div>