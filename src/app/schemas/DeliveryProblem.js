import mongoose from 'mongoose';

const DeliveryProblemsSchema = new mongoose.Schema(
  {
    orderId: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('DeliveryProblems', DeliveryProblemsSchema);
