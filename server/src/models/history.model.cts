import mongoose, { Types } from "mongoose";

interface historySchemaI extends mongoose.Document {
    _id: Types.ObjectId;
    data: string[],
}

const historySchema = new mongoose.Schema<historySchemaI>(
    {
        _id: mongoose.Schema.Types.ObjectId,
        data: [{ type: String }]
    }
)

const History = mongoose.model<historySchemaI>("History", historySchema);

export default History;
export { historySchemaI };