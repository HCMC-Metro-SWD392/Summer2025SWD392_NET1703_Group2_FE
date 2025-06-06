import React, { useEffect, useRef, useState, useCallback } from "react";
import * as SignalR from "@microsoft/signalr";

interface Message {
  id: string;
  from: string;
  text: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'failed';
}

interface ChatProps {
  currentUserId: string;
  receiverUserId: string;
}

const Chat: React.FC<ChatProps> = ({ currentUserId, receiverUserId }) => {
  const [connection, setConnection] = useState<SignalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newConnection = new SignalR.HubConnectionBuilder()
      .withUrl("https://localhost:44306/chatHub", {
        accessTokenFactory: () => localStorage.getItem("accessToken") || "",
      })
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await newConnection.start();
        console.log("Connected to chat hub");
        setIsConnected(true);
        
        // Register event handlers after connection is established
        newConnection.on("ReceiveMessage", (fromUserId: string, message: string, messageId: string) => {
          // Only add messages from OTHER users, ignore your own
          if (fromUserId !== currentUserId) {
            const newMessage: Message = {
              id: messageId,
              from: fromUserId,
              text: message,
              timestamp: new Date(),
              status: 'sent'
            };
            setMessages(prev => [...prev, newMessage]);
          }
          // Remove the else block - don't process your own messages here
        });

        newConnection.on("MessageSent", (messageId: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, status: 'sent' } : msg
          ));
        });

        newConnection.on("MessageError", (messageId: string, error: string) => {
          console.error("Message error:", error);
          setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, status: 'failed' } : msg
          ));
        });

      } catch (err) {
        console.error("Error connecting to chat hub:", err);
        setIsConnected(false);
      }
    };

    newConnection.onclose(() => {
      setIsConnected(false);
    });

    newConnection.onreconnected(() => {
      setIsConnected(true);
    });

    startConnection();
    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []); // Remove currentUserId from dependencies

  const sendMessage = useCallback(async () => {
    if (input.trim() && connection && isConnected) {
      const messageId = Date.now().toString(); // Better to use UUID
      const newMessage: Message = {
        id: messageId,
        from: currentUserId,
        text: input.trim(),
        timestamp: new Date(),
        status: 'sending'
      };

      // Add message with sending status
      setMessages(prev => [...prev, newMessage]);
      setInput("");

      try {
        await connection.invoke("SendMessage", receiverUserId, input.trim(), messageId);
      } catch (error) {
        console.error("Error sending message:", error);
        // Mark message as failed
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'failed' } : msg
        ));
      }
    }
  }, [input, connection, isConnected, currentUserId, receiverUserId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log(messages);
  }, [messages]);

  return (
    <div className="w-full max-w-md mx-auto p-4 border rounded shadow-md bg-white">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Mini Chat</h2>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
             title={isConnected ? 'Connected' : 'Disconnected'} />
      </div>

      <div className="flex flex-col gap-2 h-80 overflow-y-auto border rounded p-2 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
              msg.from === currentUserId
                ? "bg-green-100 self-end text-right"
                : "bg-white self-start text-left"
            } shadow relative`}
          >
            {msg.text}
            {msg.from === currentUserId && (
              <div className="text-xs mt-1 opacity-60">
                {msg.status === 'sending' && '⏳'}
                {msg.status === 'sent' && '✓'}
                {msg.status === 'failed' && '❌'}
              </div>
            )}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="flex items-center gap-2 mt-4">
        <input
          type="text"
          className="flex-grow border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-green-300"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || !isConnected}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-sm px-4 py-2 rounded transition"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default Chat;
