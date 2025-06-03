from flask import Flask, request, jsonify, send_from_directory, render_template
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# 配置视频保存目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEO_FOLDER = os.path.join(BASE_DIR, 'resource', 'video')
os.makedirs(VIDEO_FOLDER, exist_ok=True)

# 模板目录设置（Flask 默认 templates/ 可省略）
app.template_folder = os.path.join(BASE_DIR, 'templates')

# 实际访问地址（部署后替换成你的域名）
BASE_URL = "http://localhost:5000/videos"  # 本地测试用 http://localhost:5000/videos

# 允许的上传类型
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 网页上传界面
@app.route('/')
def upload_page():
    return render_template('upload.html')

# 视频上传 API
@app.route('/api/videos', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify(success="false", message="No video file provided", data=[]), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify(success="false", message="Empty filename", data=[]), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        save_path = os.path.join(VIDEO_FOLDER, filename)
        file.save(save_path)
        video_url = f"{BASE_URL}/{filename}"

        return jsonify({
            "success": "true",
            "message": "Video uploaded successfully",
            "data": [{"videoUrl": video_url}]
        })

    else:
        return jsonify(success="false", message="Invalid file type", data=[]), 400

# 获取所有视频链接
@app.route('/api/videos', methods=['GET'])
def list_videos():
    try:
        video_files = [
            f for f in os.listdir(VIDEO_FOLDER)
            if os.path.isfile(os.path.join(VIDEO_FOLDER, f)) and allowed_file(f)
        ]
        video_urls = [{"videoUrl": f"{BASE_URL}/{f}"} for f in video_files]

        return jsonify({
            "success": "true",
            "message": "Videos fetched successfully",
            "data": video_urls
        })
    except Exception as e:
        return jsonify({
            "success": "false",
            "message": f"Error: {str(e)}",
            "data": []
        })

# 提供视频访问服务
@app.route('/videos/<filename>')
def serve_video(filename):
    return send_from_directory(VIDEO_FOLDER, filename)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=10000, debug=True)