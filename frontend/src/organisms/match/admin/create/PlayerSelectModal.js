import React, {useEffect, useState} from 'react';
import { Button, Modal } from 'react-bootstrap';
import { equals } from 'ramda';
import { Heading } from '../../../../basicComponents';
import { Table } from '../../../../basicComponents/Table';

export function PlayerSelectModal({ show, handleClose, players, handleAddPlayers, type }) {
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  useEffect(() => {
      setSelectedPlayers([]);
  },[players]);

    function onCheckEdit(original) {
        if (
            selectedPlayers.map(player => equals(player.id_user, original.id_user)).includes(true)
        ) {
          const filteredArray = selectedPlayers.filter(item =>
            item.id_user !== original.id_user
          );
          setSelectedPlayers(filteredArray);
        } else {
          setSelectedPlayers([...selectedPlayers, original]);
        }
    }

    function onCheckCreate(original) {
        if (
            selectedPlayers.map(player => equals(player.id_user, original.id_user)).includes(true)
        ) {
            const filteredArray = selectedPlayers.filter(item =>
                item.id_user !== original.id_user
            );
            setSelectedPlayers(filteredArray);
        } else {
            setSelectedPlayers([...selectedPlayers, {
                id_user: original.id_user,
                name: original.name,
                goalkeeper: 0
            }]);
        }
    }

  const columns = [
      {
          id: 'checkbox',
          accessor: '',
          filterable: false,
          sortable: false,
          width: 45,
          Cell: ({ original }) => (
              <input
                  type="checkbox"
                  className="checkbox"
                  onChange={() => {
                      if(type === "edit"){
                          onCheckEdit(original)
                      }
                      if(type === "create"){
                          onCheckCreate(original)
                      }
                  }}
                  checked={
                    selectedPlayers
                      .map(player => equals(player.id_user, original.id_user))
                      .includes(true)
                  }
              />
          )
        },
        {
          Header: 'Jméno',
          accessor: 'name',
          filterMethod: (filter, row) => row[filter.id].toLowerCase().startsWith(filter.value.toLowerCase())
        }
  ];

  return (
    <Modal show={show} >
            <Modal.Header>
              <Modal.Title className="modal-title">
                <Heading size="md">Výběr hráčů do sestavy</Heading>
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Table columns={columns} data={players} getTdProps={(state, rowInfo) => {
                  return {
                      onClick: () => {
                          onCheckEdit(rowInfo.original);
                      }
                  }
              }}/>
            </Modal.Body>


            <Modal.Footer>
                <Button variant="secondary mt-0" type="button" block onClick={handleClose}>
                    Zrušit
                </Button>
                <Button variant="primary mt-0" type="button" block onClick={() => {
                    handleClose();
                    handleAddPlayers(selectedPlayers);
                }}>
                    Uložit
                </Button>
            </Modal.Footer>
    </Modal>
  );
}
