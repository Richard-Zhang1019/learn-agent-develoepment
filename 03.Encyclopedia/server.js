import * as dotenv from 'dotenv'
import express from 'express'
import { getJson } from 'serpapi'

dotenv.config({
  path: ['.env.local', '.env'],
})

const openaiApiKey = process.env.VITE_DEEPSEEK_API_KEY
const serpApiKey = process.env.SERP_API_KEY || process.env.VITE_SERP_API_KEY

const app = express()
const port = 3000
const endpoint = 'https://api.deepseek.com/chat/completions'

// 搜索端点：serpapi 是 Node 库，只能在服务端调用
app.get('/search', async (req, res) => {
    const q = req.query.q
    if (!q) {
        res.status(400).json({ error: 'missing q parameter' })
        return
    }
    try {
        const response = await getJson({
            engine: 'google',
            api_key: serpApiKey,
            q: String(q),
        })
        res.json(response)
    } catch (error) {
        console.error('search error:', error?.message || error)
        res.status(500).json({ error: String(error?.message || error) })
    }
})

// SSE 端点
app.get('/stream', async (req, res) => {
    // 设置响应头部
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // 发送初始响应头

    try {
        // 发送 OpenAI 请求
        const response = await fetch(
            endpoint,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek-v4-flash', // 选择你使用的模型
                    messages: [{ role: 'user', content: req.query.question }],
                    stream: true, // 开启流式响应
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch from OpenAI');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let buffer = '';

        // 读取流数据并转发到客户端
        while (!done) {
            const { value, done: doneReading } = await reader.read();
            if (doneReading) {
                done = true;
            }

            buffer += decoder.decode(value, { stream: true });

            // 只处理完整的行（以 \n 结尾），不完整的留在 buffer 里等下一个 chunk
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data: ')) continue;

                const incoming = trimmed.slice(6);
                if (incoming === '[DONE]') {
                    done = true;
                    break;
                }
                try {
                    const data = JSON.parse(incoming);
                    const delta = data.choices[0].delta?.content;
                    if (delta) res.write(`data: ${delta}\n\n`); // 发送数据到客户端
                } catch (ex) {
                    console.error('Parse error:', ex, incoming);
                }
            }
        }

        res.write('event: end\n'); // 发送结束事件
        res.write('data: [DONE]\n\n'); // 通知客户端数据流结束
        res.end(); // 关闭连接

    } catch (error) {
        console.error('Error fetching from OpenAI:', error?.message || error);
        if (error?.cause) console.error('Cause:', error.cause);
        res.write(`data: Error: ${error?.message || 'Unknown error'}\n\n`);
        res.end();
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});