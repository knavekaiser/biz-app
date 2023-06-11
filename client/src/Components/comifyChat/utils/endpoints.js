const baseApiUrl = "";

const endpoints = {
  baseApiUrl,

  topics: `${baseApiUrl}/api/chat/topics`,
  chat: `${baseApiUrl}/api/chat/:chat_id`,
  message: `${baseApiUrl}/api/chat/:chat_id/:message_id`,
};

export default endpoints;
