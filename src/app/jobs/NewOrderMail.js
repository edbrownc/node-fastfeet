import Mail from '../../lib/Mail';

class NewOrderMail {
  get key() {
    return 'NewOrderMail';
  }

  async handle({ data }) {
    const { order, courier, recipient } = data;

    await Mail.sendMail({
      to: `${courier.name} <${courier.email}>`,
      subject: 'New delivery order',
      template: 'newOrder',
      context: {
        courierName: courier.name,
        recStreet: recipient.street,
        recName: recipient.name,
        recNumber: recipient.number,
        recComplement: recipient.complement,
        recState: recipient.state,
        recCity: recipient.city,
        recZip: recipient.zip,
        product: order.product,
      },
    });
  }
}

export default new NewOrderMail();
