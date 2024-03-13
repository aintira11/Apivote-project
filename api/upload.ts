import express from "express";
import path from "path";
import multer from "multer";
import { conn } from "../dbconnect";
import { ModelPhoto } from "../model/model";
// import mysql from "mysql";

export const router = express.Router();

//เชื่อม firebase

class FileMiddleware {
  filename = "";
  public readonly diskLoader = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix =
          Date.now() + "-" + Math.round(Math.random() * 10000);
        this.filename = uniqueSuffix + "." + file.originalname.split(".").pop();
        cb(null, this.filename);
      },
    }),
    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}

const fileUpload = new FileMiddleware(); 
//อัพรูป
router.post("/", fileUpload.diskLoader.single("Photo"), async (req, res) => {
  
  // const Photo = "https://apivote-project.onrender.com/uploads/"+fileUpload.filename;
  const Photo ="https://apivote-project.onrender.com/uploads/"+fileUpload.filename;
  let UserID : ModelPhoto =req.body;
  const currenData = new Date().toISOString();
  const sql = "INSERT INTO `Image` (User_Id,Name_photo,Photo,Date_upload) VALUES (?,?,?,NOW())";
  conn.query(sql,[UserID.User_Id,UserID.Name_photo,Photo],(err,result)=>{
    if(err){
      console.error(err);
      res.status(500).json({error : 'Error inserting user'});
      
    }else{
      res.status(201).json({Photo: Photo , result});
    }
  });
  
});

//แก้ไขรูป Avatar
// router.put("/",fileUpload.diskLoader.single("Avatar"),(req,res)=>{
//   // const Photo ="https://apivote-project.onrender.com/uploads/"+fileUpload.filename;
//   const Photo ="/uploads/"+fileUpload.filename;
//   let UserID : ModelPhoto = req.body;
//   const currenData = new Date().toISOString();
//   const sql = "INSERT INTO `Image` (User_Id,Name_photo,Photo,Date_upload) VALUES (?,?,?,NOW())";
//   conn.query(sql,[UserID.User_Id,UserID.Name_photo,Photo],(err,result)=>{
//     if(err){
//       console.error(err);
//       res.status(500).json({error : 'Error inserting user'});
      
//     }else{
//       res.status(201).json({affected_row: result.affected_row});
//     }
//   });
  
// });

