from flask import Flask, jsonify
from prompt_generator import generate_prompt_from_keywords
from animatediff_runner import generate_animation
from video_ffmpeg import combine_frames_to_video
import os
import json

app = Flask(__name__)

# === 路径设置（相对路径） ===
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))  # video-gen-backend 目录
INPUT_JSON_PATH = os.path.join(CURRENT_DIR, "input", "client_1.json")
OUTPUT_BASE_PATH = os.path.abspath(
    os.path.join(CURRENT_DIR, "..", "video-server-backend", "resource", "video")
)

@app.route('/')
def index():
    return '✅ Video Generator is running. Access /gen to start.'

@app.route('/gen', methods=['GET'])
def generate_from_file():
    # 加载 JSON 文件
    with open(INPUT_JSON_PATH, 'r', encoding='utf-8') as f:
        json_data = json.load(f)

    prompt = generate_prompt_from_keywords(json_data)
    user = json_data.get("user", "unknown")
    timestamp = json_data.get("timestamp", "0000-00-00-00-00-00")

    output_dir = os.path.join(OUTPUT_BASE_PATH, f"{user}_{timestamp}")
    os.makedirs(output_dir, exist_ok=True)

    # 调用 AnimateDiff 和合成视频
    generate_animation(prompt, output_dir)
    video_path = os.path.join(output_dir, 'output.mp4')
    combine_frames_to_video(output_dir, video_path)

    relative_path = os.path.relpath(video_path, os.path.join(CURRENT_DIR, "..", "video-server-backend"))

    return jsonify({
        "prompt": prompt,
        "video_path": relative_path.replace("\\", "/"),
        "user": user,
        "timestamp": timestamp
    })

if __name__ == '__main__':
    app.run(port=5010)
