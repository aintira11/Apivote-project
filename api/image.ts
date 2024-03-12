import express from "express";
import { conn, queryAsync } from "../dbconnect";

export const router =express.Router();



router.get('/random/image',(req,res)=>{
    conn.query('SELECT ImageID,Name_photo,Photo FROM Image ORDER BY RAND() LIMIT 1', (error,results,fields)=>{
        if(error){
            return res.status(500).json({error : 'An error occurred while fetching the random image'});

        }
        const photo1= results[0]; //เก็บรูปแรกที่สุ่ม
        // เมื่อรับผลลัพธ์แล้วทำการ query รูปภาพที่สุ่มมาที่สองและต้องไม่ซ้ำกับรูปที่สุ่มมารูปแรก
        conn.query('SELECT * FROM Image WHERE ImageID != ? ORDER BY RAND() LIMIT 1',[photo1.ImageID],(error,results,fields)=>{
            if(error){
                return res.status(500).json({error: 'An error occurred while fetching the random image'});
            }
            const photo2 = results[0]; //เก็บรูปที่2

            return res.json({photo1,photo2});
        });
    });
});


//Get All image เรียงำลดับ มากไปน้อย
router.get('/get/allPhoto',(req,res)=>{
    const sql ="SELECT Name_photo,Photo,Score,User.User_Id,UserName FROM Image,User WHERE Image.User_Id = User.User_Id ORDER BY Score DESC";
    conn.query(sql,(err,result)=>{
                res.json(result);
                console.log(JSON.stringify(result));
            });
});

//get รูปของแต่ละคน
router.get('/:User_Id', (req, res) => {
    const User_Id = req.query.User_Id;
    const sql = "SELECT ImageID ,Name_photo, Photo, Score, User.User_Id, UserName FROM Image, User WHERE Image.User_Id = User.User_Id AND User.User_Id = ?";
    
    conn.query(sql, [User_Id], (err, result) => {
        res.json(result);
        console.log(JSON.stringify(result));
    });
});


//ลบรูป
router.delete("/:ImageID", (req, res) => {
    let id = +req.params.ImageID;
    conn.query("delete from Image where ImageID = ?", [id], (err, result) => {
       if (err) throw err;
       res
         .status(200)
         .json({ affected_row: result.affectedRows });
    });
  });

