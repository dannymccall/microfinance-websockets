import express, { Request, Response, Application } from "express";
import { createServer } from "http";
import { initializeSocket, router } from "./socket";

const app: Application = express();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({
	extended: true,
	limit: "50mb",
	parameterLimit: 50000,
}))
app.use("/sockets", router)

const server = createServer(app);
initializeSocket(server);
app.get("/", (req: Request, res: Response) => {
	res.send("Hello, Typescript with express")
})

server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})