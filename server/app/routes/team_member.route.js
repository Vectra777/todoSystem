module.exports = (app) => {
    const team_member = require('../controllers/team_member.controller.js');
    const router = require('express').Router();

    // Create a new Team Member
    router.post('/', team_member.create);

    // Get all Team Members
    router.get('/', team_member.findAll);

    app.use('/api/team_member', router);
}