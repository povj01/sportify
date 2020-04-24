import dotenv from 'dotenv';
import {DB_CONNECTION_KEY} from '../../libs/connection';
import * as competitionValidations from './competitionValidations';
import {parseISO} from "date-fns";

dotenv.config();
dotenv.config({path: '.env'});

export default class CompetitionService {

	constructor(req) {
		this.dbConnection = req[DB_CONNECTION_KEY];
	}

	async allCompetitions(id_sport, id_type) {
		const {sport, type} = competitionValidations.validateFilteredCompetitionData(id_sport, id_type);

		var where = '';
		var values = [];
		if (sport !== undefined) {
			where += ' AND c.id_sport=?';
			values.push(sport);
		}

		if (type !== undefined) {
			where += ' AND c.id_type=?';
			values.push(type);
		}

		return this.dbConnection.query(
			`SELECT c.id_leader, c.id_competition, c.name, s.sport, c.city, ct.type, c.start_date, c.end_date, CONCAT(u.name, " ", u.surname) as name_leader, COUNT(cm.id_competition_membership) as teams_count
				FROM competitions as c 
				JOIN sports as s ON c.id_sport=s.id_sport
				JOIN competition_types as ct ON c.id_type=ct.id_type
				JOIN users as u ON u.id_user=c.id_leader
				LEFT JOIN competition_membership as cm ON cm.id_competition=c.id_competition WHERE 1=1 ` + where + ` GROUP BY c.id_competition`,
			[...values]
		);
	}

	async getCompetition(id_competition) {
		const competition = Number(id_competition);
		competitionValidations.validateCompetitionId(competition);

		const result = await this.dbConnection.query(
			`SELECT c.id_leader, c.id_competition, c.name, s.sport, c.city, ct.type, c.start_date, c.end_date, COUNT(cm.id_competition_membership) as teams_count, CONCAT(u.name, " ", u.surname) as name_leader
				FROM competitions as c 
				JOIN sports as s ON c.id_sport=s.id_sport
				JOIN competition_types as ct ON c.id_type=ct.id_type
				JOIN users as u ON u.id_user=c.id_leader
				LEFT JOIN competition_membership as cm ON cm.id_competition=c.id_competition
				WHERE c.id_competition=?`
			, competition
		);

		if (result.length === 0) {
			throw {status: 404, msg: 'Soutěž nebyla nalezena v databázi'};
		}

		return result[0];
	}

	async getCompetitionTeams(id_competition, competition_membership_status) {
		const competition = Number(id_competition);
		competitionValidations.validateCompetitionId(competition);
		const {status} = competitionValidations.validateStatus(competition_membership_status);

		var where = '';
		var values = [];
		if (status !== undefined) {
			where += ' AND cm.status=?';
			values.push(status);
		}

		return await this.dbConnection.query(
			`SELECT cm.id_competition_membership, cm.id_competition, cm.id_team, cm.status, t.id_sport, t.name, t.id_leader, t.id_contact_person, t.active, t.avatar_public_id, t.avatar_url FROM competition_membership AS cm
				JOIN teams t ON cm.id_team = t.id_team
				WHERE cm.id_competition=?` + where + `;`
			, [competition, ...values]
		);
	}

	async addNewCompetition(name, id_leader, id_sport, id_type, city, start_date, end_date) {
		const leader = Number(id_leader);
		const sport = Number(id_sport);
		const type = Number(id_sport);

		const start = parseISO(start_date);
		const end = parseISO(end_date);

		competitionValidations.validateNewCompetition(name, leader, sport, type, city, start, end);

		const result = await this.dbConnection.query(
			`INSERT INTO competitions (id_competition, name, id_leader, id_sport, id_type, city, start_date, end_date) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)`,
			[name, leader, sport, type, city, start, end]
		);
		if (result.affectedRows === 0) {
			throw {status: 500, msg: 'Vytvoření nové soutěže selhalo'};
		}
	}

