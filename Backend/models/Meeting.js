import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
    meetingId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        default: 'Untitled Meeting'
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    hostName: {
        type: String,
        required: true
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    scheduledFor: {
        type: Date,
        default: null
    },
    isScheduled: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    settings: {
        allowChat: {
            type: Boolean,
            default: true
        },
        allowScreenShare: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: false
        }
    },
    chatHistory: [{
        sender: String,
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    endedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
