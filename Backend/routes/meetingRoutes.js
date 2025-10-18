import express from 'express';
import Meeting from '../models/Meeting.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/create', async (req, res) => {
    try {
        const { title, hostName, scheduledFor, password, settings } = req.body;
        
        const meetingId = uuidv4().slice(0, 10);
        
        const meeting = new Meeting({
            meetingId,
            title: title || 'Untitled Meeting',
            host: req.body.hostId || null,
            hostName: hostName || 'Anonymous',
            scheduledFor: scheduledFor || null,
            isScheduled: !!scheduledFor,
            password: password || null,
            settings: settings || {}
        });
        
        await meeting.save();
        
        res.status(201).json({
            success: true,
            meeting: {
                meetingId: meeting.meetingId,
                title: meeting.title,
                hostName: meeting.hostName,
                scheduledFor: meeting.scheduledFor
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating meeting',
            error: error.message
        });
    }
});

router.get('/:meetingId', async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ 
            meetingId: req.params.meetingId 
        }).populate('host', 'username email');
        
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }
        
        res.json({
            success: true,
            meeting
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting',
            error: error.message
        });
    }
});

router.get('/scheduled/all', async (req, res) => {
    try {
        const meetings = await Meeting.find({
            isScheduled: true,
            scheduledFor: { $gte: new Date() },
            isActive: true
        }).sort({ scheduledFor: 1 });
        
        res.json({
            success: true,
            meetings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching scheduled meetings',
            error: error.message
        });
    }
});

// End a meeting
router.patch('/:meetingId/end', async (req, res) => {
    try {
        const meeting = await Meeting.findOneAndUpdate(
            { meetingId: req.params.meetingId },
            { 
                isActive: false,
                endedAt: new Date()
            },
            { new: true }
        );
        
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Meeting ended successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error ending meeting',
            error: error.message
        });
    }
});

// Save chat message
router.post('/:meetingId/chat', async (req, res) => {
    try {
        const { sender, message } = req.body;
        
        const meeting = await Meeting.findOneAndUpdate(
            { meetingId: req.params.meetingId },
            {
                $push: {
                    chatHistory: {
                        sender,
                        message,
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        );
        
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Chat message saved'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error saving chat message',
            error: error.message
        });
    }
});

export default router;
