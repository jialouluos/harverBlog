# 设置基础镜像
FROM nginx:latest
# 定义作者
LABEL maintainer = harver
# 添加时区环境变量，亚洲，上海
ENV TimeZone=Asia/Shanghai
# 将dist文件中的内容复制到 /blog/nginx/html/ 这个目录下面
COPY dist/  /blog/nginx/html/
# 将配置文件中的内容复制到 /blog/nginx 这个目录下面(增加自己的代理及一些配置)
# RUN rm -rf /etc/nginx/nginx.conf
# 用本地的nginx配置文件覆盖镜像的Nginx配置
COPY nginx.conf /etc/nginx/conf.d/harver.conf
# ssl
COPY fullchain.pem /blog/nginx/ssl/fullchain.pem
COPY privkey.pem /blog/nginx/ssl/privkey.pem
# 暴露端口14
EXPOSE 1141