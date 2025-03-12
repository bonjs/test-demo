import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {Quasar} from 'quasar'


import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

const app = createApp(App);
app.use(ElementPlus);
app.use(Quasar, {
    plugins: {}, // 可以按需添加 Quasar 插件，如 Notify、Dialog 等
  });
app.mount('#app');

