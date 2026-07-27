// src/modules/notifications/templates/push/new-message.ts
export const newMessageTemplate = (data: any) => ({
  title: 'New Message',
  body: `${data.senderName}: ${data.message}`,
  data: {
    type: 'new_message',
    chatId: data.chatId,
    senderId: data.senderId,
  },
});