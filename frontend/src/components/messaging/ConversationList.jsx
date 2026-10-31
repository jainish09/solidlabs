import React, { useState, useMemo } from 'react';
import { Search, Filter, MessageSquare, Check, CheckCheck, Clock, Box, Building, User } from 'lucide-react';
import Badge from '../common/Badge';

export const ConversationList = ({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  role = 'customer',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  // Filtered conversation list
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const counterpartName = role === 'customer' ? conv.manufacturerName : conv.customerName;
      const matchesSearch =
        counterpartName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.lastMessageText && conv.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()));

      const unreadCount = role === 'customer' ? conv.unreadCountCustomer : conv.unreadCountManufacturer;
      const matchesUnread = !filterUnreadOnly || unreadCount > 0;

      return matchesSearch && matchesUnread;
    });
  }, [conversations, searchQuery, filterUnreadOnly, role]);

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col h-full select-none shrink-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-100 space-y-3 bg-[#F5F5F3]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold font-heading text-[#111111]">
              Messages
            </h2>
            <Badge variant="teal" size="xs">
              {conversations.length}
            </Badge>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#858585]">
            {role === 'customer' ? 'Buyer Inbox' : 'Vendor Inbox'}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858585]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suppliers, parts or messages..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-body text-[#111111] placeholder:text-[#858585] focus:outline-none focus:border-[#FF7138] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#858585] hover:text-[#111111] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnreadOnly(false)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              !filterUnreadOnly
                ? 'bg-[#111111] text-white font-semibold'
                : 'bg-white border border-gray-200 text-[#858585] hover:bg-gray-100'
            }`}
          >
            All Threads
          </button>
          <button
            onClick={() => setFilterUnreadOnly(true)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterUnreadOnly
                ? 'bg-[#FF7138] text-white font-semibold'
                : 'bg-white border border-gray-200 text-[#858585] hover:bg-gray-100'
            }`}
          >
            <span>Unread</span>
            {conversations.some((c) => (role === 'customer' ? c.unreadCountCustomer : c.unreadCountManufacturer) > 0) && (
              <span className="w-2 h-2 rounded-full bg-[#FF7138] animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Conversations Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F5F5F3] flex items-center justify-center text-[#858585]">
              <MessageSquare size={20} />
            </div>
            <p className="text-xs font-bold font-heading text-[#111111]">No conversations found</p>
            <p className="text-[11px] text-[#858585] font-body">
              {searchQuery ? 'Try clearing your search query.' : 'Browse products to initiate conversations with certified suppliers.'}
            </p>
            {(searchQuery || filterUnreadOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterUnreadOnly(false);
                }}
                className="text-xs font-mono text-[#FF7138] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConversationId;
            const counterpartName = role === 'customer' ? conv.manufacturerName : conv.customerName;
            const counterpartAvatar = role === 'customer' ? conv.manufacturerLogo : (conv.customerAvatar || 'CU');
            const unreadCount = role === 'customer' ? conv.unreadCountCustomer : conv.unreadCountManufacturer;
            const isOnline = role === 'customer' ? conv.manufacturerOnline : conv.customerOnline;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                  isSelected
                    ? 'bg-[#F5F5F3] border-l-4 border-l-[#FF7138]'
                    : 'hover:bg-gray-50/80 bg-white'
                }`}
              >
                {/* Avatar with Online Status */}
                <div className="relative shrink-0 mt-0.5">
                  <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center font-heading font-black text-xs shadow-xs border border-gray-700">
                    {counterpartAvatar}
                  </div>
                  {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" title="Online now" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className={`text-xs font-bold font-heading truncate ${unreadCount > 0 ? 'text-[#111111] font-black' : 'text-[#111111]'}`}>
                      {counterpartName}
                    </h3>
                    <span className="text-[10px] font-mono text-[#858585] shrink-0">
                      {conv.lastMessageTimestamp}
                    </span>
                  </div>

                  {/* Product Tag */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#FF7138] truncate">
                    <Box size={10} className="shrink-0" />
                    <span className="truncate">{conv.productName}</span>
                  </div>

                  {/* Last message preview */}
                  <p className={`text-xs font-body line-clamp-1 leading-snug ${unreadCount > 0 ? 'text-[#111111] font-semibold' : 'text-[#858585]'}`}>
                    {conv.lastMessageText || 'No messages yet'}
                  </p>
                </div>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                  <span className="shrink-0 self-center w-5 h-5 rounded-full bg-[#FF7138] text-white text-[10px] font-bold font-mono flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Demo State Footer */}
      <div className="p-3 border-t border-gray-100 bg-[#F5F5F3]/50 text-[10px] font-mono text-[#858585] flex items-center justify-between">
        <span>Connect v2.4</span>
        <span className="text-[#20B8A5]">Peer-to-Peer Encrypted</span>
      </div>
    </div>
  );
};

export default ConversationList;

