import React, { useRef, useEffect } from 'react';
import { FiMicOff, FiVideoOff } from 'react-icons/fi';

const VideoPlayer = ({ stream, peer, isLocal, userName, isAudioEnabled, isVideoEnabled }) => {
    const videoRef = useRef();

    useEffect(() => {
        if (peer) {
            console.log('VideoPlayer: Setting up peer stream listener for', userName);
            
            const handleStream = (remoteStream) => {
                console.log('VideoPlayer: Received stream for', userName, 'with tracks:', remoteStream.getTracks().length);
                if (videoRef.current) {
                    videoRef.current.srcObject = remoteStream;
                    console.log('VideoPlayer: Stream attached to video element for', userName);
                }
            };

            peer.on('stream', handleStream);

            return () => {
                peer.off('stream', handleStream);
            };
        } else if (stream && videoRef.current) {
            console.log('VideoPlayer: Setting local stream for', userName);
            videoRef.current.srcObject = stream;
        }
    }, [peer, stream, userName]);

    return (
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
            />
            {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <div className="avatar placeholder">
                        <div className="bg-neutral-focus text-neutral-content rounded-full w-24 h-24">
                            <span className="text-5xl font-bold">
                                {userName?.charAt(0).toUpperCase() || '?'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex justify-between items-center">
                    <span className="text-white font-semibold drop-shadow-lg">{userName}</span>
                    <div className="flex gap-2">
                        {isAudioEnabled === false && (
                            <div className="badge badge-error gap-1">
                                <FiMicOff size={14} />
                            </div>
                        )}
                        {isVideoEnabled === false && (
                            <div className="badge badge-warning gap-1">
                                <FiVideoOff size={14} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
