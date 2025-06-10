import subprocess
import os

def combine_frames_to_video(frame_dir, output_path):
    """
    用 ffmpeg 将帧图（frame_0001.png）合成 mp4 视频
    """
    cmd = [
        "ffmpeg", "-y",
        "-framerate", "15",
        "-i", os.path.join(frame_dir, "frame_%04d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        output_path
    ]
    subprocess.run(cmd)
