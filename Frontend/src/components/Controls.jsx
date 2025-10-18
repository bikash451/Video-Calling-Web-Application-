import React from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiMessageSquare, FiPhoneOff } from 'react-icons/fi';

const Controls = ({
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    onToggleAudio,
    onToggleVideo,
    onToggleScreenShare,
    onToggleChat,
    onLeave,
    showChat
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
            <div className="flex justify-center items-center gap-4 px-6 py-4">
                <button
                    className={`btn btn-circle btn-lg ${!isAudioEnabled ? 'btn-error' : 'btn-ghost hover:btn-primary'}`}
                    onClick={onToggleAudio}
                    title={isAudioEnabled ? 'Mute' : 'Unmute'}
                >
                    {isAudioEnabled ? <FiMic size={24} /> : <FiMicOff size={24} />}
                </button>

                <button
                    className={`btn btn-circle btn-lg ${!isVideoEnabled ? 'btn-error' : 'btn-ghost hover:btn-primary'}`}
                    onClick={onToggleVideo}
                    title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                    {isVideoEnabled ? <FiVideo size={24} /> : <FiVideoOff size={24} />}
                </button>

                <button
                    className={`btn btn-circle btn-lg ${isScreenSharing ? 'btn-primary' : 'btn-ghost hover:btn-primary'}`}
                    onClick={onToggleScreenShare}
                    title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                    <FiMonitor size={24} />
                </button>

                <button
                    className={`btn btn-circle btn-lg ${showChat ? 'btn-primary' : 'btn-ghost hover:btn-primary'}`}
                    onClick={onToggleChat}
                    title="Toggle chat"
                >
                    <FiMessageSquare size={24} />
                </button>

                <button
                    className="btn btn-circle btn-lg btn-error hover:bg-red-700"
                    onClick={onLeave}
                    title="Leave meeting"
                >
                    <FiPhoneOff size={24} />
                </button>
            </div>
        </div>
    );
};

export default Controls;
