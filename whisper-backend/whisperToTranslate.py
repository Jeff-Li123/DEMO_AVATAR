import sounddevice as sd
import numpy as np
import whisper
import wave

# 录制音频函数
def record_audio(filename, duration, samplerate=16000):
    print("开始录音...")
    audio_data = sd.rec(int(samplerate * duration), samplerate=samplerate, channels=1, dtype="int16")
    sd.wait()  # 等待录制完成
    print("录音结束，保存文件中...")
    
    # 保存为 WAV 文件
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)  # 单声道
        wf.setsampwidth(2)  # 每样本 2 字节
        wf.setframerate(samplerate)
        wf.writeframes(audio_data.tobytes())
    print(f"音频已保存为 {filename}")

# Whisper 转录函数
def transcribe_audio(filename, output_file):
    print("加载 Whisper 模型...")
    model = whisper.load_model("small")  # 根据需求选择模型
    print("开始语音识别...")
    result = model.transcribe(filename, language="ja")  # 指定语言为中文
    text = result["text"]
    print("识别结果：")
    print(text)
    
    # 将文字保存到文件
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"识别结果已保存到 {output_file}")

if __name__ == "__main__":
    audio_file = "recorded_audio.wav"
    output_text_file = "mytalk.txt"
    record_duration = 5  # 录音时长（秒）
    
    # 录制音频
    record_audio(audio_file, record_duration)
    
    # 使用 Whisper 转录并保存为文本文件
    transcribe_audio(audio_file, output_text_file)
