import express from "express";
import { router as index } from "./api/index";  //import router แต่เปลี่ยนชื่อเป็น index
import { router as user } from "./api/user"; 
import { router as image } from "./api/image";
import { router as upload } from "./api/upload";
import { router as Elo } from "./api/Elo";
import { router as updateimage } from "./api/updateimage";
import bodyParser from "body-parser";
export const app = express(); //export เพื่อเอาไปใช้ที่อื่นได้
import cors from "cors";

app.use(bodyParser.text());
app.use(bodyParser.json());
// app.use("/", (req, res) => {
//   res.send("Hello World!!!");
// });

app.use(
    cors({
      origin: "*",
    })
  );

// app.use("/GetUser",user);
app.use("/login",user);
app.use("/insert",user);
app.use("/Allmembers",user);

app.use("/random",image);
app.use("/RankPhoto",image);
app.use("/myPhoto",image);
app.use("/Delete",image);

app.use("/putUser_id",user);
app.use("/",Elo);

app.use("/upload", upload);
app.use("/uploads", express.static("uploads"));

app.use("/update",updateimage);