	async changeCompetition(id_competition, name, id_leader, city) {
		const leader = Number(id_leader);
		const competition = Number(id_competition);
		competitionValidations.validateChangeCompetition(competition, name, leader, city);

		const teams = await this.dbConnection.query('SELECT * FROM competition_membership WHERE id_competition = ?', [competition]);

		const foundLeader = await this.dbConnection.query(
			'SELECT * FROM competition_membership as cm JOIN team_membership tm on cm.id_team = tm.id_team WHERE cm.id_competition = ? AND tm.id_user = ?',
			[competition, leader]
		);
		// If there is at least one team in the competition, the leader must be from that team. Any user can be a leader if the competition is empty.
		if (teams.length !== 0 && foundLeader.length === 0) {
			throw {status: 500, msg: 'Vybraný vedoucí soutěže musí být členem týmu v soutěži'};
		}

		const result = await this.dbConnection.query(
			'UPDATE competitions SET name=?, id_leader=?, city=? WHERE id_competition=?',
			[name, leader, city, competition]
		);
		if (result.affectedRows === 0) {
			throw {status: 400, msg: 'Změna soutěžních údajů se nezdařila'};
		}
	}

	async getCompetitionTeamStatistics(id_competition) {
		const competition = Number(id_competition);
		competitionValidations.validateCompetitionId(competition);

		return await this.dbConnection.query(`
			SELECT t.name, 
				cs.id_competition_statistics, cs.id_competition, cs.id_team, cs.matches, cs.wins, cs.wins_extension, cs.draws, cs.loses, 
				cs.loses_extension, cs.goals_scored, cs.goals_received, 
				CONCAT(goals_scored, ':', goals_received) AS 'score', 
				cs.points
			FROM competition_statistics AS cs
			JOIN teams t on cs.id_team = t.id_team
			WHERE cs.id_competition = ?
			ORDER BY cs.points DESC, cs.goals_scored DESC, cs.goals_received DESC, cs.wins DESC;`,
			id_competition
		);
	}

	async getCompetitionStatistics(id_competition, is_goalkeeper) {
		const competition = Number(id_competition);
		competitionValidations.validateCompetitionId(competition);
		const { is_gk } = competitionValidations.validateIsGoalkeeper(is_goalkeeper);

		var where = '';
		var values = [];
		if (is_gk !== undefined) {
			where += ' AND p.is_goalkeeper=? ';
			values.push(is_gk);
		}

		return await this.dbConnection.query(`SELECT
					ts.id_user,
					CONCAT(u.name, ' ', u.surname) AS 'name_surname',
					MAX(p.position) AS 'position',
					MAX(p.is_goalkeeper) AS 'is_goalkeeper',
					SUM(ts.field_matches) AS 'matches',
					SUM(ts.field_goals) AS 'goals',
					SUM(ts.field_assists) AS 'assists',
					(SUM(ts.field_goals) + SUM(ts.field_assists)) AS 'field_points',
					((SUM(ts.field_goals) + SUM(ts.field_assists))/SUM(ts.field_matches)) AS 'field_average_points',
					SUM(ts.field_suspensions) AS 'suspensions',
					SUM(ts.goalkeeper_matches) AS 'goalkeeper_matches',
					SUM(ts.goalkeeper_minutes) AS 'goalkeeper_minutes',
					SUM(ts.goalkeeper_goals) AS 'goalkeeper_goals',
					SUM(ts.goalkeeper_zeros) AS 'goalkeeper_zeros',
					(SUM(ts.goalkeeper_zeros)/SUM(ts.goalkeeper_matches)) AS 'goalkeeper_average_zeros',
					SUM(ts.goalkeeper_shots) AS 'goalkeeper_shots',
					CONCAT(100*(1 - SUM(ts.goalkeeper_goals)/SUM(ts.goalkeeper_shots)), ' %') AS 'goalkeeper_success_rate'
						FROM team_statistics as ts
						JOIN users AS u ON ts.id_user = u.id_user
						JOIN team_membership tm on u.id_user = tm.id_user
						JOIN positions AS p on tm.id_position = p.id_position
						WHERE ts.id_competition=? ` + where +
						`GROUP BY ts.id_user`
			,[competition, ...values]);
	}
}
