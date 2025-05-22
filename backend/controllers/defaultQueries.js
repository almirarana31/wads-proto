import { Category, Role, Status, Priority, Job, StaffDetail} from "../models/index.js";

export default async (req, res) => {
    // insert default values
    console.log("SEED ROUTE HIT");
    try {
    // Categories
    const categories = ["General", "Billing", "IT Support"];

    const category_desc = ["For questions about our services, appointments, or anything else not related to billing or technical issues.", "For help with payments, invoices, insurance questions, or account-related concerns.",
        "For assistance with logging into your account, accessing treatment history, or other technical issues with our online systems."
    ];


    for (let i = 0; i < categories.length; i++) {
        await Category.create({
            name: categories[i],
            description: category_desc[i]
        })
    };

    // Job
    const jobs = ["Cashier", "Doctor", "Technician"];

    for (let i = 0; i < jobs.length; i++) {
        await Job.create({
            name: jobs[i]
        }
        )   
    };

    // // Roles
    const roles = ["STF", "ADM"]
    const role_desc = ["Handles ticket resolutions and can also submit new tickets if needed.",
        "Manages the ticket system by assigning tickets to staff and resolving tickets when necessary"
    ];

    for (let i = 0; i < role_desc.length; i++) {
        await Role.create({
            name: roles[i],
            description: role_desc[i]
        })
    };

    // Statuses
    const statuses = ["Pending", "In Progress", "Resolved", "Cancelled"]
    const status_desc = ["Waiting to be assigned to staff", "Staff is working on resolving the ticket", "Ticket has been resolved", "Ticket has been cancelled by the user/staff"];

    for (let i = 0; i < status_desc.length; i++) {
        await Status.create({
            name: statuses[i],
            description: status_desc[i]
        })
    };

    // Priorities
    const priorities = ["High", "Medium", "Low"];
    const priority_desc = ["Reply within 5 hours", "Reply within 2 days +- 1", "Reply within 1 week"];

    for (let i = 0; i < priority_desc.length; i++) {
        await Priority.create({
            name: priorities[i],
            description: priority_desc[i]
        })
    };

   // Staff Detail
   await StaffDetail.create({
        email: "arielprandi34315@gmail.com",
        role_id: 2,
        field_id: 3,
        job_id: 3
   })

    res.status(200).json({message: "Successfully posted default entries"})
} catch (error) {
    res.status(500);
}

};