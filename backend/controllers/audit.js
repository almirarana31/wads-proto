import {Audit, User} from '../models/index.js';
import sequelize from '../config/sequelize.js'
import { Op } from 'sequelize';

export const logAudit = async (action, user_id, detail) => {
    try {
        await Audit.create({
            timestamp: new Date(Date.now()),
            action: action,
            user_id: user_id,
            detail: detail
        });
    } catch (error) {
        return console.log(error.message)
    }
 };

export const showAudit = async (req, res) => {
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const action = req.query.action
    const search = req.query.search

    try {
        const audit = await Audit.findAll({
            include: [{
                model: User,
                attributes: ['email'],
                required: true
            }],
            where: {
                timestamp: {[Op.and]:
                    [{[Op.lt]: endDate ? endDate : new Date('2500-01-01')}, 
                    {[Op.gt]: startDate ? startDate : new Date('2000-01-01')}]
                }
            },
            raw: true
        })

        return res.status(200).json(audit);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};