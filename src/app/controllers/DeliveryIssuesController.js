import * as Yup from 'yup';
import DeliveryIssue from '../models/DeliveryIssue';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Courier from '../models/Courier';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryIssuesController {
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
    const { description } = await DeliveryIssue.findOne({
      orderId: req.params.id,
    });

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

    await Queue.add(CancellationMail.key, { order, description });

    return res.json(order);
  }
}

export default new DeliveryIssuesController();
