export interface I_SignArticle {
    classification: string[];
    createDate: string;
    htmlLanguage: string;
    introduction: string;
    isHaveCode: boolean;
    isPublic: boolean;
    label: string[];
    previewImage: string;
    publicPassword: string;
    scriptLanguage: string;
    scriptSource: string[];
    styleLanguage: string;
    styleSource: string[];
    content: string;
    title: string;
    code: string;
    updateDate: string;
    updateMessage: string[];
    visits: number;
    _id: string;
}
export interface I_Article {
    data: I_SignArticle[];
    count: number;
    user: string;
}
export interface I_SingleArticlePublic {
    isPublic: boolean;
}
export interface I_SingleArticlePassword extends I_SingleArticlePublic {
    pass: boolean;
}
export interface I_ResComment {
    _id: string;
    articleId: string;
    nickName: string;
    headImg: string;
    email: string;
    content: string;
    parentId?: string;
    replyNickName?: string;
    replyComments: I_Comment[];
    commentTime: string;
    enable: boolean;
    ip: {
        ip: string,
        address: string;
    };
}
export interface I_ReqComment {
    articleId: string;
    nickName: string;
    headImg: string;
    email: string;
    content: string;
    parentId?: string;
    replyNickName?: string;
    commentTime: string;
    ip: string;
}