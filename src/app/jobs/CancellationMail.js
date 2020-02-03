import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { order, description } = data;

    await Mail.sendMail({
      to: `${order.courier.name} <${order.courier.email}>`,
      subject: 'Delivery canceled',
      template: 'cancellation',
      context: {
        courierName: order.courier.name,
        recStreet: order.recipient.street,
        recName: order.recipient.name,
        recNumber: order.recipient.number,
        recComplement: order.recipient.complement,
        recState: order.recipient.state,
        recCity: order.recipient.city,
        recZip: order.recipient.zip,
        product: order.product,
        description,
      },
    });
  }
}

export default new CancellationMail();
