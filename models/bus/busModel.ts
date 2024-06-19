import mongoose, { Document, Schema, model } from 'mongoose';

interface IBus extends Document {
  reg_number: string;
  capacity: number;
  operator: string;
}

const busSchema: Schema = new Schema({
  bus_Id: {
    type: String,
    required: true,
    unique: true,
  },
  variant: {
    type: String,
    required: true,
  },
  totalSeats: {
    type: Number,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const Bus = model<IBus>('BUS', busSchema);
export default Bus;
