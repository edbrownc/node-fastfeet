import Courier from '../models/Courier';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import File from '../models/File';

const { Op } = require('sequelize');

class DeliveredOrdersController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await Order.findAll({
      where: {
        courier_id: req.params.id,
        end_date: {
          [Op.ne]: null,
        },
      },
      order: ['start_date'],
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'created_at',
        'status',
      ],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Courier,
          as: 'courier',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip',
          ],
        },
      ],
    });

    return res.json(orders);
  }
}

export default new DeliveredOrdersController();
