const bcrypt = require('bcrypt');

const sequelize = require('../../config/database');

module.exports = {
  up: (queryInterface, Sequelize) => {

    let password = process.env.ADMIN_PASSWORD;
    
    const hashedPassword = bcrypt.hashSync(password, 10);

    return queryInterface.bulkInsert('user', [
      {
        userType: '0',
        firstName: 'John',
        lastName: 'Doe',
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        avatarUrl: 'https://icons.veryicon.com/png/o/miscellaneous/two-color-webpage-small-icon/user-244.png',
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('user', {userType:'0'}, {});
  },
};