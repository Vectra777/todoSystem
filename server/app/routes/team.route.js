module.exports = (app) => {
    const team = require('../controllers/team.controller.js');
    const router = require('express').Router();

    // Create a new Team
    router.post('/', team.create);

    // Get all Teams
    router.get('/', team.findAll);

    app.use('/api/team', router);
}