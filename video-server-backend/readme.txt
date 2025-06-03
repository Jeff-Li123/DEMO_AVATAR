1. example of videos api

{
  "success": "true",
  "message": "Videos fetched successfully",
  "data": [
    {
      "videoUrl": "https://example.com/videos/sample1.mp4"
    },
    {
      "videoUrl": "https://example.com/videos/sample2.mp4"
    },
    {
      "videoUrl": "https://example.com/videos/sample3.mp4"
    }
  ]
}

2. install the library
pip install -r .\requirement.txt

3. run server
python .\main_video_server.py

4. use local postman application 
GET  http://localhost:5000/api/videos
