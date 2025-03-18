import {models, model, Schema, Document} from "mongoose"

interface Reaction extends Document {
    dislike:number,
    like:number,
    userId:string | undefined,
    username:string,
    campaignId: string | undefined
}

const reactionSchema = new Schema<Reaction>({
    dislike: {
        type:Number,
        default:0
    },
    like: {
        type:Number,
        default:0
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    username: {
        type:String,
    },
    campaignId: {
        type:Schema.Types.ObjectId,
        ref: "Campaign"
    }
},{ timestamps: true })

const Reaction = models.reactions || model("reactions",reactionSchema)

export default Reaction