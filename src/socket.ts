import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import express, { Application, Request, Response, Router } from "express"



const connectedUsers: Record<string, string> = {};
let io: Server | any = null;
export const initializeSocket = (server: HttpServer) => {
	io = new Server(server, {
		cors: {
			origin: "*",
		},
	})

	io.on("connection", (socket: Socket) => {
		console.log("A user connected: ", socket.id);

		io.emit("message", "a new message");

		// socket.on("message", (data) => {
		// 	console.log("Recieved message:", data);
		// 	io.emit("message", "a new message")
		// })

		socket.on("newLoanApplicationSubmited", (message) => {
			io.emit("notifyAdmin", message);
		})

		socket.on("join", (userId) => {
			connectedUsers[userId] = socket.id;
			console.log({ connectedUsers })
		})

		socket.on("paymentMade", message => {
			console.log("a new payment made")
			io.emit("notifyAdmin", message);
		})



		socket.on("disconnect", () => {
			const userId = Object.keys(connectedUsers).find((key) => connectedUsers[key] === socket.id);
			if (userId) {
				delete connectedUsers[userId];
				console.log(connectedUsers)
			}
			console.log("User disconnected:", socket.id);

		})


	})


	return io;
}





export const router: Router = express.Router();

router.post("/notify-loan-officer", (req: any, res: any) => {
	if (!io) return res.status(500).json({ error: "Socket.io is not initiallized" })
	const { loanOfficer, message } = req.body;
	
	if (!loanOfficer) return res.json({ success: false, message: "Loan officer required" })

	const officerSocketId = connectedUsers[loanOfficer];

	if (!officerSocketId) return res.json({ success: false, message: "This user is not connected" })
	
	io.to(officerSocketId).emit("loanApproved", message);
	return res.json({ success: true })
})


router.post("/notify-admin", (req: any, res:any)  => {
	if (!io) return res.status(500).json({ error: "Socket.io is not initiallized" });
	const {message} = req.body;
	console.log(message)
	io.emit("notifyAdmin", message);

	return  res.json({success:true})
})