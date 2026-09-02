<script setup lang="ts">
import { ref, type Ref } from 'vue';
import MakeQuestion from './components/MakeQuestion.vue';

const question = ref('天空为什么是蓝色的？');

const rewritedQuestions: Ref<Array<string>> = ref([]);

const update = async () => {
  if (!question) return;
  rewritedQuestions.value = [];
  const endpoint = '/api/make-question';
  const eventSource = new EventSource(`${endpoint}?question=${question.value}`);

  eventSource.addEventListener("message", function (e: any) {
    let { uri, delta } = JSON.parse(e.data);
    const matches = uri.match(/questions\/(\d+)\/question$/);
    if (matches) {
      const index = parseInt(matches[1]);
      rewritedQuestions.value[index] = rewritedQuestions.value[index] || '';
      rewritedQuestions.value[index] += delta;
    }
  });
  eventSource.addEventListener('finished', () => {
    console.log('传输完成');
    eventSource.close();
  });
}
const questionSelected = (question: string) => {
  console.log('questionSelected', question);
}
</script>

<template>
  <div class="container">
    <div>
      <label>输入：</label><input class="input" v-model="question" />
      <button @click="update">提交</button>
    </div>
    <div class="output">
      <MakeQuestion :questions="rewritedQuestions" @selection="questionSelected" />
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
  font-size: .85rem;
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