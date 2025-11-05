/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("bookings", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    flightId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    numberOfSeats: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    totalAmount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    bookingReference: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: Sequelize.ENUM("pending", "confirmed", "cancelled", "completed"),
      allowNull: false,
      defaultValue: "pending",
    },
    seatNumbers: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "Array of seat numbers assigned",
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal(
        "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      ),
    },
  });

  await queryInterface.addIndex("bookings", ["bookingReference"], {
    unique: true,
    name: "bookingsBookingReferenceUnique",
  });

  await queryInterface.addIndex("bookings", ["flightId"], {
    name: "bookingsFlightIdIdx",
  });
}

export async function down(queryInterface, Sequelize) {
   await queryInterface.dropTable("bookings");
}
