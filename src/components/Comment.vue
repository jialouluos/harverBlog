
<script lang="ts">
import dayjs from 'dayjs';
import { getComments, addComment, getQQHeadAndNickname, Window } from '@/api';
import { I_ResComment } from '@/types';
import type { FormInstance, FormRules } from 'element-plus';
import axios from 'axios';
declare const window: Window & typeof globalThis;
interface I_State {
    form: {
        nickName: string;
        email: string;
        content: string;
    };
    replyState: {
        replyNickName: string;
        replyId: string;
        commentTime: string;
        headImg: string;
        parentId: string;
        ip: string;
        articleId: string;
    };
    isReply: boolean;
    articleData: I_ResComment[];
}
export default defineComponent({
    props: {
        articleId: {
            type: String,
            required: true,
        }
    },
    setup(props) {
        const state = reactive<I_State>({
            form: {
                nickName: "",
                email: "",
                content: ""
            },
            replyState: {
                replyNickName: "",
                replyId: "",
                commentTime: "",
                headImg: "",
                parentId: "",
                ip: "",
                articleId: props.articleId
            },
            isReply: false,
            articleData: []
        });
        const formRef = ref<FormInstance>();
        const { proxy } = getCurrentInstance()!;
        const rules = reactive<FormRules>({
            nickName: [
                { required: true, message: "昵称必填", trigger: "blur" },
                {
                    min: 1,
                    max: 16,
                    message: "至少需要一个字符",
                    trigger: "blur",
                },
            ],
            email: [
                { required: true, message: "邮箱必填", trigger: "blur" },
                {
                    pattern:
                        /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/gi,
                    message: "请输入正确的邮箱",
                    trigger: "blur",
                },
            ],
            content: [
                { required: true, message: "内容必填", trigger: "blur" },
                {
                    min: 1,
                    message: "至少需要一个字符",
                    trigger: "blur",
                },
            ]
        });
        onMounted(() => [
            getArticleComment()
        ]);
        const getArticleComment = () => {
            state.replyState.articleId = props.articleId;
            getComments(state.replyState.articleId).then(res => {
                state.articleData = [...res];
            }).catch(_ => {

            });
        };
        const onSubmit = async (formInstance: FormInstance | undefined) => {

            if (!formInstance) return;

            await formInstance.validate(async (valid) => {
                if (valid) {
                    state.replyState.commentTime = dayjs().format("YYYY-MM-DD HH:mm:ss");//发表时间
                    state.replyState.headImg = state.replyState.headImg || `https://api.ixiaowai.cn/api/api.php`;
                    try {
                        const { data: { ip } } = await axios.get('https://api.ipify.org?format=json');
                        state.replyState.ip = ip;
                        state.replyState.articleId = props.articleId;
                        const data = {
                            ...state.form, ...state.replyState, enable: false,
                        };
                        addComment(data).then(res => {
                            proxy?.$mymsg.success(res);
                            state.form.content = "";
                            state.form.email = "";
                            state.form.nickName = "";
                            cancalReply();
                        }).catch(err => {
                            proxy?.$mymsg.error(err);
                        });
                    } catch {
                        proxy?.$mymsg.error('获取ip异常');
                    }

                }
            });

        };
        const getQQInfo = (qq: string) => {
            /^[1-9]\d{3,9}$/.test(qq) && getQQHeadAndNickname(qq).then(res => {
                state.replyState.headImg = res.avatar;
                state.form.email = res.qq + "@qq.com";
                state.form.nickName = res.name.trim();
            });
        };
        const reply = (nickName: string, parentId: string, replyId: string) => {
            state.replyState.replyNickName = nickName;//回复对象
            state.replyState.parentId = parentId;
            state.replyState.replyId = replyId;
            state.isReply = true;
        };
        const cancalReply = () => {
            state.replyState.replyNickName = "";//回复对象
            state.replyState.parentId = "";
            state.replyState.replyId = "";
            state.isReply = false;
        };
        return {
            rules,
            ...toRefs(state),
            onSubmit,
            getQQInfo,
            reply,
            cancalReply,
            formRef
        };
    },
});
</script>
<template>
    <div class="comment_box">
        <div class="comment_body">
            <div class="comment coment_root" :class="[item.replyComments.length ? 'tt' : '']"
                v-for="item in articleData" :key="item._id">
                <div class="info">
                    <div class="comment_img_box">
                        <img :src="item.headImg" />
                    </div>
                    <a class="nickname">{{ item.nickName }}</a>
                    <span class="date">{{ item.commentTime }}</span>
                    <button class="btn" @click="reply(item.nickName, item._id, item._id)">回复</button>
                </div>
                <div class="content">
                    <p class="text">
                        {{ item.content }}
                    </p>
                </div>
                <div class="reply_comment" v-for="item2 in item.replyComments" :key="item2.id">
                    <div class="comment">
                        <div class="info">
                            <div class="comment_img_box">
                                <img :src="item2.headImg" />
                            </div>
                            <a class="nickname">{{ item2.nickName }}</a>
                            <span class="date">{{ item2.commentTime }}</span>
                            <button class="btn" @click="reply(item2.nickName, item2.parentId, item2._id)">回复</button>
                        </div>
                        <div class="content">
                            <p class="text">
                                <a>@{{ item2.replyNickName }}</a>,
                                {{ item2.content }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="form">
            <h3> 发表评论 <button class="btn" :class="[isReply ? '' : 'cancal_reply']"><span
                        @click="cancalReply">取消回复</span></button> <span :class="[isReply ? '' : 'cancal_reply']"
                    style="font-size:14px;color:var(--font_main_color)">{{ "@" + replyState.replyNickName }}</span></h3>
            <el-form ref="formRef" :model="form" style="margin:10px 0px;" :rules="rules">
                <el-form-item style="margin-bottom: 0px;max-width:90%;" prop="content">
                    <el-input type="textarea" v-model="form.content" placeholder='评论千万条,友善第一条'
                        style="margin-bottom: 0px;"></el-input>
                </el-form-item>
                <el-form-item style="width:40%;margin:20px 20px 0px 0px;display:inline-block;" prop="email">
                    <el-input v-model="form.email" size="small" placeholder='邮箱(必填,用于接收回复邮件)'></el-input>
                </el-form-item>
                <el-form-item prop="nickName" style="width:40%;margin:0px 20px 0px 0px;display:inline-block;">
                    <el-input v-model="form.nickName" size="small" placeholder='昵称(必填,输入QQ号将自动拉取昵称和头像)'
                        @blur="getQQInfo(form.nickName)">
                    </el-input>
                </el-form-item>
                <el-button @click="onSubmit(formRef)" style="width:40px;">发表</el-button>
            </el-form>
        </div>
    </div>

</template>
<style lang = "less" scoped>
.comment_box {
    width: 80%;
    margin: 20px 0px;
    padding: 10px 20px;
    border-radius: 5px;
    background-color: var(--main_color);
    backdrop-filter: blur(4px);
    border-radius: 5px;
    box-shadow: 0 2px 12px 0 var(--shadow_color);

    .btn {
        padding: 2px 5px;
        font-size: 12px;
        border-radius: 3px;
        margin-left: 5px;
        color: var(--font_main_color);
        background-color: var(--hover_color);
        border: 1px solid var(--hover_color);

        &:hover {
            background-color: var(--hover_color);
            cursor: pointer;
        }
    }

    .comment_body {
        height: auto;
        width: 100%;

        .comment {

            height: auto;
            display: flex;
            flex-wrap: wrap;
            justify-content: start;

            .info {
                width: 100%;
                height: auto;

                .comment_img_box {
                    height: 40px;
                    width: 40px;
                    min-width: 40px;
                    min-height: 40px;
                    display: inline-block;
                    vertical-align: middle;

                    img {
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                    }
                }

                .nickname {

                    font-weight: bolder;
                    height: auto;
                    font-size: 14px;
                    margin-left: 5px;
                    color: var(--font_main_color);
                    -webkit-text-decoration-line: none;
                    text-decoration-line: none;
                }

                .date {
                    color: grey;
                    font-size: 10px;
                    margin-left: 5px;
                }


            }

            .content {
                margin-left: 40px;
                width: 100%;

                .text {
                    word-wrap: break-word;
                    word-break: break-all;
                    white-space: pre-wrap !important;
                    margin: 7px 0;
                    line-height: 1.5;
                    font-size: 14px;
                    display: inline-block;
                    color: var(--font_second_color);
                }

                a {
                    font-weight: bolder;
                    text-decoration-line: none;
                    color: var(--hover_color);
                }
            }

            .reply_comment {
                margin-left: 40px;
                width: 100%;
            }
        }

        .coment_root {
            width: 90%;
            margin: 10px auto;
            position: relative;
        }

        .tt {
            &::before {
                content: "";
                position: absolute;
                left: 20px;
                top: 40px;
                height: calc(100% - 40px);
                border-left: 1px solid #ccc;
            }

            .comment {
                position: relative;

                &::before {
                    content: "";
                    position: absolute;
                    left: -20px;
                    top: 20px;
                    width: 20px;
                    border-top: 2px solid rgb(124, 174, 232);
                }
            }
        }
    }

    .form {
        .cancal_reply {
            display: none;
        }

        h3 {
            margin: 5px;
            font-weight: 500 !important;
        }

        .el-form {
            .el-form-item {
                max-width: 100% !important;
            }

            .el-textarea {
                margin-bottom: 10px;
            }
        }
    }
}

@media (max-width: 997px) {
    .comment_box {
        width: 90%;
    }
}

@media (max-width:600px) {
    .comment_box {
        width: 100%;

        .form {
            .el-form {
                :nth-child(2) {
                    width: 30% !important;
                }

                .el-form-item {
                    max-width: 100% !important;
                }

                .el-textarea {
                    margin-bottom: 10px;
                }
            }
        }
    }
}
</style>