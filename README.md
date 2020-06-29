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

## 快速上手

### 资源需求

- 数据库： Mysql
- 开发环境配置：webserver/.env.development#database

### 安装全局依赖

```
npm i -g @vue/cli @vue/cli-service
npm i -g @nestjs/cli
```

### 安装本地依赖

```
cd ciserver
yarn
cd ../webserver
yarn
cd ../webclient
yarn
```

### 开发环境

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
