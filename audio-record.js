let mediaRecorder;
let audioChunks = [];

// 获取按钮和文本框元素
const recordButton = document.getElementById('record-button');
const stopRecordButton = document.getElementById('stop-record-button');
const uploadButton = document.getElementById('upload-button');
const textArea = document.getElementById('textArea');

// 开始录音逻辑
recordButton.addEventListener('click', async () => {
    try {
        // 获取用户麦克风权限
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // 初始化 MediaRecorder
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        // 禁用录音按钮，启用停止按钮
        recordButton.disabled = true;
        stopRecordButton.disabled = false;

        // 收集音频数据
        audioChunks = [];
        mediaRecorder.addEventListener('dataavailable', (event) => {
            audioChunks.push(event.data);
        });

        console.log('Recording started...');
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
});

// 停止录音逻辑
stopRecordButton.addEventListener('click', () => {
    mediaRecorder.stop();

    // 禁用停止按钮，启用上传按钮
    stopRecordButton.disabled = true;
    uploadButton.disabled = false;

    console.log('Recording stopped...');
});

// 上传音频逻辑
uploadButton.addEventListener('click', async () => {
    // 创建 Blob 对象
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

    // 检查 Blob 的大小是否大于 0
    if (audioBlob.size === 0) {
        console.error('The recorded audio is empty, please try recording again.');
        textArea.value = 'Error: Recorded audio is empty.';
        return;
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');

    try {
        // 调用后端 API
        const response = await fetch('http://127.0.0.1:5000/transcribe', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        // 显示转录结果到文本框
        textArea.value = result.transcription;
        console.log('Transcription:', result.transcription);

    } catch (error) {
        console.error('Error uploading audio:', error);
        textArea.value = `Error during transcription: ${error.message}`;
    } finally {
        // 禁用上传按钮，启用录音按钮
        uploadButton.disabled = true;
        recordButton.disabled = false;
    }
});