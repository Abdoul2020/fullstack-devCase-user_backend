module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user', 'isActive');
  }
};
