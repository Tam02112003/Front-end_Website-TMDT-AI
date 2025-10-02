import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress, IconButton, Fab } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ChatbotService from '../services/ChatbotService';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatbotSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      localStorage.setItem('chatbotSessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await ChatbotService.sendMessage({
        question: userMessage.content,
        session_id: sessionId,
      });
      const botMessage: Message = { role: 'assistant', content: response.data.answer };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (err: any) {
      const errorMessage: Message = { role: 'assistant', content: `Error: ${err.response?.data?.detail || err.message}` };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      console.error('Chatbot error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleSendMessage();
    }
  };

  const cleanText = (text: string) => {
    let cleaned = text
      .replace(/[[\\]*]/g, '')
      .trim();
    cleaned = cleaned.replace(/\. /g, '.\n');
    cleaned = cleaned.replace(/: /g, ':\n');
    return cleaned;
  };

const renderMessageContent = (content: string) => {
  // Giữ link ảnh, bỏ "[Xem ảnh(...)]"
  content = content.replace(/\[Xem ảnh\((.*?)\)\]/gi, '$1');

  // Loại bỏ "- Hình ảnh:" và các dòng chỉ có "-"
  content = content.replace(/- *Hình ảnh:*/gi, '');
  content = content.replace(/^- *$/gm, '');

  const parts: (string | JSX.Element)[] = [];
  const regex = /!\[.*?\]\((.*?)\)|(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|bmp|svg|webp))/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textPart = content.substring(lastIndex, match.index);
      parts.push(textPart);
    }

    const imageUrl = match[1] || match[0];
    parts.push(
      <img
        key={`image-${lastIndex}`}
        src={imageUrl}
        alt=""
        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginTop: '8px' }}
      />
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    const textPart = content.substring(lastIndex);
    parts.push(textPart);
  }

  return parts.map((part, i) => {
    if (typeof part === 'string') {
      const cleaned = cleanText(part);
      return cleaned.split('\n').map((line, j) => (
        line.trim() && <Typography key={`text-${i}-${j}`} variant="body1">{line.trim()}</Typography>
      ));
    }
    return part;
  });
};




  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      {isOpen ? (
        <Paper
          elevation={8}
          sx={{
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">AI Chatbot</Typography>
            <IconButton onClick={toggleChatbot} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: '20px',
                    bgcolor: msg.role === 'user' ? '#e0f7fa' : '#ffffff',
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.role === 'assistant' ? (
                    renderMessageContent(msg.content)
                  ) : (
                    <Typography variant="body1">{msg.content}</Typography>
                  )}
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
          <Box sx={{ p: 2, borderTop: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              size="small"
            />
            <IconButton color="primary" onClick={handleSendMessage} disabled={loading || !input.trim()} sx={{ ml: 1 }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      ) : (
        <Fab color="primary" aria-label="chat" onClick={toggleChatbot}>
          <ChatIcon />
        </Fab>
      )}
    </Box>
  );
};

export default Chatbot;
