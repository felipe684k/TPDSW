
import { DataTypes } from "sequelize";
import { sequelize } from '../config/database.js';

export const Classroomamano = sequelize.define('Classroomamano', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },

    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'Classroomamano',
    timestamps: false,
});
export default Classroomamano;