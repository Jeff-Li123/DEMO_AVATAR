let mediaRecorder;
let audioChunks = [];

const recordButton = document.getElementById('record-button');
const stopRecordButton = document.getElementById('stop-record-button');
const textArea = document.getElementById('textArea');
const msgHistory = document.getElementById('msgHistory'); // 聊天历史区域

// 开始录音逻辑
recordButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        recordButton.disabled = true;
        stopRecordButton.disabled = false;

        audioChunks = [];
        mediaRecorder.addEventListener('dataavailable', (event) => {
            audioChunks.push(event.data);
        });
        
        console.log('Recording started...');
        textArea.value = "Recording...";
    } catch (error) {
        console.error('Error accessing microphone:', error);
        textArea.value = `Error accessing microphone: ${error.message}`;
    }
});

// 停止录音逻辑
stopRecordButton.addEventListener('click', () => {
    mediaRecorder.stop();
    stopRecordButton.disabled = true;
    console.log('Recording stopped...');
    textArea.value = "Recording stopped. Press 'Send' to transcribe and send.";
});

// 在 Send 按钮点击时调用的转录函数
async function transcribeAudio() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    if (audioBlob.size === 0) {
        console.error('The recorded audio is empty.');
        textArea.value = 'Error: Recorded audio is empty. Please record again.';
        return '';
    }
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');

    try {
        const response = await fetch('http://127.0.0.1:5000/transcribe', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        const result = await response.json();
        console.log('Transcription:', result.transcription);
        // 将转录结果显示在文本框中
        textArea.value = result.transcription; 
        // 同时在 msgHistory 中显示转录结果，模拟为用户输入的文字消息
        msgHistory.innerHTML += `<span style='opacity:0.5'><u>User(Voice):</u> ${result.transcription}</span><br>`;
        return result.transcription;
    } catch (error) {
        console.error('Error uploading audio:', error);
        textArea.value = `Error during transcription: ${error.message}`;
        return '';
    }
}

export { transcribeAudio, audioChunks };
