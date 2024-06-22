import mongoose, { Document, Schema, model } from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

interface IBus extends Document {
  reg_number: string;
  variant: string;
  capacity: number;
  totalSeats: number;
  bus_id: number;
  route_id: any;
  journeyDate: string;
  isAssociatedWithRoute: Boolean;
}

const busSchema: Schema = new Schema({
  bus_id: {
    type: Number,
  },
  route_id: { type: Schema.Types.ObjectId, ref: 'Route', default: null },
  reg_number: { type: String, required: true, unique: true, immutable: true },
  variant: {
    type: String,
    required: true,
  },
  totalSeats: {
    type: Number,
    required: true,
  },

  date: {
    type: String,
    required: true,
    default: Date.now(),
  },
  isAssociatedWithRoute: {
    type: Boolean,
    default: false,
  },
  journeyDate: {
    type: String,
  },
  features: {
    type: [String],
  },
});
busSchema.plugin(AutoIncrement, { inc_field: 'bus_id', start_seq: 100 });
const Bus = model<IBus>('Bus', busSchema);
export default Bus;
