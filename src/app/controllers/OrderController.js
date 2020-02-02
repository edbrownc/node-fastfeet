import * as Yup from 'yup';
import { parseISO, isBefore, isAfter } from 'date-fns';
import Order from '../models/Order';
import Courier from '../models/Courier';
import Recipient from '../models/Recipient';
import File from '../models/File';

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const { courier_id } = req.body;

    const orders = await Order.findAll({
      where: { courier_id, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'canpickup'],
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

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, product } = req.body;

    const order = await Order.create({
      recipient_id,
      product,
    });

    return res.json({ order });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      product: Yup.string(),
      courier_id: Yup.number(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { start_date } = req.body;

    if (start_date) {
      const parsedStartDate = parseISO(start_date);

      const busHoursStart = parsedStartDate.setHours(8); // 08:00 for the same day as start date
      const busHoursEnd = parsedStartDate.setHours(18); // 18:00 for the same day as start date

      // If start date is outside of business hours
      if (
        isBefore(parsedStartDate, busHoursStart) ||
        isAfter(parsedStartDate, busHoursEnd)
      ) {
        return res
          .status(400)
          .json({ error: 'Start date outside business hours.' });
      }
    }

    const order = await Order.update(req.body, {
      where: { id: req.params.id },
    });

    return res.json(order);
  }
}

export default new OrderController();
