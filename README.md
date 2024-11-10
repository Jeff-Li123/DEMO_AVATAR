# DEMO_AVATAR
Ⅰ.代码修改规则
推荐使用VsCode 在Extensions中下载组件gitgraph
注意：需要在git中添加 user名 和 email 地址才可clone此代码
1.打开终端，执行以下命令
git clone "https://github.com/Jeff-Li123/DEMO_AVATAR.git" 
2.修改文件，执行以下命令
git checkout -b develop/@username/@featurename
3.修改完成后，请用git push 推送代码
4.需要合并至main时，请发布 pull request


Ⅱ.设置指南：

1.安装 Express
1-1.打开终端： 导航到项目文件夹。
1-2.安装 Express： 运行以下命令：
'npm install express'

2.配置 API 密钥和服务 （本代码中自带密钥，发布前必须删除密钥！！！！）
2-1.编辑 'api.json'： 在项目目录中找到此文件。
2-2.替换 API 密钥： 将文件中的😂更换为您的实际 API 密钥。
2-3.选择服务： 修改 service 字段以选择您的头像类型。使用 talks 为基于图片创建的头像，或 clips 为视频中预制的高质量头像。此服务需要与DID中自制API相关联

Ⅲ.启动流媒体演示：

1.启动应用程序
1-1.在项目文件夹中打开终端： 使用VsCode打开终端。
1-2.运行应用程序：
'node app.js'

您应该看到消息：
"server started on port localhost:3000"
"http://localhost:3000"
"http://localhost:3000/agents"

1-3.访问应用程序
打开网页浏览器： 访问 http://localhost:3000/agents。
或者直接点击终端的链接即可打开demo的测试

