import { useState, useEffect, useRef } from 'react';
import { Search, Send, Image as ImageIcon, Smile, LogOut, MessageSquare, Loader, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore'; 


function ChatPage() {
  const { signout, authUser } = useAuthStore();
  const { 
    messages, 
    contacts, 
    getContacts, 
    getMessages, 
    selectedUser, 
    setSelectedUser, 
    sendMessage,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages
  } = useChatStore();

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  useEffect(() => {
      // Nếu chưa chọn ai để chat thì không làm gì cả
      if (!selectedUser) return;

      // Bật công tắc lắng nghe tin nhắn của người này
      subscribeToMessages();

      // Cleanup function: Khi đổi sang người khác hoặc unmount, tắt lắng nghe người cũ
      return () => {
        unsubscribeFromMessages();
      };
  }, [selectedUser, subscribeToMessages, unsubscribeFromMessages]);
  useEffect(() => {
    getContacts();
  }, [getContacts]);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (messagesEndRef.current && messages) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra dung lượng (giới hạn 5MB cho nhẹ)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreview(reader.result); // Lưu chuỗi Base64 vào state
    };
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() && !imagePreview) return; // Nếu không có chữ VÀ không có ảnh thì chặn

    sendMessage({
      receiverId: selectedUser._id,
      text: messageInput.trim(),
      image: imagePreview // Gửi chuỗi Base64 của ảnh đi
    });
    
    // Reset lại form sau khi gửi
    setMessageInput('');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-6xl h-[90vh] flex bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">
      
  
      <div className="w-80 flex flex-col border-r border-slate-700/50 bg-slate-900/20">
        

        <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-xl shadow-lg">
              <MessageSquare className="size-5 text-white" />
            </div>
            <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
              ChatApp
            </span>
          </div>
          <button 
            onClick={signout} 
            className="p-2 text-slate-400 hover:text-pink-500 hover:bg-slate-800/50 rounded-xl transition-all"
            title="Đăng xuất"
          >
            <LogOut className="size-5" />
          </button>
        </div>

   
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm liên hệ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-cyan-500 text-white placeholder-slate-500 transition-colors shadow-inner" 
            />
          </div>
        </div>


        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 custom-scrollbar">
          {filteredContacts.length === 0 ? (
            <div className="text-center text-slate-500 text-sm mt-4">Không tìm thấy ai</div>
          ) : (
            filteredContacts.map((contact) => (
              <div 
                key={contact._id} 
                onClick={() => setSelectedUser(contact)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedUser?._id === contact._id 
                    ? 'bg-slate-700/60 border border-slate-600/50 shadow-md' 
                    : 'hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="relative">
                  <div className="size-12 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 size-3.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-200 truncate">{contact.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{contact.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>


      <div className="flex-1 flex flex-col relative bg-slate-900/10">
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="p-6 bg-slate-800/30 rounded-full mb-4 shadow-inner">
              <MessageSquare className="size-16 opacity-50 text-cyan-500" />
            </div>
            <p className="text-lg font-medium text-slate-300">Chào mừng đến với ChatApp</p>
            <p className="text-sm">Chọn một cuộc hội thoại bên trái để bắt đầu</p>
          </div>
        ) : (
          
          <>
            
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/40 backdrop-blur-md flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-white">{selectedUser.name}</h2>
                  <p className="text-xs text-cyan-400 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-green-500 block"></span>
                    Đang hoạt động
                  </p>
                </div>
              </div>
            </div>

            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar flex flex-col">
              {isMessagesLoading ? (
                <div className="flex-1 flex justify-center items-center">
                  <Loader className="size-8 animate-spin text-cyan-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex justify-center items-center text-slate-500 text-sm">
                  Hãy gửi lời chào đầu tiên tới {selectedUser.name}!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === authUser._id;
                  return (
                    // THÊM LẠI THẺ DIV NÀY ĐỂ CĂN LỀ TRÁI/PHẢI VÀ ÔM VỪA NỘI DUNG:
                    <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      
                      {/* Thẻ bong bóng chat của bạn đưa vào bên trong */}
                      <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-lg ${
                        isMe 
                          ? 'bg-gradient-to-br from-cyan-600 to-pink-600 text-white rounded-tr-sm' 
                          : 'bg-slate-700/80 border border-slate-600/50 text-slate-200 rounded-tl-sm backdrop-blur-sm'
                      }`}>
                        {/* NẾU CÓ ẢNH, HIỂN THỊ ẢNH TRƯỚC */}
                        {msg.image && (
                          <img 
                            src={msg.image} 
                            alt="attachment" 
                            className="max-w-[200px] sm:max-w-[250px] rounded-lg mb-2 object-cover"
                          />
                        )}
                        {/* NẾU CÓ CHỮ, HIỂN THỊ CHỮ */}
                        {msg.text && <p className="leading-relaxed break-words">{msg.text}</p>}
                      </div>
                      
                    </div>
                  );
                })
              )}
              
              <div ref={messagesEndRef} />
            </div>

            
            {/* KHU VỰC NHẬP TIN NHẮN */}
              <div className="bg-slate-800/40 border-t border-slate-700/50 relative backdrop-blur-md z-10 flex flex-col">
                
                {/* KHUNG PREVIEW ẢNH (Hiển thị khi bạn vừa chọn ảnh xong) */}
                {imagePreview && (
                  <div className="p-4 flex items-center gap-4 border-b border-slate-700/50">
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-600" />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute -top-2 -right-2 bg-slate-800 text-slate-300 rounded-full p-1 border border-slate-600 hover:text-red-400"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="p-4 flex items-center gap-3">
                  {/* NÚT CHỌN ẢNH (Kích hoạt input file ẩn) */}
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 transition-colors ${imagePreview ? "text-cyan-400" : "text-slate-400 hover:text-cyan-400"}`}
                  >
                    <ImageIcon className="size-5" />
                  </button>
                  
                  {/* INPUT FILE ẨN */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                  />

                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Nhập tin nhắn..." 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-slate-900/60 border border-slate-600/50 rounded-full text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:bg-slate-800 transition-all shadow-inner"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-400 transition-colors">
                      <Smile className="size-5" />
                    </button>
                  </div>
                  <button 
                    type="submit" 
                    disabled={!messageInput.trim() && !imagePreview}
                    className="p-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full text-white hover:scale-105 active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Send className="size-5 ml-0.5" />
                  </button>
                </form>
              </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatPage;