import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConversationList from '../../components/messaging/ConversationList';
import ActiveChat from '../../components/messaging/ActiveChat';

export const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const {
    conversations,
    role,
    sendMessage,
    submitQuotationFromChat,
    markConversationAsRead,
    typingInConversation,
  } = useAuth();

  // Active selected conversation id
  const [activeConvId, setActiveConvId] = useState(conversationId || conversations[0]?.id || null);
  // Mobile responsive toggle
  const [mobileShowChat, setMobileShowChat] = useState(Boolean(conversationId));

  // Sync route param with state
  useEffect(() => {
    if (conversationId) {
      setActiveConvId(conversationId);
      setMobileShowChat(true);
      markConversationAsRead(conversationId);
    } else if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
      markConversationAsRead(conversations[0].id);
    }
  }, [conversationId, conversations]);

  const handleSelectConversation = (id) => {
    setActiveConvId(id);
    setMobileShowChat(true);
    markConversationAsRead(id);
    navigate(`/${role}/messages/${id}`, { replace: true });
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0] || null;

  return (
    <div className="h-[calc(100vh-7rem)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar List: Hidden on mobile when viewing chat */}
        <div className={`w-full md:w-auto h-full ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConvId}
            onSelectConversation={handleSelectConversation}
            role={role}
          />
        </div>

        {/* Right Active Chat: Hidden on mobile when viewing list */}
        <div className={`flex-1 h-full ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          <ActiveChat
            conversation={activeConversation}
            role={role}
            onSendMessage={sendMessage}
            onSubmitQuotationResponse={submitQuotationFromChat}
            typingInConversation={typingInConversation}
            onBackToList={handleBackToList}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

