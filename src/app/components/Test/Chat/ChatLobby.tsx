// src/pages/ChatLobby.tsx
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Room {
    id: string;
    name: string;
    creatorUserId: string;
}

export const ChatLobby = ({ currentUser, token }) => {
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [openRooms, setOpenRooms] = useState<Room[]>([]);
    const [newRoomName, setNewRoomName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(`https://localhost:44306/lobbyhub?access_token=${token}`)
            .withAutomaticReconnect()
            .build();
        setConnection(newConnection);
    }, [token]);

    useEffect(() => {
    if (connection) {
        connection.start()
            .then(() => {
                console.log('Lobby Hub Connected!');
                
                // ... (các listener cũ: UpdateRoomList, NewRoomCreated, RoomClosed, PartnerJoined, JoinSuccess)
                connection.on('UpdateRoomList', (rooms: Room[]) => setOpenRooms(rooms));
                connection.on('NewRoomCreated', (newRoom: Room) => {
                    setOpenRooms(prev => [...prev, newRoom]);
                });
                connection.on('RoomClosed', (roomId: string) => {
                    setOpenRooms(prev => prev.filter(room => room.id !== roomId));
                });
                connection.on('PartnerJoined', (room: Room) => {
                    console.log('Partner joined your room!', room);
                    navigate(`/chat-room/${room.id}`);
                });
                connection.on('JoinSuccess', (room: Room) => {
                    console.log('Successfully joined room!', room);
                    navigate(`/chat-room/${room.id}`);
                });

                // THÊM LISTENER MỚI ĐỂ XỬ LÝ LỖI
                connection.on('JoinRoomFailed', (errorMessage: string) => {
                    console.error('Join Room Failed:', errorMessage);
                    alert(`Không thể tham gia phòng: ${errorMessage}`); // Hiển thị lỗi cho người dùng
                });

            })
            .catch(e => console.error('Connection failed: ', e));

        return () => { 
            connection.off('JoinRoomFailed'); // Dọn dẹp listener khi component unmount
            connection.stop(); 
        };
    }
}, [connection, navigate]);
    const handleCreateRoom = async () => {
        if (connection && newRoomName.trim()) {
            try {
                const newRoomId = await connection.invoke('CreateRoom', newRoomName);
                navigate(`/chat-room/${newRoomId}`);
            } catch (e) {
                console.error('Failed to create room: ', e);
            }
        }
    };

    const handleJoinRoom = async (roomId: string) => {
        if (connection) {
            try {
                // Chỉ gọi invoke, không navigate. Việc navigate sẽ do event 'JoinSuccess' xử lý.
                await connection.invoke('JoinRoom', roomId);
                console.log(`Joining room ${roomId}...`);
            } catch (e) {
                console.error('Failed to join room: ', e);
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Sảnh Chờ Chat</h1>
            <div className="mb-6 p-4 border rounded-lg bg-white">
                <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Tên phòng chat mới"
                    className="border p-2 rounded-md mr-2"
                />
                <button onClick={handleCreateRoom} className="bg-green-500 text-white px-4 py-2 rounded-md">
                    Tạo phòng
                </button>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">Các phòng đang mở</h2>
                <div className="space-y-2">
                    {openRooms.map(room => (
                        <div key={room.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow">
                            <div>
                               <span className="font-bold">{room.name}</span>
                               <span className="text-sm text-gray-500 ml-2">(Tạo bởi: {room.creatorUserId})</span>
                            </div>
                            {room.creatorUserId !== currentUser.id && (
                               <button onClick={() => handleJoinRoom(room.id)} className="bg-blue-500 text-white px-3 py-1 rounded-md cursor-pointer hover:bg-blue-600 transition">
                                  Tham gia
                               </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};