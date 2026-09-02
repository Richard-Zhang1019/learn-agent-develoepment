<script setup lang="ts">
defineProps({
  questions: {
    type: Array,
    default: [],
  }
});

const emit = defineEmits(['selection'])
const selection = (question: string) => {
  emit('selection', question)
}
</script>

<template>
  <div class="questions">
    <div>我猜你想要问的是：</div>
    <div v-for="(question, index) in questions" :key="index">
      <div class="question selection" @click="selection(question as string)">{{ question }}</div>
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