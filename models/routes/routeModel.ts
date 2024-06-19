import { Document, Schema, model } from 'mongoose';
const validator = require('validator');
interface IRoute extends Document {
  route_Id?: String | number;
  source: String;
  destination: String;
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
  route_Id: {
    type: String,
  },
  source: {
    type: String,
    required: true,
    enum: {
      values: cityEnumValues,
      message: 'Source must be one of the predefined city values',
    },
  },
  destination: {
    type: String,
    required: true,
    enum: {
      values: cityEnumValues,
      message: 'Destination must be one of the predefined city values',
    },
  },
});
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
