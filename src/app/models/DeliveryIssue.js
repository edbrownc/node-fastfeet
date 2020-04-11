import { Sequelize, Model } from 'sequelize';

class DeliveryIssue extends Model {
  static init(sequelize) {
    super.init(
      {
        order_id: Sequelize.STRING,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
  }
}

export default DeliveryIssue;
