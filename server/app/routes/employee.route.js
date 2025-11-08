module.exports = (app) => {
    const employee = require('../controllers/employee.controller.js');
    const auth = require('../authentication/auth.js');
    const { ensureAuthenticated } = require('../authentication/utils.js');
    const router = require('express').Router();

    // Authentication routes (public - no JWT required)
    router.post('/register', auth.register);
    router.post('/login', auth.login);
    router.post('/refresh', auth.refreshToken);
    router.post('/logout', auth.logout);

    // Password change route (protected - JWT required)
    router.post('/changepsw', (req, res) => {
        if (!ensureAuthenticated(req, res)) return;
        auth.changePassword(req, res);
    });

    // Employee CRUD routes (protected - JWT required)
    router.get('/', employee.findAll);
    router.post('/', employee.create);

    app.use('/api/employee', router);
}