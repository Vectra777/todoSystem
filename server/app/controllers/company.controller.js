const db = require("../models");
const { ensureAuthenticated } = require('../authentication/utils');

exports.createCompany = async (req, res) => {
    // allow programmatic calls from localhost OR authenticated admin users
    const hasAuthHeader = req.headers && req.headers.authorization;
    if (hasAuthHeader) {
        const decoded = ensureAuthenticated(req, res);
        if (!decoded) return; // ensureAuthenticated already sent response
        const callerRole = (decoded.role || '').toLowerCase();
        if (callerRole !== 'admin') return res.status(403).send({ message: 'Forbidden: admin role required' });
    } else {
        const ip = req.ip || req.connection.remoteAddress || '';
        if (!(ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1')) {
            return res.status(403).send({ message: 'Forbidden: admin creation allowed only from localhost or by authenticated admin' });
        }
    }


    // Validate request
    if (!req.body.company) {
        res.status(400).send({
            message: "Company name is required!"
        });
        return;
    }

    try {
        // Create a Company
        const company = await db.companies.create({
            name: req.body.company
        });
        res.status(201).send(company);
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while creating the Company."
        });
    }
};