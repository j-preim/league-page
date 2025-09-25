<script>
	import { round } from '$lib/utils/helper';
	import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';

	export let score = [];
	export let players = {};
	export let active;
	export let ix;
	export let displayWeek;
	export let expandOverride = false;
	export let scoreWeek;
	export let leagueTeamManagers = [];
	export let year;

	let teams = [];

	const digestTeams = () => {
		teams = score.map((team) => {
			const starters = scoreWeek ? team.starters?.[scoreWeek] : team.starters;
			const pointsArr = scoreWeek ? team.points?.[scoreWeek] : team.points;
			const manager = getTeamFromTeamManagers(leagueTeamManagers, team.roster_id, year);

			let totalPoints = 0;
			let totalProjection = 0;
			const starterDetails = [];

			if (starters && starters.length) {
				for (let i = 0; i < starters.length; i++) {
					const starterID = starters[i];
					const pts = pointsArr?.[i] || 0;
					totalPoints += pts;

					const starterInfo = digestStarter(starterID, pts);
					totalProjection += starterInfo.projection;
					starterDetails.push(starterInfo);
				}
			}

			return {
				manager,
				points: round(totalPoints),
				projection: round(totalProjection),
				starters: starterDetails,
			};
		});

        // ✅ Sort teams by points or projection
        teams.sort((a, b) => {
            const aVal = a.points > 0 ? a.points : a.projection;
            const bVal = b.points > 0 ? b.points : b.projection;
            return bVal - aVal;
        });
	};

	const digestStarter = (starter, points) => {
		if (!starter || starter === 0) {
			return {
				name: "Empty",
				avatar: null,
				pos: null,
				team: null,
				opponent: null,
				projection: 0,
				points: 0,
			};
		}
		const player = players[starter];
		let name = player.pos === "DEF"
			? player.ln
			: `${player.fn[0]}. ${player.ln}`;
		let projection = 0;
		if (player.wi && player.wi[displayWeek]) {
			projection = parseFloat(player.wi[displayWeek].p);
		}
		return {
			name,
			avatar:
				player.pos === "DEF"
					? `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${starter.toLowerCase()}.png)`
					: `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${starter}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`,
			pos: player.pos,
			team: player.t,
			opponent: player.wi?.[displayWeek]?.o || null,
			projection,
			points,
		};
	};

	let el;
	let innerWidth;

	$: top = el?.getBoundingClientRect()?.top || 0;
	$: digestTeams();

	const expandClose = () => {
		if (expandOverride) return;
		active = active === ix ? null : ix;
		setTimeout(() => {
			window.scrollTo({ left: 0, top, behavior: 'smooth' });
		}, 200);
	};

	const calcHeight = () => {
		let multiplier = 73;
		if (innerWidth < 500) multiplier = 72;
		if (innerWidth < 410) multiplier = 71;
		const count = teams?.[0]?.starters?.length || 0;
		return count * multiplier + 37;
	};
