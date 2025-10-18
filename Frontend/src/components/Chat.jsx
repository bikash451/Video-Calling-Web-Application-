import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiSend } from 'react-icons/fi';

const Chat = ({ messages, onSendMessage, userName, onClose }) => {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="text-lg font-bold">Chat</h3>
                <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                    <FiX size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`chat ${msg.sender === userName ? 'chat-end' : 'chat-start'}`}>
                            <div className="chat-header text-xs opacity-70">
                                {msg.sender}
                                <time className="text-xs opacity-50 ml-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </time>
                            </div>
                            <div className={`chat-bubble ${msg.sender === userName ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
                                {msg.message}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
                <div className="join w-full">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="input input-bordered join-item flex-1"
                    />
                    <button type="submit" className="btn btn-primary join-item">
                        <FiSend size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
