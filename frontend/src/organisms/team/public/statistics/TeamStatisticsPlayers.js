import React from 'react';
import {useParams} from "react-router-dom";
import {useGetTeamStatistics} from "../../../../api/teamClient_v1";
import {Table} from "../../../../basicComponents/Table";
import {OverlayTriggerTable} from "../../../../basicComponents/OverlayTriggerTable";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import {useHistory} from 'react-router-dom';
import {LoadingGif} from "../../../../basicComponents/LoadingGif";
import {DataLoadingError} from "../../../../basicComponents/DataLoadingError";
import {UnexpectedError} from "../../../../basicComponents/UnexpectedError";

function getPlayers(state, filterBy) {
    let competitionId = null;

    if (!state.isLoading) {
        if (filterBy === 'league') {
            return state.team.competitions_aggregate.filter(p => !p.is_goalkeeper);
        }

        if (filterBy !== 'training') {
            competitionId = parseInt(filterBy);
        }

        return state.team.individual.filter(p => !p.is_goalkeeper && p.id_competition === competitionId);
    }
}

function getRank(playerData) {
    return (Number(playerData.index) + 1).toString();
}

export function TeamStatisticsPlayers({filterBy}) {
    let {id_team} = useParams();
    let history = useHistory();
    const [state] = useGetTeamStatistics(id_team);

    const players = getPlayers(state, filterBy);
    if (players) {
        players.sort((a, b) => b.field_points - a.field_points);
    }

    function handleClick(row) {
        if (row) {
            history.push("/users/" + row.original.id_user);
        }
    }

    const columns = [
        {
            Header: "Pořadí",
            accessor: "rank",
            Cell: (playerData) => getRank(playerData),
            filterable: false,
        },
        {
            Header: "Jméno a příjmení",
            accessor: "name_surname",
            filterMethod: (filter, row) =>
                row[filter.id].toLowerCase().match(filter.value.toLowerCase())
        },
        {
            Header: "Počet zápasů",
            accessor: filterBy === "league" ? "matches" : "field_matches",
            filterable: false,
        },
        {
            Header: "Góly",
            accessor: filterBy === "league" ? "goals" : "field_goals",
            filterable: false,
        },
        {
            Header: "Asistence",
            accessor: filterBy === "league" ? "assists" : "field_assists",
            filterable: false,
        },
        {
            Header: <OverlayTriggerTable header="KB" placement="bottom" icon={Icons.faInfo} message="Součet gólů a asistencí" />,
            filterable: false,
            accessor: "field_points"
        },
        {
            Header: <OverlayTriggerTable header="Pr. KB" placement="bottom" icon={Icons.faInfo} message="Průměr Kanadského bodu na zápas" />,
            accessor: "field_average_points",
            filterable: false,
        },
        {
            Header: "Trestné minuty",
            accessor: filterBy === "league" ? "suspensions" : "field_suspensions",
            filterable: false,
        }
    ];

    if(state.isLoading) {
        return <LoadingGif />;
    }

    if(!state.isLoading && state.error) {
        return <DataLoadingError />;
    }

    return (
        <div>
            {(!state.isLoading && !state.error) ?
                <Table data={players} columns={columns} getTdProps={(state, rowInfo) => {
                        return {
                            onClick: () => {
                                handleClick(rowInfo);
                            }
                        }
                    }}
                />
                : <UnexpectedError/>
            }
        </div>
    );
}

