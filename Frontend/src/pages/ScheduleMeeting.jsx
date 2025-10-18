import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingAPI } from '../utils/api';
import { FiLink, FiCopy, FiLogIn } from 'react-icons/fi';

const ScheduleMeeting = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        hostName: '',
        date: '',
        time: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [meetingDetails, setMeetingDetails] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const scheduledFor = new Date(`${formData.date}T${formData.time}`);
            
            const response = await meetingAPI.create({
                title: formData.title,
                hostName: formData.hostName,
                scheduledFor: scheduledFor.toISOString(),
                password: formData.password || null
            });

            if (response.data.success) {
                setSuccess(true);
                setMeetingDetails(response.data.meeting);
            }
        } catch (err) {
            setError('Failed to schedule meeting. Please try again.');
            console.error('Schedule meeting error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-5">
            <div className="w-full max-w-2xl">
                <button onClick={() => navigate('/')} className="btn btn-ghost text-white mb-6">
                    ← Back to Home
                </button>

                <h1 className="text-5xl font-bold text-white text-center mb-8">Schedule a Meeting</h1>

                <form onSubmit={handleSubmit} className="card bg-base-100 shadow-2xl">
                    <div className="card-body p-8">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Meeting Title *</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter meeting title"
                                className="input input-bordered"
                                required
                            />
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text font-semibold">Your Name *</span>
                            </label>
                            <input
                                type="text"
                                name="hostName"
                                value={formData.hostName}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                className="input input-bordered"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Date *</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="input input-bordered"
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Time *</span>
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="input input-bordered"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text font-semibold">Password (Optional)</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Set a password for the meeting"
                                className="input input-bordered"
                            />
                        </div>

                        {error && (
                            <div className="alert alert-error mt-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}
                        
                        {success && meetingDetails && (
                            <div className="mt-6 space-y-4">
                                <div className="alert alert-success">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Meeting scheduled successfully!</span>
                                </div>

                                <div className="card bg-base-200">
                                    <div className="card-body p-6">
                                        <h3 className="font-bold text-lg mb-3">📅 Meeting Details</h3>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="font-semibold">Meeting ID:</span>{' '}
                                                <span className="badge badge-primary badge-lg">{meetingDetails.meetingId}</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold">Title:</span> {meetingDetails.title}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Host:</span> {meetingDetails.hostName}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Scheduled For:</span>{' '}
                                                {new Date(meetingDetails.scheduledFor).toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="divider my-2"></div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-semibold flex items-center gap-2">
                                                    <FiLink size={16} />
                                                    Share this link:
                                                </span>
                                            </label>
                                            <div className="join">
                                                <input
                                                    type="text"
                                                    value={`${window.location.origin}/room/${meetingDetails.meetingId}`}
                                                    readOnly
                                                    className="input input-bordered join-item flex-1 font-mono text-sm"
                                                />
                                                <button
                                                    className="btn btn-primary join-item gap-2"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/room/${meetingDetails.meetingId}`);
                                                        alert('Meeting link copied to clipboard!');
                                                    }}
                                                >
                                                    <FiCopy size={16} />
                                                    Copy
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => navigate(`/room/${meetingDetails.meetingId}?name=${encodeURIComponent(formData.hostName)}&admin=true`)}
                                                className="btn btn-success flex-1 gap-2"
                                            >
                                                <FiLogIn size={18} />
                                                Join Now
                                            </button>
                                            <button
                                                onClick={() => navigate('/')}
                                                className="btn btn-ghost flex-1"
                                            >
                                                ← Back to Home
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!success && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full mt-6"
                            >
                                {loading && <span className="loading loading-spinner"></span>}
                                {loading ? 'Scheduling...' : '📅 Schedule Meeting'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleMeeting;
