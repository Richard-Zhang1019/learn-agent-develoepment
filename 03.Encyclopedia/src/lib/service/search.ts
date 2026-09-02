import { getJson } from 'serpapi'

// 该函数只在服务端(server.ts)使用，直接调用 serpapi，
// 不能用 fetch('/api/search') 这种相对路径 —— Node 的 fetch 不支持相对 URL
export async function search(question: string) {
  const apiKey = process.env.SERP_API_KEY || process.env.VITE_SERP_API_KEY;
  if (!apiKey) {
    throw new Error('missing SERP_API_KEY / VITE_SERP_API_KEY');
  }
  return await getJson({
    engine: 'google',
    api_key: apiKey,
    q: question,
  });
}
