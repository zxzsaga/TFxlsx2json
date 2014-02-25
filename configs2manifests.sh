#!/bin/sh

function usage() 
{
  echo ""
  echo "Usage: 到本项目的根目录，执行./scripts/configs2manifests.sh -m [c|s|a] -t your_path -v version"
  echo "需要选项:"
  echo "-m mode, 生成并影响的对象, c代表client，s代表server，a代表两者都生成"
  echo "-t 生成的configManifest保存对象，请写入绝对路径"
  echo "[option] -v 生成manifest的version"
  echo ""
}

while getopts ":m:t:v:" opt
do
  case $opt in 
    m ) mode=$OPTARG
    ;;
    t ) dest=$OPTARG
    ;;
    v ) version=$OPTARG
  esac
done

if ( ! [ -d ./configurations ] ); then
  echo "[ERROR] wrong path: "`pwd`" [ERROR]"
  usage
  exit 1;
fi

if ([ "$mode" == "" ] || [ "$dest" == "" ]); then
  echo "[ERROR] mode or dest not given [ERROR]"
  usage
  exit 1;
fi

if [ "$version" == "" ]; then
  version=`date +%s`
  echo "version not given, use current unix time: "$version
fi

if ([ "$mode" == "c" ] || [ "$mode" == "a" ]); then
  echo "client generation"
  if [ -d ./manifests ]; then
    echo "deleting manifests"
    rm -rf ./manifests
  fi
  mkdir -pv manifests/Data
  cp ./configurations/client/*  ./manifests/Data/
  cd ./manifests
  /usr/bin/python ../scripts/resourceGenerator.py Data/ config
  cd ../
  if ( ! [ -d $dest/client ] ); then
    echo "[ERROR] destination client folder N/A [ERROR]"
    exit 2
  fi
  if [ -d $dest/client/$version ]; then
    echo "[ERROR] the version already exist, give another one! [ERROR]"
    exit 3
  fi
  mv ./manifests $dest/client/$version
fi

if ([ "$mode" == "s" ] || [ "$mode" == "a" ]); then
  echo "server generation"
  if [ -d ./manifests ]; then
    echo "deleting manifests"
    rm -rf ./manifests
  fi
  mkdir -pv manifests/Data
  cp ./configurations/server/*  ./manifests/Data/
  cd ./manifests
  /usr/bin/python ../scripts/resourceGenerator.py Data/ config
  cd ../
  if ( ! [ -d $dest/server ] ); then
    echo "[ERROR] destination server folder N/A [ERROR]"
    exit 2
  fi
  if [ -d $dest/server/$version ]; then
    echo "[ERROR] the version already exist, give another one! [ERROR]"
    exit 3
  fi
  mv ./manifests $dest/server/$version
fi

exit 0
