import mongoose, { Document, Schema, model } from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

interface IRoute extends Document {
  route_id?: String | number;
  source: String;
  destination: String;
  departure: String;
  arrival: String;
  price: number;
}
const cityEnumValues = [
  'mumbai',
  'delhi',
  'bengaluru',
  'hyderabad',
  'ahmedabad',
  'chennai',
  'kolkata',
  'pune',
  'jaipur',
  'surat',
  'lucknow',
  'kanpur',
  'nagpur',
  'patna',
  'indore',
  'thane',
  'bhopal',
  'visakhapatnam',
  'vadodara',
  'firozabad',
];

const routeSchema: Schema = new Schema({
  route_id: {
    type: Number,
  },
  source: {
    type: String,
    required: true,
    enum: {
      values: cityEnumValues,
      message: 'Source must be one of the predefined city',
    },
  },
  destination: {
    type: String,
    required: true,
    enum: {
      values: cityEnumValues,
      message: 'Destination must be one of the predefined city',
    },
  },
  departure: {
    type: String,
    required: true,
  },
  arrival: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 750,
    required: true,
  },
});

routeSchema.plugin(AutoIncrement, { inc_field: 'route_id', start_seq: 100 });

// Custom validation function to ensure source and destination are not the same
routeSchema.pre('validate', function (next) {
  if (this.source === this.destination) {
    next(new Error('Source and destination cannot be the same'));
  } else {
    next();
  }
});

const Route = model<IRoute>('Route', routeSchema);
export default Route;
