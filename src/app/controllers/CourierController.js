import * as Yup from 'yup';
import { Op } from 'sequelize';
import Courier from '../models/Courier';
import File from '../models/File';

class CourierController {
  async index(req, res) {
    const { name } = req.query;

    const couriers = await Courier.findAll({
      where: {
        name: name ? { [Op.iLike]: `%${name}%` } : { [Op.like]: '%' },
      },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(couriers);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const courierExists = await Courier.findOne({
      where: { email: req.body.email },
    });

    if (courierExists) {
      return res.status(400).json({ error: 'Courier already exists.' });
    }

    const { id, name, email } = await Courier.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const courier = await Courier.findByPk(req.params.id);

    const { email } = req.body;

    if (email && email !== courier.email) {
      const emailExists = await Courier.findOne({ where: { email } });

      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use.' });
      }
    }

    const { id, name, avatar_id } = await courier.update(req.body, {
      attributes: ['id', 'name', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json({ id, name, email, avatar_id });
  }

  async delete(req, res) {
    await Courier.destroy({
      where: {
        id: req.params.id,
      },
    });

    return res.json({ message: 'Courier deleted successfuly.' });
  }

  async show(req, res) {
    const courier = await Courier.findByPk(req.params.id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(courier);
  }
}

export default new CourierController();
