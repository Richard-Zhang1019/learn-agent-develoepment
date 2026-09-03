import * as dotenv from 'dotenv';
import express from 'express';
import { type ChatConfig, Ling } from "@bearbobo/ling";
import { pipeline } from 'node:stream/promises';
import { createEventChannel, getEventChannel } from './lib/service/eventChannel';
import { getContext } from './lib/config/context';

dotenv.config({
  path: ['.env.local', '.env']
});

const apiKey: string = process.env.VITE_DEEPSEEK_API_KEY as string;
const endpoint: string = process.env.VITE_DEEPSEEK_ENDPOINT as string;
const modelName: string = process.env.VITE_DEEPSEEK_MODEL as string;

const app = express();
const port: number = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/chat', async (req, res) => {
  console.log('req at line 23:', req?.body)
  const { message, sessionId, timeline } = req?.body;
  const config = {
    model_name: modelName,
    api_key: apiKey,
    endpoint: endpoint,
    sse: true,
  };
  const context = getContext(timeline);

  // ------- The work flow start --------
  const ling = new Ling(config);
  const bot = ling.createBot('reply', {}, {
    response_format: { type: "text" },
  });
  bot.addPrompt(context);

  bot.chat(message);

  ling.close();

  res.send(createEventChannel(ling));
});

app.get('/event', (req, res) => {
  const lastEventId = req.headers['last-event-id'] as string | undefined;
  const eventChannel = getEventChannel(req.query.channel as string);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const { stream, controller } = eventChannel.getStream(lastEventId);
  try {
    pipeline(stream as any, res);
  } catch (ex) {
    console.log(ex);
    controller?.close();
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});