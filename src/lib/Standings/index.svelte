<script>
    import { leagueName, round } from '$lib/utils/helper';
	import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
  	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import LinearProgress from '@smui/linear-progress';
    import { onMount } from 'svelte';
    import Standing from './Standing.svelte';

    export let standingsData, leagueTeamManagersData, score, players, ix, displayWeek, scoreWeek, scoreYear;

    let pointsTotal = 0;

    const digestStarters = (x, p) => {
        manager = getTeamFromTeamManagers(leagueTeamManagers, roster_id, year);
        const starters = scoreWeek ? starters[scoreWeek] : starters;
        const points = scoreWeek ? points[scoreWeek] : points;

        pointsTotal = 0;
        projectionTotal = 0;

        const localStarters = [];
        for(let i = 0; i < starters.length; i++) {
            pointsTotal += points[i];
            const home = digestStarter(starters[i], points[i]);
            projectionTotal += projection;
            localStarters.push({home});
        }
        // starters = localStarters;
    }

    // Least important to most important (i.e. the most important [usually wins] goes last)
    // Edit this to match your leagues settings
    const sortOrder = ["budget", "fpts"];

    // Column order from left to right
    const columnOrder = [{name: "Total Points", field: "fpts"}, {name: "Budget", field: "budget"}, {name: "Chopped", field: "chopped"}]

    let loading = true;
    let preseason = false;
    let standings, year, leagueTeamManagers;
    onMount(async () => {
        const asyncStandingsData = await standingsData;
        if(!asyncStandingsData) {
            loading = false;
            preseason = true;
            return;
        }
        const {standingsInfo, yearData} = asyncStandingsData;
        leagueTeamManagers = await leagueTeamManagersData;
        year = yearData;

        let finalStandings = Object.keys(standingsInfo).map((key) => standingsInfo[key]);

        for(const sortType of sortOrder) {
            if(!finalStandings[0][sortType] && finalStandings[0][sortType] != 0) {
                continue;
            }
            finalStandings = [...finalStandings].sort((a,b) => b[sortType] - a[sortType]);
        }

        standings = finalStandings;
        loading = false;
    })

    let innerWidth;

</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }

    :global(.left) {
        text-align: left;
    }

    :global(.center) {
        text-align: center;
    }

    :global(.wrappable) {
        white-space: normal;
        line-height: 1.2em;
    }

    h1 {
        font-size: 2.2em;
        line-height: 1.3em;
        margin: 1.5em 0 1.5em;
    }

    .standingsTable {
        max-width: 100%;
        overflow-x: scroll;
        margin: 0.5em 0 5em;
    }
</style>

<h1>{year ?? ''} Live Standings</h1>

{#if loading}
    <!-- promise is pending -->
    <div class="loading">
        <p>Loading Standings...</p>
        <LinearProgress indeterminate />
    </div>
{:else if preseason}
<div class="loading">
    <p>Preseason, No Standings Yet</p>
</div>
{:else}
    <div class="standingsTable">
        <DataTable table$aria-label="League Standings" >
            <Head> <!-- Team name  -->
                <Row>
                    <Cell class="center"></Cell>
                    <Cell class="left">Team</Cell>
                    {#each columnOrder as column}
                        <Cell class="center wrappable">{column.name}</Cell>
                    {/each}
                </Row>
            </Head>
            <Body>
                <!-- 	Standing	 -->
                {#each standings as standing}
                <!-- {#if !standing.chopped} -->
                    <Standing {columnOrder} {standing} {leagueTeamManagers} team={getTeamFromTeamManagers(leagueTeamManagers, standing.rosterID)} />
                <!-- {/if} -->
                {/each}
            </Body>
        </DataTable>
    </div>
{/if}
