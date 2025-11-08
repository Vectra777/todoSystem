module.exports = (app) => {
    const team_member = require('../controllers/team_member.controller.js');
    const router = require('express').Router();

    // Create a new Team Member
    router.post('/', team_member.create);

    // Get all Team Members
    router.get('/', team_member.findAll);

    // Get teams for a specific employee
    router.get('/employee/:employeeId', team_member.findByEmployee);

    // Get members for a specific team
    router.get('/team/:teamId', team_member.findByTeam);

    // Remove an employee from a team
    router.delete('/:teamId/:employeeId', team_member.remove);

    app.use('/api/team_member', router);
}