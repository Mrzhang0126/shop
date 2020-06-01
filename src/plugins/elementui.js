import Vue from 'vue'
import ElementUI, {Message, MessageBox} from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm

