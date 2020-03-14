import * as Yup from 'yup';
import DeliveryProblem from '../schemas/DeliveryProblem';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Courier from '../models/Courier';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemsController {
  async index(req, res) {
    const problem = await DeliveryProblem.find();

    return res.json(problem);
  }

  async show(req, res) {
    const order = await DeliveryProblem.find({
      orderId: req.params.id,
    });

    return res.json(order);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { description } = req.body;
    const orderId = req.params.id;

    await DeliveryProblem.create({
      orderId,
      description,
    });

    return res.json({ orderId, description });
  }

  async delete(req, res) {
    const { description } = await DeliveryProblem.findOne({
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

export default new DeliveryProblemsController();
