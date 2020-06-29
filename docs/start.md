## 初次安装运行

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

### 代码编译

```
cd webclient
npm run build
cd ../webserver
npm run build
cp -Rf ../webclient/dist dist/client
cd ../ciserver
npm run build
```

### 代码部署

#### step1 服务器准备

假设使用 forever（需要安装全局依赖）；如使用其他守护进程方式则自行修改 bin/run.sh。
ciserver 与 webserver 可分别部署在不同服务器，部署需要各自项目路径下存在.env.环境.local; 配置文件中写入各自服务的资源与第三方安全配置；配置内容参见.env.development; 关于环境配置的使用，参照[dotenv](https://github.com/motdotla/dotenv)

#### step2 代码发布

将编译后的 webserver 与 ciserver 目录打包推送至各自服务器后，
执行各自目录下 sh bin/run.sh start [env=stage|production]
