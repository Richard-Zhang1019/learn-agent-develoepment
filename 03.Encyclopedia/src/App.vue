<script setup lang="ts">
import { ref, type Ref } from 'vue'
import MakeQuestion from './components/MakeQuestion.vue'
import MarkdownRender from 'markstream-vue'

const question = ref('天空为什么是蓝色的？')
const quickAnswer = ref('')
const rewritedQuestions: Ref<Array<string>> = ref([])

let queries: string[][] = [];

const update = async () => {
  if (!question) return;
  rewritedQuestions.value = [];
  quickAnswer.value = '';
  queries = [];

  const endpoint = '/api/make-question';
  const eventSource = new EventSource(`${endpoint}?question=${encodeURIComponent(question.value)}`);

  eventSource.addEventListener("message", function (e: any) {
    let { uri, delta } = JSON.parse(e.data);
    let matches = uri.match(/questions\/(\d+)\/question$/);
    if (matches) {
      const index = parseInt(matches[1]);
      rewritedQuestions.value[index] = rewritedQuestions.value[index] || '';
      rewritedQuestions.value[index] += delta;
    }
    matches = uri.match(/questions\/(\d+)\/query\/(\d+)$/);
    if (matches) {
      const index = parseInt(matches[1]);
      const queryIndex = parseInt(matches[2]);
      queries[index] = queries[index] || [];
      queries[index][queryIndex] = queries[index][queryIndex] || '';
      queries[index][queryIndex] += delta;
    }
  });
  eventSource.addEventListener('finished', () => {
    console.log('传输完成');
    eventSource.close();
  });
}

const questionSelected = (question: string, index: number) => {
  quickAnswer.value = '';
  const query = queries[index].join(';');
  const endpoint = '/api/quick-answer';
  const eventSource = new EventSource(`${endpoint}?question=${encodeURIComponent(question)}&query=${encodeURIComponent(query)}`);
  eventSource.addEventListener("message", function (e: any) {
    let { delta } = JSON.parse(e.data);
    quickAnswer.value += delta;
  });
  eventSource.addEventListener('finished', () => {
    console.log('传输完成');
    eventSource.close();
  });
}
</script>

<template>
  <div class="container">
    <div>
      <label>输入：</label><input class="input" v-model="question" />
      <button @click="update">提交</button>
    </div>
    <div class="output">
      <MakeQuestion
        :questions="rewritedQuestions"
        @selection="questionSelected"
      />
      <MarkdownRender
        smooth-streaming
        mode="chat"
        :content="quickAnswer"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: 100%;
  height: 100vh;
  font-size: 0.85rem;
}

.input {
  width: 200px;
}

.output {
  margin-top: 30px;
  min-height: 300px;
  width: 100%;
  text-align: left;
}
</style>
