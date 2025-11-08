import { DataTypes, Model } from "sequelize";
import { BookingStatus, BookingStatusEnum } from "../utils/enums.js";
import sequelize from "./sequelize.js";

export class Booking extends Model {
  static associate(models) {}
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    flightId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    numberOfSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    bookingReference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(...BookingStatusEnum),
      allowNull: false,
      defaultValue: BookingStatus.PENDING,
    },
    seatNumbers: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of seat number assigned",
    },
  },
  { sequelize, timestamps: true, modelName: "Booking", tableName: "bookings" }
);
