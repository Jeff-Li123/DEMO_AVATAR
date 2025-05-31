from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import os

app = Flask(__name__)
CORS(app)  # 启用 CORS

# 加载 Whisper 模型
print("加载 Whisper 模型...")
model = whisper.load_model("small")

@app.route('/')
def home():
    return "Welcome to the Whisper Transcription API. Use /transcribe to upload audio files."

@app.route('/transcribe', methods=['POST'])
def transcribe():
    # 检查是否有上传的文件
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    filename = "uploaded_audio.wav"
    
    # 尝试保存文件
    try:
        file.save(filename)
    except Exception as e:
        return jsonify({'error': f'Failed to save the file: {str(e)}'}), 500

    # 使用 Whisper 模型转录音频
    try:
        print("开始语音识别...")
        result = model.transcribe(filename, language="ja")
    except Exception as e:
        return jsonify({'error': f'Failed to transcribe the audio: {str(e)}'}), 500
    finally:
        # 删除临时文件
        if os.path.exists(filename):
            os.remove(filename)

    return jsonify({'transcription': result['text']})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
