module.exports = (app) => {
    const team = require('../controllers/team.controller.js');
    const router = require('express').Router();
    const { ensureGetAllowed } = require('../authentication/utils.js');

    // Create a new Team
    router.post('/', ensureGetAllowed, team.create);

    // Get all Teams
    router.get('/', ensureGetAllowed, team.findAll);

    app.use('/api/team', router);
}