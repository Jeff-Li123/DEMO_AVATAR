def generate_prompt_from_keywords(json_data):
    """
    从 JSON 的 video 字段提取关键词生成 prompt
    """
    keywords = json_data.get("video", {})

    emotion = keywords.get("emotion", "")
    scene = keywords.get("scene", "")
    character = keywords.get("character", "")
    style = keywords.get("style", "")
    action = keywords.get("action", "")

    prompt = f"{character} {action} in {scene}, {style} style, {emotion} atmosphere"
    return prompt.strip()
