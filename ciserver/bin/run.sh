#!/bin/bash
OPT=$1 # start: 后台启动；run：前台启动；
PROJECT_ENV=$2 # development | stage | production

if [[ -z $PROJECT_ENV ]];then
  case $ENVTYPE in
    * )         PROJECT_ENV=production  ;;
  esac
fi

BASE_DIR=$(pwd)
PROC_NAME=dist/main.js
NAME_SUFFIXX="\>"

PROC_ID=`ps -ef|grep -i ${BASE_DIR}/${PROC_NAME}${NAME_SUFFIXX}|grep -v "grep"|awk '{print $2}'`

case $OPT in
  "start" ) # 运行在后台
  if [[ -z $PROC_ID ]];then
    echo "start..."
    sleep 1
    NODE_ENV=${PROJECT_ENV} forever start ${PROC_NAME}  -l forever.log
    echo ${PROC_NAME} is running:${PROJECT_ENV}
  else
    echo ${PROC_NAME} is running, pid:${PROC_ID[@]}
  fi
  ;;

  "run" ) # 运行在前台
  if [[ -z $PROC_ID ]];then
    echo "run..."
    sleep 1
    NODE_ENV=${PROJECT_ENV} forever ${PROC_NAME}
    echo ${PROC_NAME} is running:${PROJECT_ENV}
  else
    echo ${PROC_NAME} is running, pid:${PROC_ID[@]}
  fi
  ;;

  "stop" ) # 运行在前台
  if [[ -n $PROC_ID ]];then
    forever stop ${PROC_NAME}
    echo ${PROC_NAME} is stoped
  fi
  ;;

  "restart" ) # 运行在前台
  if [[ -n $PROC_ID ]];then
    forever restart ${PROC_NAME}
    echo ${PROC_NAME} is restarted
  fi
  ;;

  * )
  echo '[start|run]'
  ;;

esac
