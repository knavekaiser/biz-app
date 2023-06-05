const baseApiUrl = "";

const endpoints = {
  baseApiUrl,

  topics: `${baseApiUrl}/api/chat/topics`,
  chat: `${baseApiUrl}/api/chat/:chat_id`,
};

export default endpoints;
