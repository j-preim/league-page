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

    const digestStarter = (starter, points) => {
        if(!starter || starter == 0) {
                return {
                    name: "Empty",
                    avatar: null,
                    poss: null,
                    team: null,
                    opponent: null,
                    projection: 0,
                    points: 0,
                };
            }
            const player = players[starter];
            let name = player.pos == "DEF" ? player.ln : `${player.fn[0]}. ${player.ln}`;
            let projection = 0;
            if(player.wi && player.wi[displayWeek]) {
                projection = parseFloat(player.wi[displayWeek].p);
            }
            return {
                name,
                avatar: player.pos == "DEF" ? `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${starter.toLowerCase()}.png)` : `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`,
                pos: player.pos,
                team: player.t,
                opponent: player.wi && player.wi[displayWeek] ? player.wi[displayWeek].o : null,
                projection,
                points,
            };
    }

    let starters;
    
    $: digestStarters(ix, players, scoreWeek);

    let el;

    $: top = el?.getBoundingClientRect() ? el?.getBoundingClientRect().top  : 0;

    const expandClose = () => {
        if(expandOverride) return;
        active = active == ix ? null : ix;
        setTimeout( () => {
            window.scrollTo({left: 0, top, behavior: 'smooth'});
        }, 200);
        ;
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
        margin: 1.5em 0 2em;
    }

    .standingsTable {
        max-width: 100%;
        overflow-x: scroll;
        margin: 0.5em 0 5em;
    }
</style>

<h1>{year ?? ''} {leagueName} Standings</h1>

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
                    <Cell class="center">Team</Cell>
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
