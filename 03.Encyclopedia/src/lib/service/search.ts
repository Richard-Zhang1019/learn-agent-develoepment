export async function search(question: string) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(question)}`);
  if (!response.ok) {
    throw new Error(`search failed: ${response.status} ${await response.text()}`);
  }
  const result = await response.json();
  return {
    result: result.ai_overview.text_blocks[0]?.snippet_highlighted_words,
    explanation: result.ai_overview.text_blocks[0]?.snippet,
  };
}
