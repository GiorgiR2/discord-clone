import mongoose, { Types } from "mongoose";

interface channelSchemaI extends mongoose.Document {
    _id: Types.ObjectId;
    name: string;
    users: string[];
    admin: string;
}

const channelSchema = new mongoose.Schema<channelSchemaI>(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: {
            type: String,
            unique: true,
        },
        users: [{ type: String }],
        admin: {
            type: String,
        },
    }
)

const Channel = mongoose.model<channelSchemaI>("Channel", channelSchema);

export default Channel;
export { channelSchemaI };