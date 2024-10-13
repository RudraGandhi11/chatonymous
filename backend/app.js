import express from "express";
import { Server } from "socket.io";
import { createServer } from "http"
import cors from "cors"
let connected_user = {} //object for connected users with unique usernames {username,socketid}
let waiting_list = [] //array of object for waiting queue {username,socketId}
let pair_id = 0 //unique pairId for connected pairs
let pairs = {} //pair object {pairid:[socketid1,socketid2]}

const app = express()
const server = createServer(app)
const io = new Server(server,{
    cors : {
        origin : "http://localhost:3000",
        methods : ["GET","POST"],
        credentials : true
    }
}) //The cors is setup for io


//Socket Part

io.on("connection",(socket) => {

    socket.on("checkUsernameAvaibility",(username) => {
        if(connected_user[username])
        {
            socket.emit("userNameIsAvailable",-1)
        }
        else
        {
            socket.emit("userNameIsAvailable",1)
            connected_user[username] = socket.id
        }
    })

    socket.on("checkWaitingList",(username)=>{
        if(waiting_list.length > 0)
        {
            let last_user = waiting_list.pop()
            pair_id++ 
            pairs[pair_id] = [last_user.socketId,socket.id]
            io.to(last_user.socketId).emit("connected-pair",{message:"You are connected "+username,uname:username,socketId:socket.id,connected:true}) //for the last user who pop out
            socket.emit("connected-pair",{message:"You are connected "+last_user.username,uname:last_user.username,socketId:last_user.socketId,connected:true}) // for the user who joined
        }
        else
        {
            waiting_list.push({username:username,socketId:socket.id})
            socket.emit("connected-pair",{message:"You are in waiting queue",uname:null,socketId:null,connected:false})
        }
    })

    socket.on("send-message",(data)=>{
        socket.to(connected_user[data.toUser]).emit("recieve-message",{toUser:data.toUser,fromUser:data.fromUser,content:data.content})
    })

    socket.on("skip-chat",(data)=>{
        socket.to(connected_user[data.skipTo]).emit("got-skipped",{gotSkipped:true})
    })

    socket.on("disconnect",()=>{
        for(let usernames in connected_user)
        {
            if(connected_user[usernames] == socket.id)
            {
                delete connected_user[usernames]
                break;
            }
        }
        for(let pairNum in pairs)
        {
            if(pairs[pairNum][0] == socket.id || pairs[pairNum][1] == socket.id)
            {
                if(pairs[pairNum][0] == socket.id)
                {
                    socket.to(pairs[pairNum][1]).emit("got-skipped",{gotSkipped:true})
                }
                if(pairs[pairNum][1] == socket.id)
                {
                    socket.to(pairs[pairNum][0]).emit("got-skipped",{gotSkipped:true})
                }
                delete pairs[pairNum]
            }
        }
        function removerUserFromWaitingList(user)
        {
            if(user.socketId == socket.id)
            {
                return false
            }
        }
        waiting_list = waiting_list.filter(removerUserFromWaitingList)
    })
})

app.use(cors({
    origin : "http://localhost:3000/",
    methods : ["GET","POST"],
    credentials : true
})) //The cors is setup for apis

server.listen(8000)