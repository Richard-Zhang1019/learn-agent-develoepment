<script setup lang="ts">
import { type PropType } from 'vue'

defineProps({
  questions: {
    type: Array as PropType<string[]>,
    default: [],
  }
});

const emit = defineEmits(['selection'])
const selection = (question: string, index: number) => {
  emit('selection', question, index)
}
</script>

<template>
  <div class="questions">
    <div>我猜你想要问的是：</div>
    <div v-for="(question, index) in questions" :key="index">
      <div class="question selection" @click="selection(question, index)">{{ question }}</div>
    </div>
  </div>
</template>

<style scoped>
.questions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.question {
  margin: 0 10px;
  font-weight: bold;
}

.question.selection {
  cursor: pointer;
}
</style>