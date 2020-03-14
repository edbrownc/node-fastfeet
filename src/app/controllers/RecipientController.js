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

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string().nullable(),
      state: Yup.string(),
      city: Yup.string(),
      zip: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipient = await Recipient.findByPk(req.params.id);

    const { email } = req.body;

    if (email && email !== recipient.email) {
      const emailExists = await Recipient.findOne({ where: { email } });

      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use.' });
      }
    }

    const { id, name } = await recipient.update(req.body, {
      attributes: ['id', 'name'],
    });

    return res.json({ id, name });
  }

  async delete(req, res) {
    await Recipient.destroy({
      where: {
        id: req.params.id,
      },
    });

    return res.json({ message: 'Recipient deleted successfuly.' });
  }
}

export default new RecipientController();
