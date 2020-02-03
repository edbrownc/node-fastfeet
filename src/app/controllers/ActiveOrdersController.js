import * as Yup from 'yup';
import { startOfDay, endOfDay } from 'date-fns';
import Courier from '../models/Courier';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import File from '../models/File';
import isWithinBusinessHours from '../utils/WithinBusinessHours';

const { Op } = require('sequelize');

class ActiveOrdersController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await Order.findAll({
      where: { courier_id: req.params.id, end_date: null, canceled_at: null },
      order: ['start_date'],
      attributes: ['id', 'product', 'start_date', 'end_date'],
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

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const {
      start_date: start_date_req,
      end_date: end_date_req,
      signature_id,
    } = req.body;

    if (start_date_req) {
      if (isWithinBusinessHours(start_date_req)) {
        return res
          .status(400)
          .json({ error: 'Start date outside business hours.' });
      }

      const currentDate = Number(new Date());

      const count = await Order.count({
        where: {
          start_date: {
            [Op.between]: [startOfDay(currentDate), endOfDay(currentDate)],
          },
        },
      });

      if (count >= 5) {
        return res
          .status(400)
          .json({ error: 'More than 5 deliveries per day is not allowed.' });
      }
    }

    const { courierId, orderId } = req.params;

    const order = await Order.findByPk(orderId);

    const { start_date, end_date } = await order.update({
      start_date: start_date_req,
      end_date: end_date_req,
      signature_id,
    });

    return res.json({
      id: orderId,
      courier_id: courierId,
      start_date,
      end_date,
    });
  }
}

export default new ActiveOrdersController();
