import React, {useState} from 'react';
import "react-table/react-table.css";
import {useHistory} from 'react-router-dom';
import {Table} from "../../../basicComponents/Table";
import {useGetTeamPositions} from "../../../api/othersClient_v1";
import {changePlayerStatus, deleteMember} from "../../../api/teamMembershipClient_v1";
import Button from "react-bootstrap/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import {useApi} from "../../../hooks/useApi";
import {UpdateStateModal} from "../../../basicComponents/UpdateStateModal";
import {LoadingGif} from "../../../basicComponents/LoadingGif";
import {DataLoadingError} from "../../../basicComponents/DataLoadingError";
import {UnexpectedError} from "../../../basicComponents/UnexpectedError";

export function TeamSquad({status, admin, playersState, fetchActivePlayersState, fetchInactivePlayersState, fetchPlayersPendingState, fetchPlayersDeclinedState}) {
    const api = useApi();

    const [positionsState] = useGetTeamPositions();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [ID, setID] = useState(null);
    const [buttonID, setButtonID] = useState(null);

    const handleUpdatePlayers = async () => {
        const result = await changePlayerStatus(api, ID.id_team, ID.id_user, ID.status);
        if(result) {
            fetchActivePlayersState();
            fetchInactivePlayersState();
            fetchPlayersPendingState();
            fetchPlayersDeclinedState();
        }
    };

    const handleDeletePlayers = async () => {
        const result = await deleteMember(api, ID.id_team, ID.id_user);
        if(result) {
            fetchPlayersDeclinedState();
        }
    };

    let history = useHistory();
    const columns = [
        {
            Header: "Jméno",
            accessor: "name",
            style: {cursor: "pointer"},
            Cell: ({ row }) => (  <div onClick={() => {handleClick(row)}}>{row.name}</div> ),
            filterMethod: (filter, row) =>
                row[filter.id].toLowerCase().startsWith(filter.value.toLowerCase())
        },
        {
            Header: "Pozice",
            accessor: "position",
            Cell: ({row}) => (<span>{row.position}</span>),
            filterMethod: (filter, row) => {
                if (filter.value === 'all') {
                    return true;
                } else {
                    return row[filter.id] === filter.value;
                }
            },

            Filter: ({filter, onChange}) =>
                <select
                    onChange={event => onChange(event.target.value)}
                    style={{width: "100%"}}
                    value={filter ? filter.value : "all"}
                >
                    <option value="all">Vše</option>
                    {positionsState.positions.map((anObjectMapped, index) => (
                        <option key={index} value={anObjectMapped.position}>{anObjectMapped.position}</option>
                    ))}
                </select>
        },
        {

            Header: 'Akce',
            accessor: "id_matchup",
            filterable: false,
            show: !!(admin),
            Cell: row => {
                if (status === "active"){
                    return (
                        <div>
                            <Button variant="link" onClick={ () => {
                                setID({id_team: row.original.id_team, id_user: row.original.id_user, status: "inactive"});
                                handleShow();
                            }}>
                                <FontAwesomeIcon className="removeIcon" icon={Icons.faTrashAlt} size="1x"/>
                            </Button>
                        </div>
                    )
                } else if (status === "inactive") {
                    return (
                        <div>
                            <Button variant="link" onClick={ () => {
                                setID({id_team: row.original.id_team, id_user: row.original.id_user, status: "active"});
                                handleShow();
                            }}>
                                <FontAwesomeIcon className="addIcon" icon={Icons.faPlus} size="1x"/>
                            </Button>
                        </div>
                    )
                } else if (status === "pending") {
                    return (
                        <div>
                            <Button variant="primary" onClick={() => {
                                setID({id_team: row.original.id_team, id_user: row.original.id_user, status: "active"});
                                setButtonID("active");
                                handleShow();
                            }}>
                                Schválit
                            </Button>
                            <Button variant="danger" onClick={ () => {
                                setID({id_team: row.original.id_team, id_user: row.original.id_user, status: "declined"});
                                setButtonID("declined");
                                handleShow();
                            }}>
                                Zamítnout
                            </Button>
                        </div>
                    )
                } else if (status === "declined") {
                    return (
                        <div>
                            <Button variant="link" onClick={() => {
                                setID({id_team: row.original.id_team, id_user: row.original.id_user});
                                setButtonID("remove");
                                handleShow();
                            }}>
                                <FontAwesomeIcon className="removeIcon" icon={Icons.faTrashAlt} size="1x"/>
                            </Button>
                        </div>
                    )
                }

            }
        }
    ];

    function handleClick(row) {
        if (row) {
            history.push("/users/" + row._original.id_user);
        }
    }

    if(playersState.isLoading || positionsState.isLoading) {
        return <LoadingGif />;
    }

    if((!playersState.isLoading && playersState.error) || (!positionsState.isLoading && positionsState.error)) {
        return <DataLoadingError />;
    }
    
    return (
        <div>
            {(  (!playersState.isLoading && !playersState.error) &&
                (!positionsState.isLoading && !positionsState.error)) ?
                <Table className="defaultCursor" columns={columns} data={playersState.players}/>
                : <UnexpectedError/>
            }
            <UpdateStateModal key="players" show={show} handleClose={handleClose}
                              updateFunction={handleUpdatePlayers} deleteFunction={handleDeletePlayers}
                              idItem={ID} status={status} idButton={buttonID}/>
        </div>
    );
}
