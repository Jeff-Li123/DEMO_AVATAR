@echo off
:: 启动 Automatic1111 WebUI，使用 Python 3.10，并启用 API 模式

:: 设置 Python 路径（根据你的安装路径）
set PYTHON=C:\Python310\python.exe

:: 进入子模块目录
cd /d %~dp0webUI

:: 调用 WebUI 启动脚本并传参
%PYTHON% launch.py --api
