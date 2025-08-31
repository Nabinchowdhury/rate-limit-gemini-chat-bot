## for redis
docker run -p 6379:6379 -it redis/redis-stack-server:latest


### RUN server
    nodemon server.js

### login api
    endpoint: http://localhost:3000/api/login
    body: {"id": 333, "role": "premium"}

### get status api
    endpoint: http://localhost:3000/api/login
    body: {"id": 333, "role": "premium"}

### basic get api
    endpoint: http://localhost:3000/geminiAi-integration/
    headers : 
            authorization : `Bearer ${JWT}` || null

