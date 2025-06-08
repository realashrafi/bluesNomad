import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
}, { timestamps: true, strict: true });

// پاک کردن کش مدل
delete mongoose.models.User;
export default mongoose.model('User', userSchema);