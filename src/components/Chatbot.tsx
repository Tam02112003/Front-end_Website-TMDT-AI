import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Typography, Paper, CircularProgress, IconButton, Fab, Link as MuiLink } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ChatbotService from '../services/ChatbotService';
import { v4 as uuidv4 } from 'uuid';
import { colors } from '../theme';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

  const markdownComponents = {
    p: ({ children }: any) => <Typography variant="body1" sx={{ mb: 1, '&:last-child': { mb: 0 } }}>{children}</Typography>,
    h1: ({ children }: any) => <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>{children}</Typography>,
    h2: ({ children }: any) => <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>{children}</Typography>,
    h3: ({ children }: any) => <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>{children}</Typography>,
    ul: ({ children }: any) => <Box component="ul" sx={{ pl: 3, m: 0, mb: 1 }}>{children}</Box>,
    ol: ({ children }: any) => <Box component="ol" sx={{ pl: 3, m: 0, mb: 1 }}>{children}</Box>,
    li: ({ children }: any) => <Typography component="li" variant="body2" sx={{ mb: 0.25 }}>{children}</Typography>,
    a: ({ children, href }: any) => <MuiLink href={href} target="_blank" rel="noopener noreferrer" sx={{ color: colors.jadeBright }}>{children}</MuiLink>,
    img: ({ src, alt }: any) => (
      <Box component="img" src={src} alt={alt || ''} sx={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', mt: 1, display: 'block' }} />
    ),
    hr: () => <Box component="hr" sx={{ border: 'none', borderTop: `1px solid ${colors.border}`, my: 1 }} />,
    code: ({ children }: any) => (
      <Box component="code" sx={{ bgcolor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '4px', px: 0.5, fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.85em' }}>
        {children}
      </Box>
    ),
    table: ({ children }: any) => <Box component="table" sx={{ borderCollapse: 'collapse', width: '100%', mb: 1, fontSize: '0.85em' }}>{children}</Box>,
    th: ({ children }: any) => <Box component="th" sx={{ border: `1px solid ${colors.border}`, p: 0.5, textAlign: 'left' }}>{children}</Box>,
    td: ({ children }: any) => <Box component="td" sx={{ border: `1px solid ${colors.border}`, p: 0.5 }}>{children}</Box>,
  };

  const renderMessageContent = (content: string) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
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
            border: `1px solid ${colors.border}`,
          }}
        >
          <Box sx={{ p: 2, bgcolor: colors.jade, color: '#0D1210', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: '#0D1210' }}>AI Chatbot</Typography>
            <IconButton onClick={toggleChatbot} size="small" sx={{ color: '#0D1210' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: colors.bg }}>
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
                    bgcolor: msg.role === 'user' ? colors.jade : colors.surfaceRaised,
                    borderColor: colors.border,
                    color: msg.role === 'user' ? '#0D1210' : colors.ink,
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.role === 'assistant' ? (
                    renderMessageContent(msg.content)
                  ) : (
                    <Typography variant="body1" sx={{ color: '#0D1210' }}>{msg.content}</Typography>
                  )}
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <CircularProgress size={20} sx={{ color: colors.jade }} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
          <Box sx={{ p: 2, borderTop: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', bgcolor: colors.surface }}>
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
