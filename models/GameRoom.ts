import mongoose, { Schema, model, Model } from 'mongoose';

interface IGameRoom {
    roomId: string;
    gameMode: '1v1' | '2v2' | '3v3' | '4v4';
    sideA: mongoose.Types.ObjectId[];
    sideB: mongoose.Types.ObjectId[];
    readyUsers: mongoose.Types.ObjectId[];
    isActive: boolean;
    grid?: number[];
    startTime?: number;
    createdAt: Date;
}

const GameRoomSchema = new Schema<IGameRoom>({
    roomId: { type: String, required: true, unique: true },
    gameMode: { type: String, enum: ['1v1', '2v2', '3v3', '4v4'], required: true },
    sideA: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sideB: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    readyUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: false },
    grid: [{ type: Number }],
    startTime: { type: Number },
    createdAt: { type: Date, default: Date.now },
});

const GameRoom: Model<IGameRoom> = mongoose.models.GameRoom || model<IGameRoom>('GameRoom', GameRoomSchema);

export default GameRoom;