import {useApi} from "../hooks/useApi";
import {useEffect, useState} from "react";
import {config} from '../config';

export function useGetUser(id_user) {
    const api = useApi();
    const [state, setState] = useState({
        isLoading: true,
        error: false,
        user_data: undefined
    });
    useEffect( () => {
        async function fetchData() {
            api
                .get(`${config.API_BASE_PATH}/users/${id_user}`)
                .then(({ data }) => {
                    const { user } = data;
                    setState({ isLoading: false, error: false, user_data: user });
                })
                .catch(({response})   => {
                    const { data } = response;
                    setState({ isLoading: false, error: true, user_data: null });
                    window.flash(data.msg, 'danger');
                });
        }
        fetchData().then();
    }, [api, id_user]);
    return [state];
}

export function ChangeData(api, id_user, values) {
    const {name, surname} = values;
    api
        .put(`${config.API_BASE_PATH}/users/`, {id_user: id_user, name: name, surname: surname})
        .then(() => {
            window.flash("Uživatelské údaje byly úspěšně změněny", 'success');
        })
        .catch(( { response } ) => {
            const { data } = response;
            window.flash(data.msg, 'danger');
        });
}

export function ChangePassword(api, id_user, values) {
    const {oldPassword, newPassword1, newPassword2} = values;
    api
        .patch(`${config.API_BASE_PATH}/users/`, {id_user: id_user, oldPassword: oldPassword, newPassword1: newPassword1, newPassword2: newPassword2})
        .then(() => {
            window.flash("Heslo bylo úspěšně změněno", 'success');
        })
        .catch(( { response } ) => {
            const { data } = response;
            window.flash(data.msg, 'danger');
        });
}

export function useGetUserTeams(id_user) {
    const api = useApi();
    const [state, setState] = useState({
        isLoading: true,
        error: false,
        user_data: undefined
    });
    useEffect( () => {
        async function fetchData() {
            api
                .get(`${config.API_BASE_PATH}/users/${id_user}/teamMembership`)
                .then(({ data }) => {
                    const { user } = data;
                    setState({ isLoading: false, error: false, user_data: user });
                })
                .catch(( { response } ) => {
                    const {data} = response;
                    setState({ isLoading: false, error: true, user_data: null });
                    window.flash(data.msg, 'danger');
                });
        }
        fetchData().then();
    }, [api, id_user]);
    return [state];
}

export function useGetUserOwnedTeams(id_user) {
    const api = useApi();
    const [state, setState] = useState({
        isLoading: true,
        error: false,
        teams: undefined
    });
    useEffect( () => {
        async function fetchData() {
            api
                .get(`${config.API_BASE_PATH}/users/${id_user}/team`)
                .then(({ data }) => {
                    const { user } = data;
                    setState({ isLoading: false, error: false, teams: user });
                })
                .catch(( { response } ) => {
                    const { data } = response;
                    setState({ isLoading: false, error: true, teams: null });
                    window.flash(data.msg, 'danger');
                });
        }
        fetchData().then();
    }, [api, id_user]);
    return [state];
}

export function useGetUserOwnedCompetitions(id_user) {
    const api = useApi();
    const [state, setState] = useState({
        isLoading: true,
        error: false,
        competition: undefined
    });
    useEffect( () => {
        async function fetchData() {
            api
                .get(`${config.API_BASE_PATH}/users/${id_user}/competition`)
                .then(({ data }) => {
                    const { user } = data;
                    setState({ isLoading: false, error: false, competition: user });
                })
                .catch(( { response } ) => {
                    const { data } = response;
                    setState({ isLoading: false, error: true, competition: null });
                    window.flash(data.msg, 'danger');
                });
        }
        fetchData().then();
    }, [api, id_user]);
    return [state];
}

export function useGetUserCompetition(id_user) {
    const api = useApi();
    const [state, setState] = useState({
        isLoading: true,
        error: false,
        user_data: undefined
    });
    useEffect( () => {
        async function fetchData() {
            api
                .get(`${config.API_BASE_PATH}/users/${id_user}/competitionMembership`)
                .then(({ data }) => {
                    const { user } = data;
                    setState({ isLoading: false, error: false, user_data: user });
                })
                .catch(( { response } ) => {
                    const {data} = response;
                    setState({ isLoading: false, error: true, user_data: null });
                    window.flash(data.msg, 'danger');
                });
        }
        fetchData().then();
    }, [api, id_user]);
    return [state];
}