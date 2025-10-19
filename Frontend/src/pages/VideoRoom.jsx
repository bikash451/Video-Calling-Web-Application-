import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Peer from 'simple-peer';
import { getSocket } from '../utils/socket';
import VideoPlayer from '../components/VideoPlayer';
import Chat from '../components/Chat';
import Controls from '../components/Controls';
import { FiUsers, FiCopy } from 'react-icons/fi';

const VideoRoom = () => {
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const userName = searchParams.get('name') || 'Anonymous';
    const isAdmin = searchParams.get('admin') === 'true';

    const [peers, setPeers] = useState([]);
    const [localStream, setLocalStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [roomUsers, setRoomUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isAdminUser, setIsAdminUser] = useState(isAdmin);

    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);

    useEffect(() => {
        console.log('🔢 ROOMUSERS STATE CHANGED! New count:', roomUsers.length);
        console.log('🔢 RoomUsers:', roomUsers.map(u => u.userName || u.userId));
    }, [roomUsers]);

    useEffect(() => {
        console.log('💭 MESSAGES STATE CHANGED! New count:', messages.length);
        console.log('💭 Messages:', messages.map(m => `${m.sender}: ${m.message}`));
    }, [messages]);

    useEffect(() => {
        let mounted = true;
        let initialUsers = []; 
        
        socketRef.current = getSocket();
        
        console.log('🔌 Socket initialized:', socketRef.current.id);
        
        const handleRoomUsers = (users) => {
            if (!mounted) return;
            console.log('📥 ========== ROOM-USERS EVENT RECEIVED ==========');
            console.log('📥 Received users:', JSON.stringify(users, null, 2));
            console.log('📥 Number of users:', users.length);
            console.log('📥 Current roomUsers state BEFORE update:', roomUsers.length);
            setRoomUsers(users);
            console.log('📥 setRoomUsers() called with', users.length, 'users');
            console.log('📥 ================================================\n');
            
            initialUsers = users.filter(user => user.userId !== socketRef.current.id);
            console.log('Initial users to connect with:', initialUsers);
        };

        const handleRoomUsersUpdated = (users) => {
            if (!mounted) return;
            console.log('👥 ========== ROOM-USERS-UPDATED EVENT RECEIVED ==========');
            console.log('👥 Received users:', JSON.stringify(users, null, 2));
            console.log('👥 Number of users:', users.length);
            console.log('👥 Current roomUsers state BEFORE update:', roomUsers.length);
            setRoomUsers(users);
            console.log('👥 setRoomUsers() called with', users.length, 'users');
            console.log('👥 =========================================================\n');
        };

        const handleUserJoined = (userData) => {
            if (!mounted) return;
            console.log('New user joined:', userData);
            
            if (localStream && userData.userId !== socketRef.current.id) {
                console.log('Creating peer for new user:', userData.userId);
                const peer = createPeer(userData.userId, socketRef.current.id, localStream);
                peersRef.current.push({
                    peerID: userData.userId,
                    peer,
                    userName: userData.userName
                });
                setPeers([...peersRef.current]);
            }
        };

        const handleOffer = ({ offer, from, userName: fromUserName }) => {
            if (!mounted || !localStream) {
                console.log('Offer received but localStream not ready');
                return;
            }
            console.log('Offer received from:', fromUserName, from);
            const peer = addPeer(offer, from, localStream);
            
            const existingPeerIndex = peersRef.current.findIndex(p => p.peerID === from);
            if (existingPeerIndex !== -1) {
                peersRef.current[existingPeerIndex].peer.destroy();
                peersRef.current[existingPeerIndex] = {
                    peerID: from,
                    peer,
                    userName: fromUserName
                };
            } else {
                peersRef.current.push({
                    peerID: from,
                    peer,
                    userName: fromUserName
                });
            }
            
            setPeers([...peersRef.current]);
        };

        const handleAnswer = ({ answer, from }) => {
            if (!mounted) return;
            const item = peersRef.current.find(p => p.peerID === from);
            if (item) {
                item.peer.signal(answer);
            }
        };

        const handleIceCandidate = ({ candidate, from }) => {
            if (!mounted) return;
            const item = peersRef.current.find(p => p.peerID === from);
            if (item) {
                item.peer.signal(candidate);
            }
        };

        const handleUserLeft = ({ userId, userName: leftUserName }) => {
            if (!mounted) return;
            console.log('User left:', leftUserName, userId);
            const peerObj = peersRef.current.find(p => p.peerID === userId);
            if (peerObj) {
                peerObj.peer.destroy();
            }
            peersRef.current = peersRef.current.filter(p => p.peerID !== userId);
            setPeers(peersRef.current);
        };

        const handleChatMessage = (message) => {
            if (!mounted) return;
            console.log('� ========== CHAT-MESSAGE EVENT RECEIVED ==========');
            console.log('💬 Received message:', JSON.stringify(message, null, 2));
            console.log('💬 From:', message.sender);
            console.log('💬 Text:', message.message);
            console.log('💬 Current messages count BEFORE:', messages.length);
            setMessages(prev => {
                const newMessages = [...prev, message];
                console.log('💬 Updated messages count AFTER:', newMessages.length);
                console.log('💬 All messages:', newMessages.map(m => `${m.sender}: ${m.message}`));
                console.log('💬 ==================================================\n');
                return newMessages;
            });
        };

        const handleAudioToggle = ({ userId, isEnabled }) => {
            if (!mounted) return;
            console.log(`User ${userId} ${isEnabled ? 'unmuted' : 'muted'}`);
        };

        const handleVideoToggle = ({ userId, isEnabled }) => {
            if (!mounted) return;
            console.log(`User ${userId} turned video ${isEnabled ? 'on' : 'off'}`);
        };

        const handleScreenShareStart = ({ userId, userName: sharingUserName }) => {
            if (!mounted) return;
            console.log(`${sharingUserName} started screen sharing`);
        };

        const handleScreenShareStop = ({ userId }) => {
            if (!mounted) return;
            console.log(`User stopped screen sharing`);
        };

        const handlePromotedToAdmin = () => {
            if (!mounted) return;
            setIsAdminUser(true);
            alert('You are now the meeting admin');
        };

        const handleRemovedFromRoom = ({ message }) => {
            if (!mounted) return;
            alert(message);
            handleLeaveRoom();
        };

        const handlePermissionsUpdated = (permissions) => {
            if (!mounted) return;
            if (!permissions.canSpeak) {
                setIsAudioEnabled(false);
                if (localStream) toggleAudio();
            }
            if (!permissions.canVideo) {
                setIsVideoEnabled(false);
                if (localStream) toggleVideo();
            }
        };

        socketRef.current.on('room-users', handleRoomUsers);
        socketRef.current.on('room-users-updated', handleRoomUsersUpdated);
        socketRef.current.on('user-joined', handleUserJoined);
        socketRef.current.on('offer', handleOffer);
        socketRef.current.on('answer', handleAnswer);
        socketRef.current.on('ice-candidate', handleIceCandidate);
        socketRef.current.on('user-left', handleUserLeft);
        socketRef.current.on('chat-message', handleChatMessage);
        socketRef.current.on('user-audio-toggle', handleAudioToggle);
        socketRef.current.on('user-video-toggle', handleVideoToggle);
        socketRef.current.on('user-screen-share-start', handleScreenShareStart);
        socketRef.current.on('user-screen-share-stop', handleScreenShareStop);
        socketRef.current.on('promoted-to-admin', handlePromotedToAdmin);
        socketRef.current.on('removed-from-room', handleRemovedFromRoom);
        socketRef.current.on('permissions-updated', handlePermissionsUpdated);

        console.log('✅ All event listeners registered');
        console.log('🚪 Now joining room:', roomId, 'as', userName);
        
        socketRef.current.emit('join-room', {
            roomId,
            userName,
            userId: null,
            isAdmin: isAdmin
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                if (!mounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
                
                if (!stream || !stream.active) {
                    console.error('Invalid or inactive stream');
                    if (mounted) {
                        alert('Could not get valid media stream. Please check permissions.');
                    }
                    return;
                }
                
                console.log('Local stream obtained, active tracks:', stream.getTracks().length);
                setLocalStream(stream);
                if (userVideo.current) {
                    userVideo.current.srcObject = stream;
                }
                
                console.log('Creating peers for initial users:', initialUsers);
                initialUsers.forEach(user => {
                    if (user.userId && user.userId !== socketRef.current.id) {
                        console.log('Creating peer for existing user:', user.userId, user.userName);
                        try {
                            const peer = createPeer(user.userId, socketRef.current.id, stream);
                            peersRef.current.push({
                                peerID: user.userId,
                                peer,
                                userName: user.userName
                            });
                        } catch (error) {
                            console.error('Error creating peer for user:', user.userId, error);
                        }
                    }
                });
                setPeers([...peersRef.current]);
                console.log('Peers created:', peersRef.current.length);
            })
            .catch(err => {
                console.error('Error accessing media devices:', err);
                if (mounted) {
                    alert('Could not access camera/microphone. Please check permissions and ensure you are using HTTPS or localhost.');
                }
                initialUsers = [];
            });

        return () => {
            mounted = false;
            
            if (socketRef.current) {
                socketRef.current.off('room-users', handleRoomUsers);
                socketRef.current.off('room-users-updated', handleRoomUsersUpdated);
                socketRef.current.off('user-joined', handleUserJoined);
                socketRef.current.off('offer', handleOffer);
                socketRef.current.off('answer', handleAnswer);
                socketRef.current.off('ice-candidate', handleIceCandidate);
                socketRef.current.off('user-left', handleUserLeft);
                socketRef.current.off('chat-message', handleChatMessage);
                socketRef.current.off('user-audio-toggle', handleAudioToggle);
                socketRef.current.off('user-video-toggle', handleVideoToggle);
                socketRef.current.off('user-screen-share-start', handleScreenShareStart);
                socketRef.current.off('user-screen-share-stop', handleScreenShareStop);
                socketRef.current.off('promoted-to-admin', handlePromotedToAdmin);
                socketRef.current.off('removed-from-room', handleRemovedFromRoom);
                socketRef.current.off('permissions-updated', handlePermissionsUpdated);
                socketRef.current.emit('leave-room', { roomId });
            }
            
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (screenStream) {
                screenStream.getTracks().forEach(track => track.stop());
            }
            
            peersRef.current.forEach(({ peer }) => peer.destroy());
        };
    }, [roomId, userName, isAdmin]);

    const createPeer = (userToSignal, callerID, stream) => {
        console.log('Creating peer - initiator true, signaling to:', userToSignal);
        
        if (!stream) {
            throw new Error('Cannot create peer: stream is undefined');
        }
        if (!stream.active) {
            throw new Error('Cannot create peer: stream is not active');
        }
        
        const peer = new Peer({
            initiator: true,
            trickle: true,
            stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                ]
            }
        });

        peer.on('signal', signal => {
            console.log('Sending signal to:', userToSignal, 'Type:', signal.type);
            if (signal.type === 'offer') {
                socketRef.current.emit('offer', {
                    offer: signal,
                    to: userToSignal
                });
            } else if (signal.candidate) {
                socketRef.current.emit('ice-candidate', {
                    candidate: signal,
                    to: userToSignal
                });
            }
        });

        peer.on('stream', remoteStream => {
            console.log('Received remote stream from peer:', userToSignal);
            console.log('Remote stream tracks:', remoteStream.getTracks().length);
            remoteStream.getTracks().forEach(track => {
                console.log('Track:', track.kind, 'enabled:', track.enabled);
            });
        });

        peer.on('error', err => {
            console.error('Peer error:', err);
        });

        peer.on('connect', () => {
            console.log('Peer connected:', userToSignal);
        });

        return peer;
    };

    const addPeer = (incomingSignal, callerID, stream) => {
        console.log('Adding peer - initiator false, caller:', callerID);
        
        if (!stream) {
            throw new Error('Cannot add peer: stream is undefined');
        }
        if (!stream.active) {
            throw new Error('Cannot add peer: stream is not active');
        }
        
        const peer = new Peer({
            initiator: false,
            trickle: true,
            stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                ]
            }
        });

        peer.on('signal', signal => {
            console.log('Sending signal to:', callerID, 'Type:', signal.type);
            if (signal.type === 'answer') {
                socketRef.current.emit('answer', {
                    answer: signal,
                    to: callerID
                });
            } else if (signal.candidate) {
                socketRef.current.emit('ice-candidate', {
                    candidate: signal,
                    to: callerID
                });
            }
        });

        peer.on('stream', remoteStream => {
            console.log('Received remote stream from peer:', callerID);
            console.log('Remote stream tracks:', remoteStream.getTracks().length);
            remoteStream.getTracks().forEach(track => {
                console.log('Track:', track.kind, 'enabled:', track.enabled);
            });
        });

        peer.on('error', err => {
            console.error('Peer error:', err);
        });

        peer.on('connect', () => {
            console.log('Peer connected:', callerID);
        });

        peer.signal(incomingSignal);

        return peer;
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
                socketRef.current.emit('toggle-audio', {
                    roomId,
                    isEnabled: audioTrack.enabled
                });
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
                socketRef.current.emit('toggle-video', {
                    roomId,
                    isEnabled: videoTrack.enabled
                });
            }
        }
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false
                });

                setScreenStream(stream);
                setIsScreenSharing(true);

                const videoTrack = stream.getVideoTracks()[0];
                peersRef.current.forEach(({ peer }) => {
                    const sender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    }
                });

                socketRef.current.emit('start-screen-share', { roomId });

                videoTrack.onended = () => {
                    stopScreenShare();
                };
            } catch (err) {
                console.error('Error sharing screen:', err);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = () => {
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
        }

        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            peersRef.current.forEach(({ peer }) => {
                const sender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            });
        }

        setIsScreenSharing(false);
        socketRef.current.emit('stop-screen-share', { roomId });
    };

    const sendMessage = (message) => {
        if (!socketRef.current) {
            console.error('❌ Socket not initialized!');
            alert('Connection error. Please refresh the page.');
            return;
        }

        console.log('📤 Sending chat message:', message);
        console.log('Socket status:', {
            exists: !!socketRef.current,
            connected: socketRef.current.connected,
            id: socketRef.current.id
        });
        console.log('Room ID:', roomId);
        
        const chatMessage = {
            sender: userName,
            message,
            timestamp: new Date(),
            senderId: socketRef.current.id || 'unknown'
        };
        
        console.log('💬 Adding message locally:', chatMessage);
        setMessages(prev => {
            const newMessages = [...prev, chatMessage];
            console.log('Local messages count after add:', newMessages.length);
            return newMessages;
        });
        
        console.log('🔌 Emitting to server...');
        socketRef.current.emit('chat-message', {
            roomId,
            message
        });
        console.log('✅ Message emitted to server');
    };

    const handleLeaveRoom = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
        }
        navigate('/');
    };

    const copyMeetingLink = () => {
        const link = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(link);
        alert('Meeting link copied to clipboard!');
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <div className="navbar bg-gray-800 border-b border-gray-700 px-6">
                <div className="flex-1">
                    <h2 className="text-xl font-bold">Meeting: {roomId}</h2>
                </div>
                <div className="flex-none gap-3">
                    <div className="badge badge-primary badge-lg gap-2">
                        <FiUsers size={18} />
                        {roomUsers.length} {roomUsers.length === 1 ? 'Participant' : 'Participants'}
                    </div>
                    <div className="badge badge-accent badge-sm">
                        DEBUG: State={roomUsers.length} | Peers={peers.length}
                    </div>
                    <button onClick={copyMeetingLink} className="btn btn-sm btn-primary gap-2">
                        <FiCopy size={16} />
                        Copy Link
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                            <VideoPlayer
                                stream={screenStream || localStream}
                                isLocal={true}
                                userName={userName + ' (You)'}
                                isAudioEnabled={isAudioEnabled}
                                isVideoEnabled={isVideoEnabled}
                            />
                            <video
                                ref={userVideo}
                                autoPlay
                                playsInline
                                muted
                                style={{ display: 'none' }}
                            />
                        </div>

                        {peers.map(({ peer, peerID, userName: peerUserName }) => {
                            const peerUser = roomUsers.find(u => u.userId === peerID);
                            return (
                                <VideoPlayer
                                    key={peerID}
                                    peer={peer}
                                    userName={peerUserName || 'Anonymous'}
                                    isAudioEnabled={peerUser?.permissions?.canSpeak !== false}
                                    isVideoEnabled={peerUser?.permissions?.canVideo !== false}
                                />
                            );
                        })}
                    </div>
                </div>

                {showChat && (
                    <div className="w-96 bg-gray-800 border-l border-gray-700 pb-20">
                        <Chat
                            messages={messages}
                            onSendMessage={sendMessage}
                            userName={userName}
                            onClose={() => setShowChat(false)}
                        />
                    </div>
                )}
            </div>

            <Controls
                isAudioEnabled={isAudioEnabled}
                isVideoEnabled={isVideoEnabled}
                isScreenSharing={isScreenSharing}
                onToggleAudio={toggleAudio}
                onToggleVideo={toggleVideo}
                onToggleScreenShare={toggleScreenShare}
                onToggleChat={() => setShowChat(!showChat)}
                onLeave={handleLeaveRoom}
                showChat={showChat}
            />
        </div>
    );
};

export default VideoRoom;
