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

   // const sql = `SELECT * FROM Vote 
        //                 JOIN Image ON Vote.ImageID = Image.ImageID 
        //                 JOIN User ON Image.User_Id = User.User_Id 
        //                 WHERE Date_vote = '2024-03-14' 
        //                 ORDER BY V_Score DESC 
        //                 LIMIT 10`;
        // conn.query(sql, (err, result) => {
        //     if (err) {
        //         console.error(err);
        //         return res.status(500).json({ error: 'Error fetching photos' });
        //     }
        //     res.json(result);
        //     console.log(JSON.stringify(result));
        // });

//Get All image เรียงำลดับ มากไปน้อย ของวัน ปจุบัน
router.get('/get/allPhoto', (req, res) => {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // เพิ่ม 1 เนื่องจาก getMonth เริ่มต้นที่ 0 สำหรับเดือนมกราคม
    const year = currentDate.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    console.log(formattedDate);

    const sql = "SELECT * FROM Vote WHERE Date_vote = ? ORDER BY V_Score DESC LIMIT 10";
    conn.query(sql, [formattedDate], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching votes' });
        }

        const imageIDs = result.map((row: { ImageID: any; }) => row.ImageID);
        const imagePromises = imageIDs.map((ImageID: any) => {
            return new Promise((resolve, reject) => {
                const sqlImage = "SELECT * FROM Image ,User WHERE Image.User_Id = User.User_Id AND ImageID = ?";
                conn.query(sqlImage, [ImageID], (imageErr, imageResult) => {
                    if (imageErr) {
                        reject(imageErr);
                        return;
                    }
                    resolve(imageResult[0]);
                });
            });
        });

        Promise.all(imagePromises)
            .then((imageResults) => {
                const finalResults = result.map((row: any, index:  number) => ({
                    ...row,
                    image: imageResults[index]
                }));
                res.json(finalResults);
            })
            .catch((error) => {
                console.error('Error fetching images:', error);
                res.status(500).json({ error: 'Error fetching images' });
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


  //get ข้อมูลของรูปนั้นๆ
router.get('/data/:ImageID', (req, res) => {
    const ImageID = req.params.ImageID;
    const sql = "SELECT * FROM Image WHERE ImageID = ?";
    
    conn.query(sql, [ImageID], (err, result) => {
        res.json(result);
        console.log(JSON.stringify(result));
    });
});

//statistics Image
router.get("/score/:User_Id", async (req, res) => {
    try {
        const User_Id = req.params.User_Id;
        // หาวันที่ 7 วันที่ผ่านมา
        const lastSevenDays = new Date();
        lastSevenDays.setDate(lastSevenDays.getDate() - 7);
        
        // ดึงข้อมูล Score ของรูปภาพที่ผู้ใช้มีส่วนร่วมในช่วง 7 วันที่ผ่านมา
        const query = `
                     SELECT Vote.*, Image.*, User.* 
                     FROM Vote 
                     INNER JOIN Image ON Vote.ImageID = Image.ImageID 
                     INNER JOIN User ON Image.User_Id = User.User_Id
                     WHERE Vote.Date_vote >= ? AND User.User_Id = ? 
                     ORDER BY Vote.ImageID, Vote.Date_vote`;
        conn.query(query, [lastSevenDays, User_Id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching votes' });
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Error fetching image statistics:", error);
        res.status(500).json({ error: "Failed to fetch image statistics" });
    }
});

