import { DB_CONNECTION_KEY } from '../../libs/connection';
import * as matchValidations from "./matchValidations";
import * as competitionValidations from "../competitions/competitionValidations";

export default class MatchService {

	constructor(req) {
		this.req = req;
		this.dbConnection = req[DB_CONNECTION_KEY];
	}

	async allMatches() {
		return this.dbConnection.query(`
			SELECT m.id_match, m.id_competition, m.id_host, m.id_guest, 
			IF (m.date > NOW(), NULL, m.goals_host) AS 'goals_host',
			IF (m.date > NOW(), NULL, m.goals_guest) AS 'goals_guest',
			m.date FROM matches AS m;`);
	}

	async addNewMatch(values) {
		const data = matchValidations.validateCreateMatchData(values);
		const result = await this.dbConnection.query(
			`INSERT INTO matches (id_match, id_competition, id_host, id_guest, date) VALUES (NULL, ?, ?, ?, ?)`,
			[data.id_competition, data.id_host, data.id_guest, data.date]
		);
		if (result.affectedRows === 0) {
			throw {status: 500, msg: 'Vytvoření nového uživatele selhalo'};
		}
		return result.insertId;
	}

	async findMatchById(id_match) {
		const match_id = Number(id_match);
		matchValidations.validateMatchId(match_id);
		const result = await this.dbConnection.query(
			`SELECT m.id_match, m.id_competition, m.id_host, m.id_guest,
			 IF (m.date > NOW(), NULL, m.goals_host) AS 'goals_host',
			 IF (m.date > NOW(), NULL, m.goals_guest) AS 'goals_guest',
			 guest.name AS guest_name, host.name AS host_name, c.name AS competition_name, m.date
			 FROM matches AS m
			 LEFT JOIN competitions AS c ON c.id_competition=m.id_competition
			 JOIN teams AS guest ON guest.id_team=m.id_guest
			 JOIN teams AS host ON host.id_team=m.id_host
			 WHERE id_match=?`,
			match_id
		);
		if (result.length === 0) {
			throw {status: 404, msg: 'Zápas nebyl nalezen v databázi'};
		}
		return result[0];
	}

	async findMatchesByCompetitionId(id_competition) {
		const competitionId = Number(id_competition);
		competitionValidations.validateCompetitionId(competitionId);
		return await this.dbConnection.query(
			`SELECT m.id_match, m.goals_guest, m.goals_host, guest.name AS guest_name, host.name AS host_name, m.date
			 FROM matches AS m
			 JOIN teams AS guest ON guest.id_team=m.id_guest
			 JOIN teams AS host ON host.id_team=m.id_host
			 WHERE id_competition=?
			 ORDER BY m.date DESC`,
			competitionId
		);
	}

	async deleteMatch(id_match) {
		const match_id = Number(id_match);
		matchValidations.validateMatchId(match_id);
		const result = await this.dbConnection.query(
			`DELETE FROM matches WHERE id_match=?`,
			[match_id]
		);
		if(result.affectedRows === 0){
			throw {status: 404, msg: 'Zápas nebyl nalezen v databázi'};
		}
	}

	async getMatchupsByMatchId(id_match, host) {
		const match_id = Number(id_match);
		matchValidations.validateMatchId(match_id);
		const query =
			`SELECT m.id_matchup, m.id_match, m.goalkeeper, m.id_team, m.id_user, m.host, 
				CONCAT(u.name, ' ', u.surname) AS name
			 FROM matchups AS m
			 JOIN users AS u ON u.id_user=m.id_user
			 WHERE m.id_match=? AND m.host=?`;
		return this.dbConnection.query(query, [match_id, host]);
	}

	async getEventsByMatchId(id_match, host) {
		const match_id = Number(id_match);
		matchValidations.validateMatchId(match_id);
		const query =
			`SELECT e.id_event, e.id_match, e.id_team, e.id_user, e.type, e.minute, e.host, 
				CONCAT(ua1.name, ' ', ua1.surname) AS name_assistance1,
				CONCAT(ua2.name, ' ', ua2.surname) AS name_assistance2,
				CONCAT(u.name, ' ', u.surname) AS name
			 FROM events AS e
			 LEFT JOIN users AS u ON u.id_user=e.id_user
			 LEFT JOIN users AS ua1 ON ua1.id_user=e.id_assistance1
			 LEFT JOIN users AS ua2 ON ua2.id_user=e.id_assistance2
			 WHERE e.id_match=? AND e.host=? AND NOT e.type='shot'
			 ORDER BY e.minute`;
		return this.dbConnection.query(query, [match_id, host]);
	}

