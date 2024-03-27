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
router.put("/Image/:ImageID", fileUpload.diskLoader.single("Photo"), async (req, res) => {
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
    const data: ModelPhoto = req.body;
    const ImageID =req.params.ImageID;
    const sql = "UPDATE Image SET Name_photo=?, Photo=?,Score = 1000, Date_upload = NOW() WHERE ImageID = ?";
    conn.query(sql, [data.Name_photo, Photo,ImageID], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error inserting user' });
      }
      res.status(201).json({ Photo: Photo, result });
    });
    const sqlv = "UPDATE Vote SET V_Score=1000 WHERE  Date_vote = NOW() AND ImageID = ?";
    conn.query(sqlv, [ImageID], (err, result) => {
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