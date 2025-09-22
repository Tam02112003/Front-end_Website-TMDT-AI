import api from './api';

interface ChatbotRequest {
  question: string;
  session_id?: string;
}

interface ChatbotResponse {
  answer: string;
  history?: { role: string; content: string }[];
}

const sendMessage = (request: ChatbotRequest) => {
  return api.post<ChatbotResponse>('/chatbot/', request);
};

const ChatbotService = {
  sendMessage,
};

export default ChatbotService;
