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
router.get('/get/allPhoto', (req, res) => {
//     const sql = `SELECT * FROM Vote 
//                     JOIN Image ON Vote.ImageID = Image.ImageID 
//                     JOIN User ON Image.User_Id = User.User_Id 
//                     WHERE Date_vote = ? 
//                     ORDER BY V_Score DESC 
//                     LIMIT 10`;
//     conn.query(sql, (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ error: 'Error fetching photos' });
//         }
//         res.json(result);
//         console.log(JSON.stringify(result));
//     });
// });

// 1. ดึงข้อมูลโหวตจากวันก่อนหน้านี้
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1); // ลดวันลง 1 วัน
const formattedYesterday = yesterday.toISOString().split('T')[0];

// 2. ดึงข้อมูลโหวตจากวันปัจจุบัน
const today = new Date();
const formattedToday = today.toISOString().split('T')[0];

// 3. เปรียบเทียบคะแนนโหวตระหว่างวันก่อนหน้ากับวันปัจจุบัน
const sql = `
    SELECT ImageID, V_Score AS yesterday_score
    FROM Vote
    WHERE Date_vote = ?
    ORDER BY V_Score DESC
    LIMIT 10
`;
conn.query(sql, [formattedYesterday], (err, yesterdayResults) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error fetching yesterday votes' });
    }

    conn.query(sql, [formattedToday], (err, todayResults) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching today votes' });
        }

        // เปรียบเทียบคะแนนโหวตและหาความแตกต่างของลำดับ
        const rankings: { ImageID: any; diff: number; }[] = [];
        todayResults.forEach((todayItem: { ImageID: any; }, index: number) => {
            const yesterdayItem = yesterdayResults.find((item: { ImageID: any; }) => item.ImageID === todayItem.ImageID);
            if (yesterdayItem) {
                const diff = index - yesterdayResults.indexOf(yesterdayItem);
                rankings.push({ ImageID: todayItem.ImageID, diff });
            } else {
                // หากไม่พบรายการในวันก่อนหน้า ให้ตั้งค่า diff เป็น -1
                rankings.push({ ImageID: todayItem.ImageID, diff: -1 });
            }
        });

        res.json(rankings);
    });
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

