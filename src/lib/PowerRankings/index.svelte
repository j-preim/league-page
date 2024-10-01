<script>
    import {getNflState, getLeagueMatchups, getLeagueRosters, getLeagueTeamManagers, waitForAll, loadPlayers, getLeagueData} from '$lib/utils/helper';
    import PowerRankingsDisplay from './PowerRankingsDisplay.svelte';
    import LinearProgress from '@smui/linear-progress';
    
    const helperPromises = waitForAll(
        getNflState(),
        getLeagueMatchups(),
        getLeagueRosters(),
        getLeagueTeamManagers(),
        getLeagueData(),
        loadPlayers(null),
    );

</script>

<style>
    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }
</style>

{#await helperPromises}
    <!-- promise is pending -->
    <div class="loading">
        <p>Calculating current scores...</p>
        <LinearProgress indeterminate />
    </div>
{:then [nflState, rostersData, leagueTeamManagers, leagueData, playersInfo]}
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
                <Standing {columnOrder} {standing} {leagueTeamManagers} team={getTeamFromTeamManagers(leagueTeamManagers, standing.rosterID)} />
            {/each}
        </Body>
    </DataTable>
</div>
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}



