import subprocess

def generate_animation(prompt, output_dir):
    """
    这里根据你自己的 AnimateDiff 脚本或 API 实现方式调用生成帧图。
    示例中假设你已有 CLI 脚本支持 prompt 参数
    """
    command = [
        "python", "scripts/animatediff_generate.py",  # 你已有的脚本路径
        "--prompt", prompt,
        "--outdir", output_dir
    ]
    subprocess.run(command)
