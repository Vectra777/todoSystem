module.exports = (app) => {
    const employee = require('../controllers/employee.controller.js');
    const router = require('express').Router();

    router.get('/', employee.findAll);
    router.post('/', employee.create);

    app.use('/api/employee', router);
}