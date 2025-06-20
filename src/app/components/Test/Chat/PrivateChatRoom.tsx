// src/pages/PrivateChatRoom.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

// Interface cho tin nhắn, thêm timestamp và status
interface IMessage {
    id: string; // Dùng để xác định trạng thái
    senderId: string;
    text: string;
    timestamp: Date;
    status: 'sending' | 'sent' | 'failed';
}

export const PrivateChatRoom = ({ currentUser, token }) => {
    const { roomId } = useParams<{ roomId: string }>();
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [roomInfo, setRoomInfo] = useState<any>(null); // Để lưu thông tin phòng
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Kết nối đến Hub
    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(`https://localhost:44306/chatroomhub?access_token=${token}`)
            .withAutomaticReconnect()
            .build();
        setConnection(newConnection);
    }, [token]);

    // Xử lý kết nối và lắng nghe sự kiện
    useEffect(() => {
        if (connection && roomId) {
            connection.start()
                .then(() => {
                    console.log('Chat Room Hub Connected!');
                    
                    // 1. Tham gia group SignalR của phòng chat
                    connection.invoke('JoinSpecificRoom', roomId);

                    // 2. Tải lịch sử chat
                    //connection.invoke('LoadHistory', roomId);

                    // 3. Lắng nghe tin nhắn mới
                    connection.on('ReceiveRoomMessage', (senderId: string, text: string, timestamp: string) => {
                        const receivedMessage: IMessage = { 
                            id: new Date(timestamp).toISOString(), 
                            senderId, 
                            text, 
                            timestamp: new Date(timestamp),
                            status: 'sent' 
                        };
                        
                        // Cập nhật tin nhắn đã gửi từ chính mình (nếu có) hoặc thêm tin nhắn mới
                        setMessages(prev => {
                            const existing = prev.find(m => m.status === 'sending' && m.text === text);
                            if (existing && senderId === currentUser.id) {
                                return prev.map(m => m.id === existing.id ? { ...m, status: 'sent', timestamp: new Date(timestamp) } : m);
                            }
                            return [...prev, receivedMessage];
                        });
                    });

                    // 4. Lắng nghe lịch sử chat
                    connection.on('ReceiveHistory', (history: any[]) => {
                        const formattedHistory: IMessage[] = history.map(msg => ({
                           id: new Date(msg.timestamp).toISOString(),
                           senderId: msg.senderId,
                           text: msg.text,
                           timestamp: new Date(msg.timestamp),
                           status: 'sent'
                        }));
                        setMessages(formattedHistory);
                    });
                })
                .catch(e => console.error('Connection failed: ', e));

            return () => { connection.stop(); };
        }
    }, [connection, roomId, currentUser.id]);

    // Cuộn xuống tin nhắn cuối cùng
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (connection && newMessage.trim() && roomId) {
            const tempId = Date.now().toString();
            const messageToSend: IMessage = {
                id: tempId,
                senderId: currentUser.id,
                text: newMessage.trim(),
                timestamp: new Date(),
                status: 'sending'
            };

            setMessages(prev => [...prev, messageToSend]);
            setNewMessage('');

            try {
                await connection.invoke('SendRoomMessage', roomId, messageToSend.text);
            } catch (error) {
                console.error("Failed to send message:", error);
                setMessages(prev => prev.map(msg => 
                    msg.id === tempId ? { ...msg, status: 'failed' } : msg
                ));
            }
        }
    };
    
    const getPartnerId = () => {
      if (!roomInfo) return '...';
      return roomInfo.creatorUserId === currentUser.id ? roomInfo.partnerUserId : roomInfo.creatorUserId;
    }

    // Giao diện JSX được nâng cấp
    return (
        <div className="flex flex-col h-[600px] w-full max-w-lg mx-auto border rounded-lg bg-white shadow-lg mt-10">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div>
                   <span className="font-bold">Phòng: {roomId}</span>
                   {/* <span className="text-sm text-gray-600 ml-4">Nói chuyện với: {getPartnerId()}</span> */}
                </div>
                <Link to="/chat" className="text-sm text-blue-500 hover:underline">Quay lại sảnh</Link>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex mb-3 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-3 py-2 max-w-xs md:max-w-md`}>
                             <div className={`p-3 rounded-xl ${msg.senderId === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="text-sm">{msg.text}</p>
                             </div>
                             <div className={`text-xs text-gray-400 mt-1 flex items-center ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                {msg.senderId !== 'system' && msg.senderId.substring(0, 8)} | {new Date(msg.timestamp).toLocaleTimeString()}
                                {msg.senderId === currentUser.id && (
                                    <span className="ml-2">
                                        {msg.status === 'sending' && '⏳'}
                                        {msg.status === 'sent' && '✓'}
                                        {msg.status === 'failed' && '❌'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t flex bg-white">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tin nhắn..."
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 disabled:bg-gray-400" disabled={!newMessage.trim()}>
                    Gửi
                </button>
            </form>
        </div>
    );
};