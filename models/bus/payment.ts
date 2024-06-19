import { Schema, model } from 'mongoose';

const paymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    razorpayPaymentId: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove the _id field
        delete ret._id;
        return ret;
      },
    },
  }
);
const Payments = model('payments', paymentSchema);
export default Payments;
