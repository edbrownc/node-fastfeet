import * as Yup from 'yup';
import { Op } from 'sequelize';
import Order from '../models/Order';
import Courier from '../models/Courier';
import Recipient from '../models/Recipient';
import File from '../models/File';
import NewOrderMail from '../jobs/NewOrderMail';
import Queue from '../../lib/Queue';
import isWithinBusinessHours from '../utils/WithinBusinessHours';

class OrderController {
  async index(req, res) {
    const { page = 1, product } = req.query;

    const orders = await Order.findAll({
      where: {
        canceled_at: null,
        product: product ? { [Op.iLike]: `%${product}%` } : { [Op.like]: '%' },
      },
      order: ['id'],
      attributes: ['id', 'product', 'start_date', 'end_date', 'status'],
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
        { model: File, as: 'signature', attributes: ['id', 'path', 'url'] },
      ],
    });

    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      courier_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, courier_id, product } = req.body;

    const order = await Order.create({
      recipient_id,
      courier_id,
      product,
    });

    const courier = await Courier.findByPk(courier_id);

    const recipient = await Recipient.findByPk(recipient_id);

    await Queue.add(NewOrderMail.key, { order, courier, recipient });

    return res.json({ order });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      courier_id: Yup.number(),
      product: Yup.string(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const start_date_req = req.body.start_date;

    if (start_date_req && isWithinBusinessHours(start_date_req)) {
      return res
        .status(400)
        .json({ error: 'Start date outside business hours.' });
    }

    const order = await Order.findByPk(req.params.id);

    const {
      id,
      courier_id,
      recipient_id,
      product,
      start_date,
      end_date,
    } = await order.update(req.body);

    return res.json({
      id,
      courier_id,
      recipient_id,
      product,
      start_date,
      end_date,
    });
  }

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id, {
      include: [
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
        {
          model: Courier,
          as: 'courier',
          attributes: ['name', 'email'],
        },
      ],
    });

    order.canceled_at = new Date();

    await order.save();

    return res.json(order);
  }
}

export default new OrderController();
