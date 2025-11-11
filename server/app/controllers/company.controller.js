const db = require("../models");
const { ensureAuthenticated } = require('../authentication/utils');

exports.createCompany = async (req, res) => {
    const isLocalChainCall = !(req.headers && req.headers.authorization); 

    // allow programmatic calls from localhost OR authenticated admin users
    const hasAuthHeader = req.headers && req.headers.authorization;
    if (hasAuthHeader) {
        const decoded = ensureAuthenticated(req, res);
        if (!decoded) return;
        const callerRole = (decoded.role || '').toLowerCase();
        if (callerRole !== 'admin') {
            res.status(403).send({ message: 'Forbidden: admin role required' });
            return;
        }
    } else {
        const ip = req.ip || req.connection.remoteAddress || '';
        if (!(ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1')) {
            res.status(403).send('Forbidden: admin creation allowed only from localhost or by authenticated admin');
            return;
        }
    }

    if (!req.body.company) { 
        if (isLocalChainCall) throw new Error("Company name is required!");
        
        res.status(400).send({ message: "Company name is required!" });
        return;
    }

    try {
        const company = await db.companies.create({
            name: req.body.company
        });
        
        if (!isLocalChainCall) {
            res.status(201).send(company);
            return company;
        }
        
        return company; 

    } catch (error) {
        if (isLocalChainCall) throw error;
        
        res.status(500).send({
            message: error.message || "Some error occurred while creating the Company."
        });
    }
};