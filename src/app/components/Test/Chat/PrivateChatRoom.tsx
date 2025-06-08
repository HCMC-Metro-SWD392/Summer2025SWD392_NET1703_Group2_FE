// src/pages/PrivateChatRoom.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

interface IMessage {
    senderId: string;
    text: string;
}

export const PrivateChatRoom = ({ currentUser, token }) => {
    const { roomId } = useParams<{ roomId: string }>(); // Lấy roomId từ URL
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const latestMessages = useRef(messages);

    useEffect(() => {
        latestMessages.current = messages;
    }, [messages]);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(`https://localhost:44306/chatroomhub?access_token=${token}`)
            .withAutomaticReconnect()
            .build();
        setConnection(newConnection);
    }, [token]);

    useEffect(() => {
        if (connection && roomId) {
            connection.start()
                .then(() => {
                    console.log('Chat Room Hub Connected!');
                    
                    // Tham gia group SignalR của phòng chat này
                    connection.invoke('JoinSpecificRoom', roomId);

                    // Lắng nghe tin nhắn
                    connection.on('ReceiveRoomMessage', (senderId: string, text: string) => {
                        const receivedMessage: IMessage = { senderId, text };
                        setMessages(prev => [...prev, receivedMessage]);
                    });
                })
                .catch(e => console.error('Connection failed: ', e));

            return () => { connection.stop(); };
        }
    }, [connection, roomId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (connection && newMessage.trim() && roomId) {
            await connection.invoke('SendRoomMessage', roomId, newMessage);
            setNewMessage('');
        }
    };
    
    // Giao diện JSX tương tự như component ChatWindow ở câu trả lời trước
    return (
        <div className="flex flex-col h-[500px] w-full max-w-md mx-auto border rounded-lg bg-white shadow-lg mt-10">
            <div className="p-4 border-b flex justify-between items-center">
                <span className="font-bold">Phòng Chat: {roomId}</span>
                <Link to="/chat" className="text-sm text-blue-500 hover:underline">Quay lại sảnh</Link>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex mb-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.senderId === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                           {msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t flex">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tin nhắn..."
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600">
                    Gửi
                </button>
            </form>
        </div>
    );
};