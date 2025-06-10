import requests
import os
import time

# 🗂️ 输出路径（帧图保存位置）
output_dir = "../test_output"
os.makedirs(output_dir, exist_ok=True)

# 🎞️ 你使用的 AnimateDiff motion module 名称（请确认真实文件名）
motion_module = "mm_sd_v14.ckpt"  # ← 如有不同请替换

# 🧠 构造生成请求体
payload = {
    "prompt": "a girl dancing in a flower field, anime style, joyful atmosphere",
    "width": 512,
    "height": 512,
    "steps": 20,
    "cfg_scale": 7,
    "sampler_name": "Euler a",
    "batch_size": 1,
    "alwayson_scripts": {
        "AnimateDiff": {
            "args": [
                {
                    "enabled": True,
                    "motion_module": motion_module,
                    "video_length": 16,
                    "fps": 8,
                    "save_path": os.path.abspath(output_dir)
                }
            ]
        }
    }
}

# 🌐 WebUI API 地址
api_url = "http://127.0.0.1:7860/sdapi/v1/txt2img"
response = requests.post(api_url, json=payload)

# 📋 反馈结果
if response.status_code == 200:
    print("✅ AnimateDiff API 请求成功，等待帧图生成...")
else:
    print("❌ 请求失败：", response.status_code, response.text)
    exit(1)

# ⏳ 等待 WebUI 写入帧图（可根据系统情况调整）
time.sleep(6)

# 🔍 检查帧图
frames = [f for f in os.listdir(output_dir) if f.endswith(".png")]
if frames:
    print(f"✅ 共生成 {len(frames)} 张帧图，位于：{output_dir}")
else:
    print("❌ 未发现帧图，请确认 motion_module 是否正确或参数是否兼容")
