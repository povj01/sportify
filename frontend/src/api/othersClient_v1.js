import {useApi} from "../hooks/useApi";
import {useEffect, useState} from "react";
import {config} from '../config';

export function useGetSports() {
    const api = useApi();
    const [state, setState] = useState({
        isLoading: true,
        error: false,
        sports: undefined
    });
    useEffect(() => {
        async function fetchData() {
            await api
                .get(`${config.API_BASE_PATH}/others/sports`)
                .then(({data}) => {
                    const {sports} = data;
                    setState({isLoading: false, error: false, sports: sports});
                })
                .catch(() => {
                    setState({isLoading: false, error: true, sports: null});
                });
        }

        fetchData().then();
    }, [api]);
    return [state];
}

export function useGetTeamTypes() {
    const api = useApi();
    const [state, setState] = useState({
        isLoading: true,
        error: false,
        types: undefined
    });
    useEffect(() => {
        async function fetchData() {
            await api
                .get(`${config.API_BASE_PATH}/others/teamTypes`)
                .then(({data}) => {
                    const {types} = data;
                    setState({isLoading: false, error: false, types: types});
                })
                .catch(() => {
                    setState({isLoading: false, error: true, types: null});
                });
        }

        fetchData().then();
    }, [api]);
    return [state];
}

export function useGetTeamPositions() {
    const api = useApi();
    const [state, setState] = useState({
        isLoading: true,
        error: false,
        positions: undefined
    });
    useEffect(() => {
        async function fetchData() {
            await api
                .get(`${config.API_BASE_PATH}/others/positions`)
                .then(({data}) => {
                    const {positions} = data;
                    setState({isLoading: false, error: false, positions: positions});
                })
                .catch(() => {
                    setState({isLoading: false, error: true, positions: null});
                });
        }

        fetchData().then();
    }, [api]);
    return [state];
}

export function useGetCompetitionTypes() {
    const api = useApi();
    const [state, setState] = useState({
        isLoading: true,
        error: false,
        types: undefined
    });
    useEffect(() => {
        async function fetchData() {
            await api
                .get(`${config.API_BASE_PATH}/others/competitionTypes`)
                .then(({data}) => {
                    const {types} = data;
                    setState({isLoading: false, error: false, types: types});
                })
                .catch(() => {
                    setState({isLoading: false, error: true, types: null});
                });
        }

        fetchData().then();
    }, [api]);
    return [state];
}

export function useGetStatistics() {
    const api = useApi();
    const [state, setState] = useState({
        isLoading: true,
        error: false,
        statistics: undefined
    });
    useEffect(() => {
        async function fetchData() {
            await api
                .get(`${config.API_BASE_PATH}/others/statistics`)
                .then(({data}) => {
                    const {statistics} = data;
                    setState({isLoading: false, error: false, statistics: statistics});
                })
                .catch(() => {
                    setState({isLoading: false, error: true, statistics: null});
                });
        }

        fetchData().then();
    }, [api]);
    return [state];
}