import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import AIChatBox from '../components/AIChatBox';
// 欢迎卡片样式
const WelcomeCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#1a4fba',
  color: '#fff',
  borderRadius: '19px',
  padding: theme.spacing(4),
  height: '100%',
  boxShadow: 'none',
}));

// 白色通用卡片样式
const WhiteCard = styled(Card)(({ theme }) => ({
  borderRadius: '19px',
  padding: theme.spacing(3),
  backgroundColor: '#fff',
  height: '100%',
}));

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const username = user?.username || 'Guest';
  const role = user?.role || 'guest';
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 第二行动态提示语
  const secondaryLine =
    role === 'employer'
      ? `Employer ${username} , Ready to find the best talents today?`
      : `Candidate ${username} , Let’s find your dream job!`;

  return (
    <Box display="flex" flexDirection="column" gap={4}>


      <Box display="flex" gap={3}>

        <Box flex={2}>
          <WelcomeCard>
            <Typography variant="h5" gutterBottom>
              Welcome back, {username} 👋
            </Typography>
            <Typography variant="h6" mt={1}>
              {secondaryLine}
            </Typography>
          </WelcomeCard>
        </Box>

        <Box flex={1}>
          <WhiteCard>
            <Typography variant="subtitle1"></Typography>
            <Typography fontSize="1.5rem" mt={1}>
              {currentTime}
            </Typography>
          </WhiteCard>
        </Box>
      </Box>

      <WhiteCard>
        <Typography variant="h6" mb={2}>AI Chat Assistant</Typography>
        <AIChatBox />
      </WhiteCard>
    </Box>
  );
};

export default Dashboard;
