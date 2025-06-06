// ticket actions start here
import {Staff, Assignment, Ticket} from '../models/index.js';
import sequelize from '../config/sequelize.js';
import {Op} from 'sequelize';
import { logAudit } from '../controllers/audit.js';
import sendOTP from '../controllers/otp.js';

export const roundRobinAssignment = async (ticket_id, category_id, email, id) => {
    try {
        // get all staff
        console.log("this is category_id", category_id)
        const staffs = await Staff.findAll({
            where: {
                field_id: category_id
            },
            raw: true
        })

        const assignment = await Assignment.findOne({
            where: {
                category_id: category_id
            },
            raw: true
        })

        const last_staff = assignment?.last_staff
        const lastIndex = staffs.findIndex(staff => staff.id === last_staff); // returns -1 if last_staff doesnt exist
        
        for (let i = 1; i <= staffs.length; i++) {
            const index = (lastIndex + i) % staffs.length
            console.log("hello trying to see if this works")
            const count = await Ticket.count({
                where: {
                    staff_id: staffs[index].id,
                    status_id: {[Op.notIn]: [4, 3]} // not resolved, not cancelled
                }
            })

            console.log("Hi this is ", count)

            if (count < 3) {
                // update the ticket
                const ticket = await Ticket.update({
                    status_id: 2,
                    staff_id: staffs[index].id
                }, {
                    where: {
                    id: ticket_id
                  }
                })
                console.log("This is email", email)
                const emailBody = `
                Staff has been assigned! Please wait for follow up emails!
                `;
                await sendOTP(email, "Ticket in progress", emailBody);
                console.log("Email is sent?")
                // update the assignment
                if (last_staff) {
                    assignment.last_staff = staffs[index].id
                    await assignment.save();
                    // audit
                    console.log("This reaches here")
                    await logAudit(
                        'Update',
                        id,
                        `
                        Ticket ID ${ticket_id} assigned to staff ID ${staffs[index].id}
                        `
                    )
                    console.log("and here")
                    return true
                }

                const newAssignment = await Assignment.create({
                    category_id: category_id,
                    last_staff: staffs[index].id
                })

                // audit
                await logAudit(
                    'Update',
                    id,
                    `
                    Ticket ID ${ticket_id} assigned to staff ID ${staffs[index].id}
                    `
                )
                return true // if true ticket has been automatically assigned
            }
            
            // if false res.status(200).json({message: "Ticket sent to the ticket pool"})
            return false
        }
    } catch(error) {
        console.log(error.message)
    }
}