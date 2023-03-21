import Message, { setOption, I_Msg } from './Msg';
import { App } from 'vue';

export default {
    install(app: App, options?: I_Msg) {
        options && setOption(options);
        app.config.globalProperties.$mymsg = Message;
    }
};
