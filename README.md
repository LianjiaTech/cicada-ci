<p align="center">
  <img src="./docs/images/cicada.png" style="text-align: top;">
</p>

<h1>
青蝉系统
    <h3>企业级前端云构建系统</h3>
</h1>

## 项目简介

青蝉是一个致力于搭建前端云构建服务的开源项目。适用于搭建企业级的前端通用构建服务。
青蝉系统相对于传统的 jenkins，优点是更轻量级、更易于使用。默认整合基于 github/gitlab 的 CI 流程，同时提供了标准化的可替代模块说明，用户可以快速地将该系统集成到企业内部 CI/CD 流程中。[更多介绍](/docs/intro.md)

## 快速搭建开发服务

### 第一步，创建开发使用的 Oauth App

默认使用 github oauth 作为用户登录，因此在启动本地开发服务器之前需要先[创建 Github Oauth App](https://github.com/settings/applications/new)。创建成功后，将页面中的 Client ID 与 Client Secret 填入 webserver/.env.development 中(或创建.env.development.local 文件并填入该文件中，.local 文件不会提交至 git, 更具有安全性)

### 第二步，搭建本地服务

搭建本地开发服务共需启动 5 个服务，mysql, redis, 以及项目中的 webclient, webserver，ciserver。搭建共有两种方式:

第一种方式，基于[docker-compose](https://docs.docker.com/compose/)一键启动，启动方式如下：

```
# 初次运行需要先创建数据库表
docker-compose -f docker-compose-sql-sync.yml up
# 待提示dev_webserver_1 exit 0后表示创建成功，即可退出，后续启动无需再次执行上述命令
# 启动开发服务(webclient, webserver, ciserver, mysql, redis, mysqladminer,其中webserver暴露端口3600，ciserver暴露端口3700，mysqladminer暴露端口8080，服务启动后访问localhost:3600即可)
docker-compose up
```

第二种方式，在本地目录中分别启动各服务，步骤如下：

#### 资源需求

- Mysql： 开发环境配置 webserver/.env.development#database

- redis

#### 安装全局依赖(后续开发中使用 vue 和 nest 命令所需，启动服务非必须)

```
npm i -g @vue/cli
npm i -g @nestjs/cli
```

#### 安装本地依赖

```
yarn
(cd ciserver && yarn)
(cd webserver && yarn)
(cd webclient && yarn)
```

#### 启动开发服务

```
# webclient
cd webclient && npm run serve
# webserver
cd webserver && npm run start:dev
# ciserver
cd ciserver && npm run start:dev
```

访问 http://localhost:3600

## 版本记录

[CHANGELOG](/CHANGELOG.md)

## 主要贡献者

| Name                            | Avatar                                                         | Name                                     | Avatar                                                          | Name                                       | Avatar                                                                                                     |
| ------------------------------- | -------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| [守卫](https://github.com/sjli) | ![](https://avatars2.githubusercontent.com/u/1024718?s=40&v=4) | [嘻老师](https://github.com/aa978563552) | ![](https://avatars0.githubusercontent.com/u/61268325?s=40&v=4) | [波比儿](https://github.com/hqx1223614734) | ![](https://avatars3.githubusercontent.com/u/37667296?s=40&u=16432ce94acf2b0ac15dce0605226cf943e394ad&v=4) |

## 问题与反馈

[常见问题](/docs/faq.md)

[使用反馈] （进群方式）

## 协议

[MIT](http://opensource.org/licenses/MIT)

Copyright(c) 2017 Lianjia, Inc. All Rights Reserved
