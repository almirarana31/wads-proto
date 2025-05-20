import { Category, Role, Status, Priority} from "../models/index.js";

export default async (req, res) => {
    // insert default values
    console.log("SEED ROUTE HIT");
    try {
    // Categories
    const categories = ["General", "Billing", "IT Support"];


    for (let i = 0; i < categories.length; i++) {
        await Category.create({
            name: categories[i]
        })
    };

    // // Roles
    const roles = ["USR", "STF", "ADM"]
    const role_desc = ["Can submit tickets to report issues or request support but cannot resolve or assign them.", "Handles ticket resolutions and can also submit new tickets if needed.",
        "Manages the ticket system by assigning tickets to staff and resolving tickets when necessary"
    ];

    for (let i = 0; i < role_desc.length; i++) {
        await Role.create({
            role_code: roles[i],
            role_desc: role_desc[i]
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

    res.status(200).json({message: "Successfully posted default entries"})
} catch (error) {
    res.status(500);
}

};