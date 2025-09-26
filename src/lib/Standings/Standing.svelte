<script>
    import { gotoManager } from '$lib/utils/helper';
  	import { Row, Cell } from '@smui/data-table';

    export let columnOrder, team, standing;
</script>

<style>
	.teamAvatar {
		vertical-align: middle;
		border-radius: 50%;
		height: 40px;
		margin-right: 15px;
		border: 0.25px solid #777;
	}

    :global(.contrastRow) {
        background-color: var(--f8f8f8);
    }

    .team {
        text-align: left;
    }

</style>

<Row class="contrastRow">
    <Cell class=''>
        <div class="team">
            <img alt="team avatar" class="teamAvatar" src="{team.avatar}" />
        </div>
    </Cell>
    <Cell class="">
        <div class="team">
            {team.name}
        </div>
    </Cell>
    {#each columnOrder as column}
        <Cell class="center">{standing[column.field]}</Cell>
    {/each}
</Row>