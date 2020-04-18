import * as Yup from 'yup';
import { Op } from 'sequelize';
import DeliveryIssue from '../models/DeliveryIssue';
import Order from '../models/Order';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryIssuesController {
  async index(req, res) {
    const issues = await DeliveryIssue.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            canceled_at: { [Op.is]: null },
            end_date: { [Op.is]: null },
          },
        },
      ],
    });

    return res.json(issues);
  }

  async show(req, res) {
    const issues = await DeliveryIssue.findAll({
      where: {
        order_id: req.params.id,
      },
    });

    return res.json(issues);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { description } = req.body;
    const order_id = req.params.id;

    const issue = await DeliveryIssue.create({
      order_id,
      description,
    });

    return res.json({ issue });
  }

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id);

    order.canceled_at = new Date();

    await order.save();

    await Queue.add(CancellationMail.key, {
      order,
      description: 'Too many attempts to deliver',
    });

    return res.json(order);
  }
}

export default new DeliveryIssuesController();
