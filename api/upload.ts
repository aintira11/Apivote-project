import express from "express";
import path from "path";
import multer from "multer";
import { conn } from "../dbconnect";
import { ModelPhoto } from "../model/model";
// import mysql from "mysql";

export const router = express.Router();

//เชื่อม firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEg4DwZhyqF-xPHxQx2w0DdR6l0UdbtNs",
  authDomain: "vote-projectadv.firebaseapp.com",
  projectId: "vote-projectadv",
  storageBucket: "vote-projectadv.appspot.com",
  messagingSenderId: "197613618112",
  appId: "1:197613618112:web:9fb64dc47b6c5876b37e25",
  measurementId: "G-2STHK93H34"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const storage = getAnalytics();


class FileMiddleware {
  filename = "";
  public readonly diskLoader = multer({
    //
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 67108864, // 64 MByte
  },
});
}

const fileUpload = new FileMiddleware(); 
//อัพรูป
router.post("/", fileUpload.diskLoader.single("Photo"), async (req, res) => {
  
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

