import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// import './plugins/elementui'

//导入字体图标
import './assets/fonts/iconfont.css'

import './network/request'

import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入相对应的样式
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor, /* { default global options } */)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')




