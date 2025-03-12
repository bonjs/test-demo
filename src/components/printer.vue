<template>
  选择打印机
  <el-select style="max-width:200px" v-model="selectedPrinter" placeholder="请选择打印机">
    <el-option v-for="printer in printers" :key="printer.name" :label="printer.name" :value="printer.name"></el-option>
  </el-select>

  <el-button type="primary" @click="print">打印</el-button>
  <el-card style="max-width: 480px">
    <template #header>
      <div class="card-header">
        <span>Card name</span>
      </div>
    </template>
    <p v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</p>
  </el-card>

</template>

<script setup>
import { ref, onMounted} from 'vue'

const printers = ref([]);
const selectedPrinter = ref("");
const printContent = ref("");

// 获取打印机列表
async function loadPrinters() {
    printers.value = await window.electronAPI.getPrinters();
}

// 发送打印请求
function printDocument() {
    if (!selectedPrinter.value || !printContent.value) {
        ElMessage.warning("请选择打印机并输入内容");
        return;
    }

    window.electronAPI.printDocument({
        printerName: selectedPrinter.value,
        content: printContent.value
    });

    ElMessage.success("已发送打印请求");
}

onMounted(loadPrinters); // 页面加载时自动获取打印机列表

let options = [
  {
    value: 'Option1',
    label: 'Option1',
  },
  {
    value: 'Option2',
    label: 'Option2',
  },
  {
    value: 'Option3',
    label: 'Option3',
  },
  {
    value: 'Option4',
    label: 'Option4',
  },
  {
    value: 'Option5',
    label: 'Option5',
  },
]
options = [];
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
