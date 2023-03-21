<script lang="ts">
import { getSingleArticle, checkSingleArticlePublic, checkSingleArticlePassword } from "@/api";
import { useLoading } from "@/hooks";
import { I_SingleArticlePassword, I_SignArticle } from "@/types";
import { I_SingleArticlePublic } from '../types/article';
export default defineComponent({
  components: {
    "DisplaySanbox": defineAsyncComponent(() => import("@/components/DisplaySanbox.vue"))
  },
  setup() {
    const checkRefs = ref<HTMLDivElement>();
    const { proxy } = getCurrentInstance()!;
    const openCheckDialog = ref(false);
    const realPassword = ref("");
    const InputCheckPwd = ref("");
    const CheckMassage = ref("");
    const isComplete = ref(false);
    const CheckTime = ref(5);
    const route = useRoute();
    const router = useRouter();
    const SingleArticleData = ref<I_SignArticle>();
    const articleId = ref("");
    onMounted(() => {
      CheckTime.value = 5;
      isComplete.value = false; //重置加载状态
      const [startLoading, stopLoading] = useLoading(checkRefs.value!); //加载动画Hook
      startLoading(); //开始加载
      const id: string = route.query.id as string;

      if (id && id.length !== 24) {
        //简洁判断一些id的合法性，减少一些非法请求
        stopLoading();
        CheckFailure();
        return;
      }
      articleId.value = id;
      //获取文章密码
      checkSingleArticlePublic<I_SingleArticlePublic>(id)
        .then((data) => {
          //判断文章是否为公开文章
          if (data.isPublic) {
            //开始获取文章数据
            getSingleArticle<{ article: I_SignArticle; }>(id, "")
              .then((data) => {
                stopLoading(); //加载动画关闭
                SingleArticleData.value = data.article;
                isComplete.value = true; //加载完成标识
              })
              .catch(() => {
                stopLoading(); //加载动画关闭
                CheckFailure(); //获取失败
                return;
              });
          } else {
            //如果文章不为公开文章，则弹出密码输入框
            stopLoading(); //先停止加载
            openCheckDialog.value = true; //开启验证框
          }
        })
        .catch(() => {
          stopLoading();
          CheckFailure();
          return;
        });
    });
    const CloseCheckPwdDialog = () => {
      InputCheckPwd.value = "";
      CheckMassage.value = "";
    };
    const CheckPassword = () => {
      if (
        /(script|var|http|\<|\>|\(|\)|\\)/.test(InputCheckPwd.value) ||
        /[^a-zA-Z0-9]/.test(InputCheckPwd.value)
      ) {
        alert("存在敏感词");
        InputCheckPwd.value = "";
        CheckFailure();
        return;
      }
      checkSingleArticlePassword<I_SingleArticlePassword>(articleId.value, InputCheckPwd.value).then(res => {
        if (res.pass) {
          const [startLoading, stopLoading] = useLoading(checkRefs.value!); //加载动画Hook
          startLoading(); //开始加载
          openCheckDialog.value = false;
          getSingleArticle<{ article: I_SignArticle; }>(
            route.query.id as string,
            InputCheckPwd.value
          )
            .then((data) => {
              stopLoading(); //加载动画关闭
              SingleArticleData.value = data.article;
              isComplete.value = true;
            })
            .catch(() => {
              stopLoading(); //加载动画关闭
              CheckFailure();
              return;
            });
        } else {
          CheckTime.value--;
          if (CheckTime.value <= 0) CheckFailure("错误次数过多！返回主界面~");
          CheckMassage.value = "密码错误";
        }
      });
    };

    const CheckFailure = (value: string = "文章异常或不存在!") => {
      proxy!.$mymsg.info(value);
      router.replace({
        name: "v_home",
      });
    };

    return {
      checkRefs,
      openCheckDialog,
      InputCheckPwd,
      CheckMassage,
      SingleArticleData,
      CloseCheckPwdDialog,
      CheckPassword,
      CheckFailure,
      isComplete,
      articleId
    };
  },
});
</script>
<template>
  <div class="dispay" ref="checkRefs">
    <!-- 密码保护验证 -->
    <el-dialog title="输入密码" v-model="openCheckDialog" :before-close="CloseCheckPwdDialog" :modal="false"
      :close-on-click-modal="false" :show-close="false">
      <el-form @submit.prevent>
        <el-form-item>
          <el-input v-model="InputCheckPwd" placeholder="请输入访问码" @keyup.enter="CheckPassword"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="checkbtn" @click="CheckPassword">验 证</el-button>
          <el-button class="checkbtn" @click="() => CheckFailure('返回主界面~')">返 回</el-button>
        </el-form-item>
        <span :style="{
          color: CheckMassage === '验证成功' ? '#abd68a' : '#a43333',
          marginLeft: '5px',
        }">{{ CheckMassage }}</span>
      </el-form>
    </el-dialog>
    <!-- 密码保护验证 -->
    <DisplaySanbox v-if="isComplete" :SingleArticleData="SingleArticleData!" :articleId="articleId"></DisplaySanbox>
  </div>
</template>
<style lang = "less" >
.dispay {
  height: auto;
  width: 100%;
  overflow: visible;

  .display_box {
    width: 100%;
    margin: 0px 0px 10px 0px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .el-dialog {
    background: var(--bg_color) !important;
    box-shadow: 0 5px 35px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    width: 90%;
    max-width: 560px;

    &::after {
      content: "";
      position: absolute;
      top: 5px;
      left: 5px;
      right: 5px;
      bottom: 5px;
      border-radius: 5px;
      pointer-events: none;
      background: linear-gradient(to bottom,
          rgba(255, 255, 255, 0.3) 0%,
          rgba(255, 255, 255, 0.1) 15%,
          transparent 50%,
          transparent 85%,
          rgba(196, 196, 196, 0.3) 100%);
    }

    .el-dialog__header {
      margin-top: 45vh;
      text-align: center;
    }

    .el-dialog__body {
      .el-form {
        justify-content: center;
        flex-wrap: wrap;
        display: flex;

        .el-form-item {
          text-align: center;
          width: 90%;

          .el-form-item__content {
            justify-content: center;
          }

          .el-dialog__body {
            .el-form-item__label {
              width: 100%;
              text-align: center;
            }
          }
        }

        .el-input__inner {
          color: var(--hover_color);
        }

        .checkbtn {
          margin-top: 10px;

          &:hover {
            color: var(--hover_color);
          }
        }
      }
    }
  }
}
</style>