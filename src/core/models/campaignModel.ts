import {models, model, Schema, Document} from "mongoose";

interface Campaign extends Document {
  campaignPicture: string;
  campaignName: string;
  campaignDescription: string;
  category: string;
  milestone: string;
  amountNeeded: number;
  completionDate: string;
  teamInformation: [{
    name: string;
    qualification: string;
    experience: string;
  }];
  expectedImpact: string;
  risksAndChallenges: string;
  creatorName: string;
  creatorId: string | undefined;
  moneyReceived: number;
  comments: string[];
  status:string;
  problem:string,
  solution:string[],
  update:string[];
  backers:number
}

const campaignSchema = new Schema<Campaign>(
  {
    campaignName: {
      type: String,
      required: true
    },
    campaignPicture:{
      type:String,
      required:true
    },
    campaignDescription: {
      type: String,
      required: true
    },
    problem:{
      type:String,
      required:true
    },
    category: {
      type: String,
      required: true
    },
    solution:[{
      type:String,
      required:true
    }],
    status:{
      type:String,
      enum: ["Active", "Completed"],
      default: "Active"
    },
    milestone: {
      type: String,
      required: true
    },
    update:[{
      type:String
    }],
    amountNeeded: {
      type: Number,
      required: true
    },
    completionDate: {
      type: String,
      required: true
    },
    teamInformation: [{
      name: {
        type: String,
        required: true
      },
      qualification: {
        type: String,
        required: true
      },
      experience: {
        type: String,
        required: true
      }
    }],
    expectedImpact: {
      type: String,
      required: true
    },
    risksAndChallenges: {
      type: String,
      required: true
    },
    creatorName: {
      type: String,
      required: true
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    moneyReceived: {
      type:Number,
      default: 0
    },
    backers:{
      type:Number,
      default:0
    },
    comments: [{
      type:Schema.Types.ObjectId,
      ref:"Comment",
    }]
  },
  {
    timestamps: true,
  }
);

const Campaign = models.campaigns || model('campaigns', campaignSchema);

export default Campaign;