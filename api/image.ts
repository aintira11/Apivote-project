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

    const sql = "SELECT * FROM Vote WHERE Date_vote = CURDATE() ORDER BY V_Score DESC LIMIT 10";
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
        const User_Id: string = req.params.User_Id;
        // หาวันที่ 7 วันที่ผ่านมา
        const lastSevenDays: Date = new Date();
        lastSevenDays.setDate(lastSevenDays.getDate() - 6);
        
        // ดึงข้อมูล Score ของรูปภาพที่ผู้ใช้มีส่วนร่วมในช่วง 7 วันที่ผ่านมา
        const query: string = `
                     SELECT Image.ImageID, Image.Date_upload, Image.Score,Image.Photo,Image.Name_photo, User.UserName,User.User_Id, Vote.Date_vote, Vote.V_Score
                     FROM Vote 
                     INNER JOIN Image ON Vote.ImageID = Image.ImageID 
                     INNER JOIN User ON Image.User_Id = User.User_Id
                     WHERE Vote.Date_vote >= ? AND User.User_Id = ? 
                     ORDER BY Image.ImageID, Vote.Date_vote`;
        conn.query(query, [lastSevenDays, User_Id], (err: any, results: any) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching votes' });
            }
            // สร้างอาร์เรย์เพื่อเก็บผลลัพธ์ที่แยกตามรูปภาพ
            const imageStatistics: any[] = [];
            let currentImage: any = null;
            // ลูปผลลัพธ์ที่ได้จากคำสั่ง SQL
            for (const row of results) {
                // ถ้ารูปภาพปัจจุบันไม่มีข้อมูลหรือมี ID รูปภาพใหม่
                if (!currentImage || currentImage.ImageID !== row.ImageID) {
                    // สร้างข้อมูลรูปภาพใหม่
                    currentImage = {
                        ImageID: row.ImageID,
                        Date_upload: row.Date_upload,
                        Score: row.Score,
                        UserName: row.UserName,
                        User_Id: row.User_Id,
                        Photo: row.Photo,
                        Name_photo: row.Name_photo,
                        Votes: [] // สร้างอาร์เรย์เพื่อเก็บข้อมูลของวันที่โหวตและคะแนน
                    };
                    // เพิ่มข้อมูลรูปภาพใหม่เข้าไปในอาร์เรย์
                    imageStatistics.push(currentImage);
                }
                // เพิ่มข้อมูลวันที่โหวตและคะแนนลงในอาร์เรย์ของรูปภาพปัจจุบัน
                currentImage.Votes.push({ Date_vote: row.Date_vote, V_Score: row.V_Score });
            }
            // ส่งข้อมูลอาร์เรย์ที่ได้กลับไป
            res.json(imageStatistics);
        });
    } catch (error) {
        console.error("Error fetching image statistics:", error);
        res.status(500).json({ error: "Failed to fetch image statistics" });
    }
});

    // // สร้างวัตถุ Date สำหรับวันก่อนหน้าและวันปัจจุบัน
    // const previousDate = new Date();
    // const currentDate = new Date();
    
    // // ลดวันที่ของ previousDate ลง 1 วัน
    // previousDate.setDate(previousDate.getDate() - 1);
    
    // // แปลงรูปแบบวันที่ให้เป็น ISO string โดยใช้ toISOString()
    // const formattedPreviousDate = previousDate.toISOString().split('T')[0];
    // const formattedCurrentDate = currentDate.toISOString().split('T')[0];
    
    // console.log('Previous Date:', formattedPreviousDate);
    // console.log('Current Date:', formattedCurrentDate);

    router.get('/get/diff', (req, res) => {
        // ดึงข้อมูลรูปภาพและคะแนนก่อนการโหวตของวันก่อนหน้า
        const sqlBefore = `SELECT * FROM Vote WHERE Date_vote = CURDATE() - INTERVAL 1 DAY ORDER BY V_Score DESC `;
        conn.query({sql: sqlBefore, timeout: 60000}, (err, beforeResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching photos for the previous day' });
            }
    
            // ดึงข้อมูลรูปภาพและคะแนนหลังการโหวตของวันปัจจุบัน
            const sqlAfter = `SELECT * FROM Vote WHERE Date_vote = CURDATE() ORDER BY V_Score DESC LIMIT 10`;
            conn.query({sql: sqlAfter, timeout: 60000}, (err, afterResults) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error fetching photos for the current day' });
                }
    
                // คำนวณหาความแตกต่างในอันดับระหว่างวันก่อนหน้าและวันปัจจุบัน
                const rankingsDiff: { ImageID: any; V_Score: number; diff: number | null; rank_previous: number; rank_current: number }[] = [];
                afterResults.forEach((afterItem: { ImageID: any; V_Score: number; }, index: number) => {
                    const beforeIndex = beforeResults.findIndex((item: { ImageID: any; }) => item.ImageID === afterItem.ImageID);
                    const rank_previous = beforeIndex !== -1 ? beforeIndex + 1 : null;
                    const rank_current = index + 1;
                    const diff = rank_previous !== null ? rank_previous - rank_current : null;
                    rankingsDiff.push({ ImageID: afterItem.ImageID, V_Score: afterItem.V_Score, diff, rank_previous, rank_current });
                });
                console.log(rankingsDiff);
                res.json(rankingsDiff);
            });
        });
    });
    
    