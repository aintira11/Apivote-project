import express from "express";
import multer from "multer";
import { conn } from "../dbconnect";
import { modelUser } from "../model/model";

export const router = express.Router();

//เชื่อม firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
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



// PUT endpoint สำหรับการอัปเดตข้อมูลผู้ใช้ *ยังอัพรูปไม่ได้
// router.put("/:User_id", async (req, res) =>  {
//     const id = +req.params.User_id;
//     const newUser = req.body;

//     // ดึงข้อมูลผู้ใช้เดิมจากฐานข้อมูล
//     const sqlSelect = 'SELECT * FROM User WHERE User_Id = ?';
//     conn.query(sqlSelect, [id], (err, results) => {
//         if (err) {
//             console.error('Error selecting user:', err);
//             res.status(500).json({ error: 'Error selecting user' });
//             return;
//         }

//         if (results.length === 0) {
//             res.status(404).json({ error: 'User not found' });
//             return;
//         }

//         const originalUser = results[0];

//         // รวมข้อมูลใหม่กับข้อมูลเดิม
//         const updatedUser = { ...originalUser, ...newUser };

//         // ทำการอัปเดตข้อมูลในฐานข้อมูล
//         const sqlUpdate = "UPDATE User SET UserName=?, Name=?, Avatar=? WHERE User_Id=?";
//         conn.query(sqlUpdate, [updatedUser.UserName, updatedUser.Name, updatedUser.Avatar, id], (err, result) => {
//             if (err) {
//                 console.error('Error updating user:', err);
//                 res.status(500).json({ error: 'Error updating user' });
//                 return;
//             }
            
//             res.status(200).json({ affected_rows: result.affectedRows });
//         });
//     });
// }); 

const fileUpload = new FileMiddleware(); 
router.put("/:User_Id", fileUpload.diskLoader.single("Avatar"), async (req, res) => {
  try {

     // ตรวจสอบว่ามีการรับรหัสผ่านมาหรือไม่
     if (!req.body.Password) {
        return res.status(400).json({ error: 'Password is required' });
      }
  
      // ตรวจสอบรหัสผ่านในฐานข้อมูล
      const data: modelUser = req.body;
      const User_Id =req.params.User_Id;
    //   const { User_Id, Password, UserName, Name, Email } = req.body;
      const sqlCheckPassword = "SELECT * FROM User WHERE User_Id = ? AND Password = ?";
      conn.query(sqlCheckPassword, [User_Id, data.Password], async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error checking password' });
        }
  
        if (result.length === 0) {
          // ถ้ารหัสผ่านไม่ตรงกับในฐานข้อมูล
          return res.status(401).json({ error: 'Invalid password' });
        }
  
    // อัพโหลดรูปภาพไปยัง Firebase Storage
    const filename = Date.now() + "-" + Math.round(Math.random() * 1000) + ".png";
    const storageRef = ref(storage, "/Avatar/" + filename);
    const metadata = { contentType: req.file!.mimetype };
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
    const url = await getDownloadURL(snapshot.ref);

    // บันทึกรูปภาพลงใน Firebase Storage และรับ URL ของรูปภาพ
    const Avatar = url;

    // บันทึกข้อมูลลงในฐานข้อมูล MySQL
    const sql = "UPDATE User SET UserName=?, Name=?, Email=? ,Avatar =? WHERE  User_Id = ?";
    conn.query(sql, [data.UserName, data.Name,data.Email,Avatar,User_Id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error inserting user' });
      }
      res.status(201).json({ Photo: Avatar, result });
      res.status(200)
         .json({ affected_row: result.affectedRows });
    });
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading image and inserting user' });
  }
});