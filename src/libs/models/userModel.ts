import {model, Schema, Document,models} from "mongoose";

interface User extends Document {
  firstName: string;
  lastName: string;
  email: string;
  username:string
  password: string;
  country?: string;
  capitalCity?: string;
  phoneNumber?: string;
  sex?: string;
  qualification?: string;
  campaigns?: string[];
}

const userSchema = new Schema<User>(
  {
    firstName: {
      type: String,
      required: true
    },
    username: {
      type:String,
      required:true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    country: {
      type: String,
    },

    capitalCity: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    sex:{
      type:String,
      enum:["Male","Female"],
    },
    qualification: {
      type:String,
    },
    campaigns: [{
      type: Schema.Types.ObjectId,
      ref: 'Campaign'
    }]
  },
  {
    timestamps: true,
  }
);


const User = models.users || model('users', userSchema);

export default User;