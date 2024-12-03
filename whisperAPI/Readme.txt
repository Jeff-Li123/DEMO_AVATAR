whisper 环境构筑
1. Python库的安装
pip install git+https://github.com/openai/whisper.git 

2.推荐安装 ffmpeg 推流格式处理
sudo apt update
sudo apt install ffmpeg
 （如果声音格式无法被whisper解码时 ffmpeg -i input_audio.m4a output_audio.wav）

3.安装音频录制相关库
pip install sounddevice numpy