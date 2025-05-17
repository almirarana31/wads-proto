import sequelize from "./config/sequelize.js";

const addFK = await sequelize.query(
    // `
    //   ALTER TABLE "Users" add constraint fk_role_code foreign key (role_code) references "Roles";
    // `
    // `
    //   ALTER TABLE "Tickets" add constraint fk_user_id foreign key (id) references "Users";
    // `
    `
      ALTER TABLE "Users"
      ALTER column phone SET NOT NULL;
    `
);

export {
    addFK
}