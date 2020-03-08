import * as Yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const { name } = req.query;

    const recipients = await Recipient.findAll({
      where: {
        name: name ? { [Op.iLike]: `%${name}%` } : { [Op.like]: '%' },
      },
    });

    return res.json(recipients);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (!req.isAdmin) {
      return res.status(400).json({ error: 'Not an administrator' });
    }

    // Allow same address with different or null complement
    if (!req.body.complement) {
      req.body.complement = null;
    }

    const recipientExists = await Recipient.findOne({
      where: req.body,
    });

    if (recipientExists) {
      return res.status(400).json({ error: 'Recipient already exists' });
    }

    const recipient = await Recipient.create(req.body);

    return res.json(recipient);
  }
}

export default new RecipientController();
