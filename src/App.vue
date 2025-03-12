<script setup>
import HelloWorld from './components/HelloWorld.vue'
import indexeddb from './components/indexeddb.vue'
import printer from './components/printer.vue'

import { ref } from 'vue'

let data = ref('')

async function apiCall() {
  // window.electronAPI.sendMessage('do-something', 'Hello from Vue!');
  let url = 'http://jsonplaceholder.typicode.com/posts';
  data.value = await window.electronAPI.getData(url);
  console.log('data', data);
}

async function hotUpdate() {
  let result = await window.electronAPI.update();
  console.log('hostUpdate', result);
}
async function testUpdate() {
  let result = await window.electronAPI.testUpdate();
  console.log('hostUpdate', result);
}
</script>

<template>
  <hello-world></hello-world>
  <el-tabs type="border-card" class="demo-tabs">
    <el-tab-pane label="远程接口调用">
      <el-button type="primary" @click="apiCall">远程接口调用</el-button>
      http://jsonplaceholder.typicode.com/posts
      <div>返回：{{ data }}</div>
    </el-tab-pane>
    <el-tab-pane label="使用前端数据库">
      <indexeddb></indexeddb>
    </el-tab-pane>
    <el-tab-pane label="热更新">
      <el-button type="primary" @click="hotUpdate">检查版本</el-button>
      <el-button type="primary" @click="testUpdate">test update</el-button>
    </el-tab-pane>
    <el-tab-pane label="打印机">
      <printer></printer>
    </el-tab-pane>
  </el-tabs>
</template>

<style>
.demo-tabs>.el-tabs__content {
  padding: 32px;
  color: #6b778c;
  /* font-size: 32px; */
  /* font-weight: 600; */
}

.demo-tabs .custom-tabs-label .el-icon {
  vertical-align: middle;
}

.demo-tabs .custom-tabs-label span {
  vertical-align: middle;
  margin-left: 4px;
}
</style>
