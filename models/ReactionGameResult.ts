import mongoose, { Schema, model, Model } from 'mongoose';

interface IReactionGameResult {
    roomId: string;
    gameMode: '1v1' | '2v2' | '3v3' | '4v4';
    sideAReactionTimes: { userId: mongoose.Types.ObjectId; reactionTime: number }[];
    sideBReactionTimes: { userId: mongoose.Types.ObjectId; reactionTime: number }[];
    winner: 'SideA' | 'SideB' | 'Draw';
    timestamp: Date;
}

const ReactionGameResultSchema = new Schema<IReactionGameResult>({
    roomId: { type: String, required: true },
    gameMode: { type: String, enum: ['1v1', '2v2', '3v3', '4v4'], required: true },
    sideAReactionTimes: [{ userId: { type: Schema.Types.ObjectId, ref: 'User' }, reactionTime: Number }],
    sideBReactionTimes: [{ userId: { type: Schema.Types.ObjectId, ref: 'User' }, reactionTime: Number }],
    winner: { type: String, enum: ['SideA', 'SideB', 'Draw'], required: true },
    timestamp: { type: Date, default: Date.now },
});

const ReactionGameResult: Model<IReactionGameResult> =
    mongoose.models.ReactionGameResult || model<IReactionGameResult>('ReactionGameResult', ReactionGameResultSchema);

export default ReactionGameResult;