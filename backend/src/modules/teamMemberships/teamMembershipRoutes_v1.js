import { Router } from 'express';
import TeamService from "./teamMembershipService";

const router = Router();

/**
 * @swagger
 * /teamMembership/team/{id_team}:
 *   get:
 *     tags:
 *       - TeamMembership
 *     name: Team membership players
 *     summary: Get all players from a team
 *     parameters:
 *       - name: id_team
 *         in: path
 *         description: Team ID
 *         required: true
 *         schema:
 *           type: integer
 *       - name: id_user
 *         in: query
 *         description: Filter by a certain user
 *         required: false
 *         schema:
 *           type: integer
 *       - name: id_match
 *         in: query
 *         description: Filter by a certain team membership status
 *         required: false
 *         schema:
 *           type: integer
 *       - name: team_membership_status
 *         in: query
 *         description: Filter players who are not in a match-up of a certain match as id_match
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive, declined, pending]
 *     responses:
 *       200:
 *         description: Players returned
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Unexpected error
 */
router.get('/team/:id_team', async (req, res, next) => {
    try {
        const { id_team } = req.params;
        const { id_user, id_match, team_membership_status } = req.query;
        const players = await new TeamService(req).filteredTeamMemberships(id_team, id_user, id_match, team_membership_status);
        res.status(200).json({ error: false, msg: 'OK', players: players});
    } catch(e) {
        next(e);
    }
});

/**
 * @swagger
 * /teamMembership/team/{id_team}/user/{id_user}:
 *   patch:
 *     tags:
 *       - TeamMembership
 *     name: Updates user status of a team
 *     summary: Get all players from a team
 *     consumes: application/json
 *     produces: application/json
 *     parameters:
 *       - name: id_team
 *         in: path
 *         description: Team ID
 *         required: true
 *         schema:
 *           type: integer
 *       - name: id_user
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: integer
 *       - name: body
 *         in: body
 *         required: false
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [active, inactive, declined, pending]
 *             id_position:
 *               type: integer
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Unexpected error
 */
router.patch('/team/:id_team/user/:id_user', async (req, res, next) => {
    try {
        const { id_team, id_user } = req.params;
        const { status, id_position } = req.body;
        await new TeamService(req).updateTeamMembership(id_team, id_user, status, id_position);
        res.status(200).json({ error: false, msg: 'Stav nebo pozice hráče byl změněn'});
    } catch(e) {
        next(e);
    }
});

/**
 * @swagger
 * /teamMembership/team/{id_team}/user/{id_user}:
 *   post:
 *     tags:
 *       - TeamMembership
 *     name: Add user status or position of a team
 *     summary: Add user status or position of a team
 *     consumes: application/json
 *     produces: application/json
 *     parameters:
 *       - name: id_team
 *         in: path
 *         description: Team ID
 *         required: true
 *         schema:
 *           type: integer
 *       - name: id_user
 *         in: path
 *         description: User ID
 *         required: false
 *         schema:
 *           type: integer
 *       - name: body
 *         in: body
 *         required: false
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [active, inactive, declined, pending]
 *             id_position:
 *               type: integer
 *     responses:
 *       201:
 *         description: User membership created
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Unexpected error
 */
router.post('/team/:id_team/user/:id_user', async (req, res, next) => {
    try {
        const { id_team, id_user } = req.params;
        const { status, id_position } = req.body;
        await new TeamService(req).addNewMember(id_team, id_user, id_position, status);
        res.status(200).json({ error: false, msg: 'Nové členství v týmu bylo vytvořeno'});
    } catch(e) {
        next(e);
    }
});

/**
 * @swagger
 * /teamMembership/team/{id_team}/user/{id_user}:
 *   delete:
 *     tags:
 *       - TeamMembership
 *     name: Removes user from a team
 *     summary: Removes user from a team
 *     parameters:
 *       - name: id_team
 *         in: path
 *         description: Team ID
 *         required: true
 *         schema:
 *           type: integer
 *       - name: id_user
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User membership removed
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Unexpected error
 */
router.delete('/team/:id_team/user/:id_user', async (req, res, next) => {
	try {
		const { id_team, id_user } = req.params;
		await new TeamService(req).removeMember(id_team, id_user);
		res.status(200).json({ error: false, msg: 'Hráč byl odebrán z týmu'});
	} catch(e) {
		next(e);
	}
});

/**
 * TeamMembership object Swagger definition
 *
 * @swagger
 * TeamMembership:
 *   Sport:
 *     properties:
 *       id_team_membership:
 *         type: integer
 *       team:
 *         type: integer
 *       user:
 *         type: integer
 *       status:
 *         type: string
 *       position:
 *         type: string
 */

export default router;
