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
                const emailBody = `<div style="font-family: Arial, sans-serif; background: #f4f8fb; padding: 32px;">
                    <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #e3e9f1; padding: 32px 24px;">
                      <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #2563eb; margin: 0; font-size: 1.5rem;">Ticket Update</h2>
                      </div>
                      <p style="color: #222; font-size: 1.1rem; margin-bottom: 18px;">Hi,</p>
                      <p style="color: #222; font-size: 1.1rem; margin-bottom: 18px;">Your ticket has been assigned to a staff member at <b>Bianca Aesthetic Helpdesk</b>.</p>
                      <p style="color: #222; font-size: 1.1rem; margin-bottom: 18px;">Our team will be reviewing your request and will contact you shortly.</p>
                      <div style="text-align: center; margin: 32px 0;">
                        <div style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; font-weight: 600; padding: 14px 32px; border-radius: 6px; font-size: 1.1rem; letter-spacing: 0.5px;">Ticket In Progress</div>
                      </div>
                      <p style="color: #666; font-size: 0.95rem; margin-bottom: 12px;"><strong>Note:</strong> Please do not reply directly to this email. If you need to provide additional information, log in to your account or reply to any follow-up emails from our staff.</p>
                      <p style="color: #666; font-size: 0.95rem;">Thank you for your patience as we work to resolve your issue.</p>
                      <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #e3e9f1;" />
                      <p style="color: #b0b8c1; font-size: 0.9rem; text-align: center;">&copy; ${new Date().getFullYear()} Bianca Aesthetic Clinic</p>
                    </div>
                  </div>`;
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