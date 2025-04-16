import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Avatar, CircularProgress, Tabs, Tab, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from 'react-markdown';

const botConfig = {
  candidate: [
    { name: 'CareerBot', avatar: '/images/avatars/careerbot.png', taskType: 'careerbot' },
    { name: 'SkillBot', avatar: '/images/avatars/skillbot.png', taskType: 'skillbot' }
  ],
  employer: [
    { name: 'MatchBot', avatar: '/images/avatars/matchbot.png', taskType: 'matchbot' },
    { name: 'JobWriterBot', avatar: '/images/avatars/jobwriter.png', taskType: 'jobwriterbot' }
  ]
};

const AIChatBox = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'candidate';
  const bots = botConfig[role];
  const [tab, setTab] = useState(0);
  const [messagesMap, setMessagesMap] = useState({});
  const [conversationMap, setConversationMap] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const currentBot = bots[tab];
  const currentMessages = messagesMap[tab] || [];
  const currentConversationId = conversationMap[tab];

  useEffect(() => {
    const fetchConversation = async () => {
      const res = await fetch('/api/messages/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role, botName: currentBot.name, taskType: currentBot.taskType })
      });
      const data = await res.json();
      const conversationId = data.conversationId;
      const history = data.messages || [];

      setConversationMap(prev => ({ ...prev, [tab]: conversationId }));
      setMessagesMap(prev => ({ ...prev, [tab]: history }));
    };
    fetchConversation();
  }, [tab]);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messagesMap]);

  const sendMessageToDB = async (conversationId, type, content) => {
    await fetch(`/api/messages/${currentBot.name.toLowerCase()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, type, content })
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', text: input, name: user.username };
    const updated = [...currentMessages, userMessage];
    setMessagesMap(prev => ({ ...prev, [tab]: updated }));
    setInput('');
    setLoading(true);

    await sendMessageToDB(currentConversationId, 'receive', input);

    try {
      const res = await fetch('/api/openai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          role,
          taskType: currentBot.taskType,
          user,
          conversationId: currentConversationId
        })
      });
      const data = await res.json();
      const aiReply = { role: 'ai', text: data.reply, name: currentBot.name };
      const all = [...updated, aiReply];
      setMessagesMap(prev => ({ ...prev, [tab]: all }));
      await sendMessageToDB(currentConversationId, 'send', data.reply);
    } catch (err) {
      const fallback = { role: 'ai', text: 'Something went wrong.', name: currentBot.name };
      setMessagesMap(prev => ({ ...prev, [tab]: [...updated, fallback] }));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    const res = await fetch(`/api/messages/${currentBot.name.toLowerCase()}/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: currentConversationId, userId: user.id, botName: currentBot.name, role })
    });
    const data = await res.json();
    setConversationMap(prev => ({ ...prev, [tab]: data.newConversationId }));
    setMessagesMap(prev => ({ ...prev, [tab]: data.newMessages }));
  };

  return (
    <Box display="flex" flexDirection="column" height="100%" p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)} textColor="primary" indicatorColor="primary">
          {bots.map((bot, i) => (
            <Tab key={bot.name} label={
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar src={bot.avatar} sx={{ width: 24, height: 24 }} />
                <span>{bot.name}</span>
              </Box>
            } />
          ))}
        </Tabs>
        <IconButton onClick={handleClear} title="Clear Chat History">
          <DeleteIcon />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 310, maxHeight: 310,p: 2, border: '1px solid #ccc',borderRadius: 2,bgcolor: '#fff',}}>

        {currentMessages.map((msg, idx) => (
          <Box key={idx} display="flex" flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'} gap={1} mb={2}>
           <Avatar src={msg.role === 'ai' ? currentBot.avatar : undefined}>
  {(!msg.role || msg.role === 'user') && msg.name ? msg.name[0] : ''}
</Avatar>

            <Box maxWidth="75%">
              <Box fontWeight="bold">{msg.name}</Box>
              <Box p={1.5} bgcolor={msg.role === 'user' ? '#e3f2fd' : '#f1f8e9'} borderRadius={2}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </Box>
            </Box>
          </Box>
        ))}
        {loading && <Box display="flex" justifyContent="center"><CircularProgress size={20} /></Box>}
        <div ref={endRef} />
      </Box>

      <Box mt={2} display="flex" gap={2}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <Button variant="contained" onClick={handleSend} disabled={loading}>SEND</Button>
      </Box>
    </Box>
  );
};

export default AIChatBox;
