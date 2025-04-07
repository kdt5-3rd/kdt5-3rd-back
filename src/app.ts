import express from "express";
import userRouter from "./routes/user.route";
import taskRouter from "./routes/task.route";
import pingRouter from "./routes/ping.route";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());
app.use("/api/ping", pingRouter);
app.use("/api/users", userRouter);

// 일정 등록, 수정, 삭제 Router
app.use("/api/tasks", taskRouter);

// 공통 에러 핸들러, 모든 라우터 등록 이후에 배치해야 문제가 발생하지 않음
app.use(errorHandler);

export default app;
