module.exports = (app) => {
    const competence = require('../controllers/competence.controller.js');
    const router = require('express').Router();

    // Create a new Competence
    router.post('/', competence.create);

    // Get all Competences
    router.get('/', competence.findAll);

    // Get competences for a specific employee
    router.get('/employee/:employeeId', competence.findByEmployee);

    // Get competences for a specific team with progress
    router.get('/team/:teamId', competence.findByTeam);

    app.use('/api/competence', router);
}