from flask import Flask, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# 上传文件保存目录
UPLOAD_FOLDER = os.path.join('static', 'videos')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 允许的扩展名
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}

# 检查扩展名是否允许
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 视频上传接口
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'video' not in request.files:
        return jsonify(success=False, message="No video file part"), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify(success=False, message="No selected file"), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return jsonify(success=True, message="Upload successful", videoUrl=f"/videos/{filename}")
    else:
        return jsonify(success=False, message="Invalid file type"), 400

# 获取所有视频 URL 的接口
@app.route('/api/videos', methods=['GET'])
def get_videos():
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    video_urls = [
        {"videoUrl": f"http://localhost:5000/videos/{filename}"}
        for filename in files if allowed_file(filename)
    ]
    return jsonify(success="true", message="Videos fetched successfully", data=video_urls)

# 静态视频访问接口
@app.route('/videos/<filename>')
def serve_video(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
