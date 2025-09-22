import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatbotService from '../services/ChatbotService';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize session ID on component mount
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
    let cleaned = text.replace(/[[\]*]/g, '').trim();
    // Replace common delimiters with a period and a newline for better formatting
    cleaned = cleaned.replace(/\. /g, '.\n'); // Replace ". " with ".\n"
    cleaned = cleaned.replace(/: /g, ':\n'); // Replace ": " with ":\n"
    return cleaned;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
        maxWidth: '800px',
        margin: 'auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <Typography variant="h5" sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        AI Chatbot
      </Typography>
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
                maxWidth: '70%',
                wordBreak: 'break-word',
              }}
            >
              {msg.role === 'assistant' ? (
                (() => {
                  const imageUrls = [];
                  const textParts = [];
                  const urlRegex = /(https?:\/\/[^\s]+)/g; // Global flag to find all matches
                  let lastIndex = 0;
                  let match;

                  while ((match = urlRegex.exec(msg.content)) !== null) {
                    // Add text before the URL
                    if (match.index > lastIndex) {
                      textParts.push(msg.content.substring(lastIndex, match.index));
                    }
                    imageUrls.push(match[0]);
                    lastIndex = urlRegex.lastIndex;
                  }

                  // Add any remaining text after the last URL
                  if (lastIndex < msg.content.length) {
                    textParts.push(msg.content.substring(lastIndex));
                  }

                  return (
                    <>
                      {textParts.map((text, i) => {
                        const cleaned = cleanText(text);
                        return cleaned.split('\n').map((line, j) => (
                          line.trim() && <Typography key={`text-${i}-${j}`} variant="body1">{line.trim()}</Typography>
                        ));
                      })}
                      {imageUrls.map((url, i) => (
                        <img
                          key={`image-${i}`}
                          src={url}
                          alt="Product Image"
                          style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginTop: '8px' }}
                        />
                      ))}
                    </>
                  );
                })()
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
        />
        <IconButton color="primary" onClick={handleSendMessage} disabled={loading} sx={{ ml: 1 }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatbotPage;
