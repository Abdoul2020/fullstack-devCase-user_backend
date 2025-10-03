"use strict";
const bcrypt = require("bcrypt");
const AppError = require("../../utils/appError");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userType: {
        type: DataTypes.ENUM("0", "1", "2"),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'User type cannot be null',
          },
          notEmpty: {
            msg: 'User type cannot be empty',
          },
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'FirstName cannot be null',
          },
          notEmpty: {
            msg: 'FirstName cannot be empty',
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'LastName cannot be null',
          },
          notEmpty: {
            msg: 'LastName cannot be empty',
          },
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'isActive cannot be null',
          },
        },
      },
      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: {
            msg: 'Avatar URL must be a valid URL',
          },
        },
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "user",
          key: "id",
        },
        validate: {
          isInt: {
            msg: 'CreatedBy must be a valid integer',
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Email cannot be null',
          },
          notEmpty: {
            msg: 'Email cannot be empty',
          },
          isEmail: {
            msg: 'Invalid email id format',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Password cannot be null',
          },
          notEmpty: {
            msg: 'Password cannot be empty',
          },
        },
      },
      confirmPassword: {
        type: DataTypes.VIRTUAL,
        set(value) {
          if (!value || value.length < 8) {
            throw new AppError('Password must be at least 8 characters long', 400);
          }

          // Hash the password directly since this is the confirmPassword setter
          const hashedPassword = bcrypt.hashSync(value, 10);
          this.setDataValue("password", hashedPassword);
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
      modelName: "user",
    }
  );

  // Define associations
  User.associate = function(models) {
    // Self-referencing association for createdBy
    User.belongsTo(User, {
      as: 'creator',
      foreignKey: 'createdBy',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    User.hasMany(User, {
      as: 'createdUsers',
      foreignKey: 'createdBy',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  };

  return User;
};