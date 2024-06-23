import mongoose, { Schema, model } from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

const bookingSchema = new Schema({
  booking_id: {
    type: Number,
    unique: true,
    immutable: true,
  },
  userId: {},
  name: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  journeyDate: { type: String, required: true },
  email_id: { type: String, required: true },
  paymentStatus: {
    type: String,
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true, default: Date.now() },
});
bookingSchema.plugin(AutoIncrement, { inc_field: 'booking_id', start_seq: 24000 });
const Booking = model('Booking', bookingSchema);
export default Booking;
