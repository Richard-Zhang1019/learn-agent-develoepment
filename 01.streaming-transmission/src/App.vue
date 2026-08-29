<script setup lang="ts">
import { ref } from 'vue'
import MarkdownRender from 'markstream-vue'

type MarkdownRenderProps = InstanceType<typeof MarkdownRender>['$props']

const customId: MarkdownRenderProps['customId'] = 'quick-start'
const isDark: MarkdownRenderProps['isDark'] = false

const question = ref('讲一个关于中国龙的故事')
const content = ref('')
const stream = ref(true)

const update = async () => {
  if (!question.value) return
  content.value = '思考中...'

  if (stream.value) {
    content.value = ''

    // 走本地 server 代理，避免浏览器直连 API 时 gzip 压缩导致无法流式读取
    const response = await fetch(
      `/api/stream?question=${encodeURIComponent(question.value)}`,
    )

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let done = false
    let buffer = ''

    while (!done) {
      const { value, done: doneReading } = await (reader?.read() as Promise<{
        value: any
        done: boolean
      }>)
      if (doneReading) {
        done = true
      }

      buffer += decoder.decode(value, { stream: true })

      // 只处理完整的行，不完整的留在 buffer 里等下一个 chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue

        const incoming = trimmed.slice(6)
        if (incoming === '[DONE]') {
          done = true
          break
        }
        // server 已经提取了 delta，这里直接拼接纯文本
        content.value += incoming
      }
    }
  } else {
    // 非流式：直接调用 API
    const endpoint = 'https://api.deepseek.com/chat/completions'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [{ role: 'user', content: question.value }],
        stream: false,
      }),
    })

    const data = await response.json()
    content.value = data.choices[0].message.content
  }
}
</script>

<template>
  <div class="container">
    <div>
      <label>输入：</label><input class="input" v-model="question" />
      <button @click="update">提交</button>
    </div>
    <div class="output">
      <div>
        <label>Streaming</label><input type="checkbox" v-model="stream" />
      </div>
      <MarkdownRender
        smooth-streaming
        mode="chat"
        :content="content"
        :custom-id="customId"
        :is-dark="isDark"
      />
      <!-- <div>{{ content }}</div> -->
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  height: 100vh;
  font-size: 0.85rem;
}
.input {
  width: 200px;
}
.output {
  margin-top: 10px;
  min-height: 300px;
  width: 100%;
  text-align: left;
}
button {
  padding: 0 10px;
  margin-left: 6px;
}
</style>
