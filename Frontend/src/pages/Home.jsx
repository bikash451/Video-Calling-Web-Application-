import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingAPI } from '../utils/api';
import { FiVideo, FiMessageSquare, FiMonitor, FiLogIn } from 'react-icons/fi';

const Home = () => {
    const navigate = useNavigate();
    const [meetingId, setMeetingId] = useState('');
    const [userName, setUserName] = useState('');
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');

    const handleCreateMeeting = async () => {
        if (!userName.trim()) {
            setError('Please enter your name');
            return;
        }

        setCreating(true);
        setError('');

        try {
            const response = await meetingAPI.create({
                hostName: userName,
                title: 'Quick Meeting'
            });

            if (response.data.success) {
                const newMeetingId = response.data.meeting.meetingId;
                navigate(`/room/${newMeetingId}?name=${encodeURIComponent(userName)}&admin=true`);
            }
        } catch (err) {
            setError('Failed to create meeting. Please try again.');
            console.error('Create meeting error:', err);
        } finally {
            setCreating(false);
        }
    };

    const handleJoinMeeting = () => {
        console.log('=== Join Meeting Clicked ===');
        console.log('userName:', userName);
        console.log('meetingId:', meetingId);
        console.log('userName.trim():', userName.trim());
        console.log('meetingId.trim():', meetingId.trim());
        
        setError('');
        
        if (!userName.trim()) {
            console.log('ERROR: Name is empty');
            setError('Please enter your name');
            return;
        }

        if (!meetingId.trim()) {
            console.log('ERROR: Meeting ID is empty');
            setError('Please enter a meeting ID');
            return;
        }

        const trimmedMeetingId = meetingId.trim();
        const trimmedUserName = userName.trim();
        
        console.log(' Validation passed!');
        console.log('Navigating to:', `/room/${trimmedMeetingId}?name=${encodeURIComponent(trimmedUserName)}`);
        
        setJoining(true);
        
        setTimeout(() => {
            console.log(' Executing navigation...');
            navigate(`/room/${trimmedMeetingId}?name=${encodeURIComponent(trimmedUserName)}`);
        }, 100);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-5">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-3">Video Calling App</h1>
                    <p className="text-xl text-purple-100">Connect with anyone, anywhere</p>
                </div>

                <div className="card bg-base-100 shadow-2xl">
                    <div className="card-body p-8">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Your Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="input input-bordered w-full"
                            />
                        </div>

                        <button
                            onClick={handleCreateMeeting}
                            disabled={creating || !userName.trim()}
                            className="btn btn-primary w-full mt-4 gap-2"
                        >
                            {creating ? <span className="loading loading-spinner"></span> : <FiVideo size={20} />} 
                            {creating ? 'Creating...' : 'Create New Meeting'}
                        </button>

                        <div className="divider">OR</div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Meeting ID</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter meeting ID"
                                value={meetingId}
                                onChange={(e) => setMeetingId(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && userName.trim() && meetingId.trim()) {
                                        handleJoinMeeting();
                                    }
                                }}
                                className="input input-bordered w-full"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleJoinMeeting}
                            disabled={joining}
                            className="btn btn-success w-full mt-4 gap-2"
                        >
                            {joining ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <FiLogIn size={20} />
                                    Join Meeting
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="alert alert-error mt-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="stats stats-vertical lg:stats-horizontal shadow-lg mt-8 w-full">
                    <div className="stat place-items-center">
                        <div className="stat-title">Feature</div>
                        <div className="stat-value flex justify-center">
                            <FiVideo size={48} className="text-primary" />
                        </div>
                        <div className="stat-desc">HD Video & Audio</div>
                    </div>

                    <div className="stat place-items-center">
                        <div className="stat-title">Feature</div>
                        <div className="stat-value flex justify-center">
                            <FiMessageSquare size={48} className="text-secondary" />
                        </div>
                        <div className="stat-desc">Real-time Chat</div>
                    </div>

                    <div className="stat place-items-center">
                        <div className="stat-title">Feature</div>
                        <div className="stat-value flex justify-center">
                            <FiMonitor size={48} className="text-accent" />
                        </div>
                        <div className="stat-desc">Screen Sharing</div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/schedule')}
                    className="btn btn-outline w-full mt-6 text-white border-white hover:bg-white hover:text-purple-700"
                >
                    📅 Schedule Meeting
                </button>
            </div>
        </div>
    );
};

export default Home;
