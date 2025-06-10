import requests
import os

def generate_animation(prompt, output_dir):
    """
    调用 WebUI API，通过 AnimateDiff 生成动画帧
    """
    os.makedirs(output_dir, exist_ok=True)

    payload = {
        "prompt": prompt,
        "width": 512,
        "height": 512,
        "steps": 20,
        "cfg_scale": 7,
        "sampler_name": "Euler a",
        "alwayson_scripts": {
            "AnimateDiff": {
                "args": [
                    {
                        "enabled": True,
                        "motion_module": "mm_sd_v15_v2.ckpt",  # 替换为你已有模型名
                        "video_length": 16,
                        "fps": 8,
                        "save_path": output_dir
                    }
                ]
            }
        }
    }

    api_url = "http://127.0.0.1:7860/sdapi/v1/txt2img"
    response = requests.post(api_url, json=payload)
    if response.status_code == 200:
        print("✅ AnimateDiff API 调用成功")
    else:
        print("❌ AnimateDiff API 请求失败:", response.text)