</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    .score {
        width: 60%;
        max-width: 600px;
        margin: 0px auto;
    }

    .header {
        display: flex;
        justify-content: space-between;
        position: relative;
        opacity: 0.8;
        cursor: pointer;
		transition: opacity 0.5s;
        overflow: hidden;
        flex-wrap: wrap;
    }

    .header:hover {
        opacity: 1;
    }

    .opponent {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 5px 2%;
        top: 0;
        z-index: 2;
        border: 2px solid #bbb;
        border-radius: 10px;
        margin: 10px;
    }

    .divider {
        position: absolute;
        z-index: 3;
        transform: translateX(-50%);
        top: 0;
        left: 50%;
        height: 100%;
        width: 15px;
    }

    .home {
        justify-content: flex-start;
        left: 0;
        text-align: left;
        background-color: #485566;
    }

    :global(.homeGlow) {
        box-shadow: 0 0 6px 4px #3279cf;
        background-color: #00316b !important;
    }

    .away {
        justify-content: flex-start;
        left: 0;
        text-align: left;
        background-color: #8b6969;
    }

    :global(.awayGlow) {
        box-shadow: 0 0 6px 4px #d15454;
        background-color: #920505 !important;
    }

    .name {
        margin: 0 5px;
        font-size: 1em;
        line-height: 1.1em;
        flex-grow: 1;
        word-break: break-word;
        color: #fff;
        font-style: normal;
    }

	.avatar {
		vertical-align: middle;
		border-radius: 50%;
		height: 35px;
		width: 35px;
		margin: 0;
		border: 0.25px solid #777;
        background-color: #eee;
	}

	.playerAvatar {
        position: relative;
		vertical-align: middle;
		height: 45px;
		width: 45px;
		background-position: center;
		background-repeat: no-repeat;
		background-size: auto 45px;
	}
	.pos {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
        max-width: 32px;
        min-width: 32px;
		height: 32px;
	}

	.QB {
		background-color: var(--QB);
	}

	.WR {
		background-color: var(--WR);
	}

	.RB {
		background-color: var(--RB);
	}

	.TE {
		background-color: var(--TE);
	}

	.FLEX {
		background: linear-gradient(to right, var(--WR), var(--WR) 33.33%, var(--RB) 33.33%, var(--RB) 66.66%, var(--TE) 66.66%);
	}

	.WRRB {
		background: linear-gradient(to right, var(--WR), var(--WR) 50%, var(--RB) 50%);
	}

    .rosters {
        position: relative;
        background-color: var(--fff);
        border-radius: 8px;
        overflow: hidden;
        border-left: 1px solid #bbb;
        border-right: 1px solid #bbb;
        border-bottom: 1px solid #bbb;
		transition: max-height 0.4s;
    }

    .line {
        position: relative;
        display: flex;
        justify-content: space-between;
        border-top: 1px solid #bbb;
    }

    .player {
        position: relative;
        width: 46%;
    }

    .iconAndTeam {
        display: flex;
        align-items: center;
    }

    .iconAndTeamHome {
        justify-content: flex-start;
    }

    .iconAndTeamAway {
        justify-content: flex-start;
    }

    .playerHome {
        padding: 0 1.5% 0 2.5%;
        text-align: left;
    }

    .playerAway {
        padding: 0 1.5% 0 2.5%;
        text-align: left;
    }

    .playerInfo {
        display: inline-block;
        padding: 0 6px;
    }

    .playerTeam {
        display: inline-block;
        color: #888;
        font-style: italic;
        text-align: center;
        font-size: 0.5em;
    }

    .playerName {
        word-break: break-word;
    }

    .playerNameHome {
        text-align: left;
    }

    .playerNameAway {
        text-align: left;
    }

    @media (max-width: 500px) {
        .name {
            font-size: 0.8em;
        }
        .totalPoints {
            font-size: 0.8em;
        }
        .nameHolder {
            font-size: 0.8em;
        }
        .points {
            font-size: 0.9em;
        }
    }

    @media (max-width: 410px) {
        .name {
            font-size: 0.7em;
        }
        .totalPoints {
            font-size: 0.7em;
        }
        .nameHolder {
            font-size: 0.7em;
        }
        .points {
            font-size: 0.75em;
        }
    }

    @media (max-width: 360px) {
        .name {
            font-size: 0.5em;
        }
        .totalPoints {
            font-size: 0.5em;
        }
    }

    .dividerLine {
        display: block;
        position: absolute;
        top: 0;
        left: 50%;
        height: 100%;
        width: 0;
        border-left: 1px solid var(--eee);
        z-index: 1;
    }

    .close {
        display: block;
        width: 100%;
        background-color: var(--eee);
        text-align: center;
        cursor: pointer;
        z-index: 2;
        font-size: 1.1em;
        padding: 6px 0;
    }

    .close:hover {
        background-color: var(--ddd);
    }

    .nameHolder {
        display: block;
    }

    .nameHolderR {
        justify-content: flex-end;
        text-align: right;
    }

    .nameHolderL {
        justify-content: flex-start;
        text-align: left;
    }

    .totalPoints {
        line-height: 1.1em;
        color: #fff;
        padding-top: .1em;
        margin-right: 0.1em;
        text-align: right;
    }

    /* .totalPointsR {
        margin-right: 0.1em;
        text-align: right;
    }

    .totalPointsL {
        margin-left: 0.1em;
        text-align: left;
    } */

    .totalProjection {
        color: #ccc;
        font-size: 0.7em;
        font-style: italic;
        margin-right: .1em;
        margin-top: .2em;
    }

    .points {
        position: absolute;
        line-height: 1.1em;
        top: 1em;
    }

    .pointsL {
        left: 1em;
    }

    .pointsR {
        right: 1em;
    }

    .playerEmpty {
        height: 100%;
        color: #555;
        font-style: italic;
        display: flex;
        align-items: center;
    }
    .teamLogo {
        width: 21px;
        position: absolute;
        top: 0;
        right: -16px;
    }
    .teamHomeLogo {
        right: -16px;
    }
    .teamAwayLogo {
        right: -16px;
    }
    @media (max-width: 340px) {
        .teamLogo {
            width: 20px;
            right: -7px;
        }
        .teamHomeLogo {
            right: -7px;
        }
        .teamAwayLogo {
            left: -7px;
        }
    }
</style>

<div class="score">
	<div class="header" on:click={() => expandClose()} bind:this={el}>
		{#each teams as team}
			<div class="opponent">
				{#if team.manager.avatar}
					<img class="avatar" src={team.manager.avatar} alt="team avatar" />
				{/if}
				<div class="name">{team.manager.name}</div>
				<div class="totalPoints totalPointsR">
					{round(team.points)}
					{#if team.projection}
						<div class="totalProjection">{round(team.projection)}</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<div
		class="rosters"
		style="max-height: {active === ix ? `${calcHeight()}px` : '0'}"
	>
		{#each teams as team}
			<div class="team-block">
				<h4 class="team-block-header">{team.manager.name}</h4>
				{#each team.starters as player}
					<div class="line">
						<div class="player">
							<span class="iconAndTeam">
								{#if player.pos}
									<span class="pos {player.pos}">{player.pos}</span>
								{/if}
								{#if player.avatar}
									<div class="playerAvatar playerInfo" style="{player.avatar}">
										{#if player.team && player.pos !== 'DEF'}
											<img
												class="teamLogo"
												src="https://sleepercdn.com/images/team_logos/nfl/{player.team.toLowerCase()}.png"
												alt="team logo"
											/>
										{/if}
									</div>
								{/if}
                                </span>
							<div class="nameHolder nameHolderL">
								<span class="playerInfo playerName">{player.name}</span>
								{#if player.team}
									<div class="playerTeam">
										{player.pos !== 'DEF' ? player.team + ' ' : ''}
										{player.opponent ? `vs ${player.opponent}` : ''}
									</div>
								{/if}
							</div>

								<span class="points pointsR">{player.points}<div class="totalProjection">
								{#if player.projection}
									({player.projection})
								{/if}
                                </div></span>
						</div>
					</div>
				{/each}
			</div>
		{/each}

		{#if !expandOverride}
			<div class="close" on:click={() => expandClose()}>Close Matchup</div>
		{/if}
	</div>
</div>