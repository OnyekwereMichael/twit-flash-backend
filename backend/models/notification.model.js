import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['follow', 'like', 'message'],
    },
    read: {
        type: Boolean,
        default: false,
    },
}
, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification