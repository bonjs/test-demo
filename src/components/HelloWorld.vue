<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const str = ref('v1.0.0')

</script>

<template>
 <div>{{ str }} </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
