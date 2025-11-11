module.exports = (app) => {
    const team_member = require('../controllers/team_member.controller.js');
    const router = require('express').Router();
    const { ensureGetAllowed } = require('../authentication/utils.js');

    // Create a new Team Member
    router.post('/',ensureGetAllowed, team_member.create);

    // Get all Team Members
    router.get('/', ensureGetAllowed, team_member.findAll);

    // Get teams for a specific employee (owner or HR/Admin)
    const { ensureSelfOrHrOrAdmin } = require('../authentication/utils.js');
    router.get('/employee/:employeeId', ensureSelfOrHrOrAdmin, team_member.findByEmployee);

    // Get members for a specific team
    router.get('/team/:teamId', ensureGetAllowed, team_member.findByTeam);

    // Remove an employee from a team
    router.delete('/:teamId/:employeeId',ensureGetAllowed, team_member.remove);

    app.use('/api/team_member', router);
}