	async getAllEventsByMatchId(id_match) {
		const match_id = Number(id_match);
		matchValidations.validateMatchId(match_id);
		const queryGoals =
			`SELECT e.id_event, e.id_match, e.id_team, t.name AS team_name, e.id_user, e.type, e.minute, e.host, 
				CONCAT(ua1.name, ' ', ua1.surname) AS name_assistance1,
				CONCAT(ua2.name, ' ', ua2.surname) AS name_assistance2,
				CONCAT(u.name, ' ', u.surname) AS user_name
			 FROM events AS e
			 LEFT JOIN users AS u ON u.id_user=e.id_user
			 LEFT JOIN users AS ua1 ON ua1.id_user=e.id_assistance1
			 LEFT JOIN users AS ua2 ON ua2.id_user=e.id_assistance2
			 JOIN teams AS t ON t.id_team=e.id_team
			 WHERE e.id_match=? AND e.type='goal' AND e.minute BETWEEN ? AND ?
			 ORDER BY e.minute`;
		const querySuspensions =
			`SELECT e.id_event, e.id_match, e.id_team, t.name AS team_name, e.id_user, e.type, e.minute, e.host, 
				CONCAT(ua1.name, ' ', ua1.surname) AS name_assistance1,
				CONCAT(ua2.name, ' ', ua2.surname) AS name_assistance2,
				CONCAT(u.name, ' ', u.surname) AS user_name
			 FROM events AS e
			 LEFT JOIN users AS u ON u.id_user=e.id_user
			 LEFT JOIN users AS ua1 ON ua1.id_user=e.id_assistance1
			 LEFT JOIN users AS ua2 ON ua2.id_user=e.id_assistance2
			 JOIN teams AS t ON t.id_team=e.id_team
			 WHERE e.id_match=? AND NOT e.type='shot' AND NOT e.type='goal' AND e.minute BETWEEN ? AND ?
			 ORDER BY e.minute`;

		const result1Goals = await this.dbConnection.query(queryGoals, [match_id, 1, 20]);
		const result2Goals = await this.dbConnection.query(queryGoals, [match_id, 21, 40]);
		const result3Goals = await this.dbConnection.query(queryGoals, [match_id, 41, 60]);
		const result1Suspensions = await this.dbConnection.query(querySuspensions, [match_id, 1, 20]);
		const result2Suspensions = await this.dbConnection.query(querySuspensions, [match_id, 21, 40]);
		const result3Suspensions = await this.dbConnection.query(querySuspensions, [match_id, 41, 60]);
		return {
			first: {goals: result1Goals, suspensions: result1Suspensions},
			second: {goals: result2Goals, suspensions: result2Suspensions},
			third: {goals: result3Goals, suspensions: result3Suspensions}
		}
	}

	async getShotsByMatchId(id_match, host) {
		const match_id = Number(id_match);
		matchValidations.validateMatchId(match_id);
		const query =
			`SELECT e.id_event, e.id_match, e.id_team, e.id_user, e.type, e.value, e.host
			 FROM events AS e
			 WHERE e.id_match=? AND e.host=? AND e.type='shot'`;
		const result = await this.dbConnection.query(query, [match_id, host]);

		if (result.length === 0) {
			throw {status: 404, msg: 'Zápas nebyl nalezen v databázi'};
		}
		return result[0];
	}

	async getCountShotsByMatchId(id_match) {
		const match_id = Number(id_match);
		matchValidations.validateMatchId(match_id);

		const hostShots = `SELECT COUNT(e.id_event) AS count_host
			 FROM events AS e
			 WHERE e.id_match=? AND e.host=1 AND e.type='shot'`;
		const resultHost = await this.dbConnection.query(hostShots, [match_id]);

		const guestShots = `SELECT COUNT(e.id_event) AS count_guest
			 FROM events AS e
			 WHERE e.id_match=? AND e.host=0 AND e.type='shot'`;
		const resultGuest = await this.dbConnection.query(guestShots, [match_id]);

		const shots = {};
		Object.assign(shots, resultGuest[0], resultHost[0]);

		return shots;
	}
}