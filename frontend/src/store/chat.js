import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    selectedConversation: null,
    messages: {},
    onlineUsers: new Set(),
    typingUsers: {}
  }),
  
  actions: {
    setConversations(conversations) {
      this.conversations = conversations
    },
    
    addConversation(conversation) {
      const exists = this.conversations.find(c => c._id === conversation._id)
      if (!exists) {
        this.conversations.unshift(conversation)
      }
    },
    
    updateConversation(conversationId, updates) {
      const conv = this.conversations.find(c => c._id === conversationId)
      if (conv) {
        Object.assign(conv, updates)
      }
    },
    
    selectConversation(conversation) {
      this.selectedConversation = conversation
    },
    
    setMessages(conversationId, messages) {
      this.messages[conversationId] = messages
    },
    
    addMessage(conversationId, message) {
      if (!this.messages[conversationId]) {
        this.messages[conversationId] = []
      }
      this.messages[conversationId].push(message)
      
      // Update last message in conversation
      const conv = this.conversations.find(c => c._id === conversationId)
      if (conv) {
        conv.lastMessage = message
      }
    },
    
    setUserOnline(userId) {
      this.onlineUsers.add(userId)
    },
    
    setUserOffline(userId) {
      this.onlineUsers.delete(userId)
    },
    
    setUserTyping(conversationId, userId, isTyping) {
      if (isTyping) {
        this.typingUsers[conversationId] = userId
      } else {
        delete this.typingUsers[conversationId]
      }
    },
    
    markAsRead(conversationId) {
      const conv = this.conversations.find(c => c._id === conversationId)
      if (conv) {
        conv.unreadCount = 0
      }
    },
    
    incrementUnread(conversationId) {
      const conv = this.conversations.find(c => c._id === conversationId)
      if (conv) {
        conv.unreadCount = (conv.unreadCount || 0) + 1
      }
    }
  },
  
  getters: {
    getConversationMessages: (state) => (conversationId) => {
      return state.messages[conversationId] || []
    },
    
    isUserOnline: (state) => (userId) => {
      return state.onlineUsers.has(userId)
    },
    
    isUserTyping: (state) => (conversationId) => {
      return !!state.typingUsers[conversationId]
    }
  }
})
