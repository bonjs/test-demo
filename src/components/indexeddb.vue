<template>
  <el-button type="primary" @click="add">add</el-button>
  <el-button type="primary" @click="rollback">rollback</el-button>

  <el-table :data="dataList" style="width: 100%; margin-top: 20px;">
    <el-table-column prop="id" label="ID" width="80"></el-table-column>
    <el-table-column prop="name" label="名称"></el-table-column>
    <el-table-column prop="time" label="时间"></el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onMounted} from 'vue'
import {ElMessage} from 'element-plus';
const dataList = ref([]);
const dbName = "MyDatabase";
const storeName = "MyStore";


async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function fetchData() {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
        dataList.value = request.result; // ✅ 让 Vue 3 自动更新 UI
    };

    request.onerror = () => {
        ElMessage.error("查询数据失败！");
    };
}

async function add() {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);
  store.add({ name: "示例数据", time: new Date().toISOString() });

  transaction.oncomplete = () => {
    ElMessage.success("数据已添加！");
    fetchData();
  };
  transaction.onerror = () => {
    ElMessage.error("添加数据失败！");
  };
}

async function getData() {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.getAll();

  request.onsuccess = () => {
    dataList.value = request.result;
  };

  request.onerror = () => {
    ElMessage.error("查询数据失败！");
  };
}

async function rollback() {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);

  try {

    ElMessage.info("尝试添加一条数据");
    store.add({ name: "事务测试数据", time: new Date().toISOString() });

    throw new Error("模拟错误，触发回滚！");
    transaction.commit(); // 这行代码不会执行
  } catch (error) {
    ElMessage.error(error.message);
    transaction.abort();
    ElMessage.warning("事务已回滚：" + error.message);
  }
}


onMounted(fetchData); 

</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
