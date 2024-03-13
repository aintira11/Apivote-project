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
// import { getAnalytics } from "firebase/analytics";
import { getStorage, ref,uploadBytesResumable,getDownloadURL} from "firebase/storage";

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
const storage = getStorage();


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
router.post("/", fileUpload.diskLoader.single("Photo"), async (req, res) => {
  try {
    // อัพโหลดรูปภาพไปยัง Firebase Storage
    const filename = Date.now() + "-" + Math.round(Math.random() * 1000) + ".png";
    const storageRef = ref(storage, "/images/" + filename);
    const metadata = { contentType: req.file!.mimetype };
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
    const url = await getDownloadURL(snapshot.ref);

    // บันทึกรูปภาพลงใน Firebase Storage และรับ URL ของรูปภาพ
    const Photo = url;

    // บันทึกข้อมูลลงในฐานข้อมูล MySQL
    const UserID: ModelPhoto = req.body;
    const sql = "INSERT INTO `Image` (User_Id, Name_photo, Photo, Date_upload) VALUES (?, ?, ?, NOW())";
    conn.query(sql, [UserID.User_Id, UserID.Name_photo, Photo], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error inserting user' });
      }
      res.status(201).json({ Photo: Photo, result });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading image and inserting user' });
  }
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

