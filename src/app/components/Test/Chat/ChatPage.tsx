import Chat from "./Chat";


const ChatPage: React.FC = () => {
    const currentUserId = "45aacdc2-8eee-4f65-9107-f9c251462633"; // Lấy từ JWT hoặc API
    const receiverUserId = "3e261276-634f-45b1-be69-b4d53ca7e7f3"; // Lấy từ chọn trong UI hoặc danh sách staff
  return <div style={{ padding: "50px" }}>
          <h2>Mini Chat</h2>
    <Chat currentUserId={currentUserId} receiverUserId={receiverUserId} />
  </div>;
}

export default ChatPage;
