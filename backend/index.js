const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// 初始化数据库
const initDatabase = require('./db/initDatabase');
initDatabase();

app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/openai-chat', require('./routes/openai-chat'));
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/', require('./routes/auth'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
