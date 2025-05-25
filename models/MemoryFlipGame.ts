import mongoose from 'mongoose';

const MemoryFlipGameSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // برای بهبود عملکرد کوئری‌ها
    },
    score: {
        type: Number,
        default: 0,
    },
    bestScore: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 1,
    },
    lives: {
        type: Number,
        default: 3,
    },
    hints: {
        type: Number,
        default: 3,
    },
    lastGameState: {
        stageTime: {
            type: Number,
            default: 30,
        },
        tiles: [
            {
                id: Number,
                color: String,
                matched: Boolean,
                flipped: Boolean,
            },
        ],
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const MemoryFlipGame = mongoose.models.MemoryFlipGame || mongoose.model('MemoryFlipGame', MemoryFlipGameSchema);

export default MemoryFlipGame;