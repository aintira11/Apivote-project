import express from "express";
import { conn, queryAsync } from "../dbconnect";

export const router =express.Router();

//rank all
router.get('/allPhoto/Rank', (req, res) => {
    const sql = "SELECT * FROM Image ,User WHERE Image.User_Id = User.User_Id  ORDER BY Score DESC";
    // const sql =`SELECT *, ROW_NUMBER() OVER (ORDER BY Score DESC) AS ranking  FROM Image JOIN User ON Image.User_Id = User.User_Id ORDER BY Score DESC`;
    conn.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching votes' });
        }
        res.json(result);
    });
});


//rank รูป ของ user
router.get('/myrank/:User_Id', (req, res) => {
    const User_Id = req.params.User_Id;
    
    // หารูปของ User
    const sqlAfter = "SELECT ImageID ,Name_photo, Photo, Score, User.User_Id, UserName FROM Image, User WHERE Image.User_Id = User.User_Id AND User.User_Id = ?";
    conn.query({sql: sqlAfter, timeout: 60000}, [User_Id], (err, afterResults) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching photos for the current user' });
        }

        // จัดอันดับรูป
        const sqlRank = "SELECT ImageID, Score FROM Image ORDER BY Score DESC";
        conn.query({sql: sqlRank, timeout: 60000}, (err, rankResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching rankings' });
            }

            // ค้นหาอันดับของรูปภาพของผู้ใช้
            const userRankings: { ImageID: any; Score: number; rank: number | null }[] = [];
            afterResults.forEach((afterItem: { ImageID: any; Score: number; }, index: number) => {
                const userRank = rankResults.findIndex((item: { ImageID: any; }) => item.ImageID === afterItem.ImageID);
                const rank = userRank !== -1 ? userRank + 1 : null;
                userRankings.push({ ImageID: afterItem.ImageID, Score: afterItem.Score, rank });
            });
            console.log(userRankings);
            res.json(userRankings);
        });
    });
});


// diff ของแต่ละรูป
router.get('/rank/diff/:ImageID', (req, res) => {
    const ImageID = req.params.ImageID;
    console.log("ImageID",ImageID);
    
    // ดึงข้อมูลรูปภาพและคะแนนก่อนการโหวตของวันก่อนหน้า
    const sqlBefore = `SELECT * FROM Vote WHERE Date_vote = CURDATE() - INTERVAL 1 DAY ORDER BY V_Score DESC `;
    conn.query({sql: sqlBefore, timeout: 60000}, (err, beforeResults) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching photos for the previous day' });
        }
        console.log(beforeResults);
        
        // ดึงข้อมูลรูปภาพและคะแนนหลังการโหวตของวันปัจจุบัน
        const sqlAfter = `SELECT * FROM Vote WHERE Date_vote = CURDATE() ORDER BY V_Score DESC `;
        conn.query({sql: sqlAfter, timeout: 60000}, (err, afterResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching photos for the current day' });
            }
            console.log(afterResults);
            

            let currentRank = null;
            let previousRank = null;
            let rankChange = null;

            // หาค่าอันดับปัจจุบันของรูปภาพ
            const currentImageIndex = afterResults.findIndex((item: any) => ImageID ===item.ImageID);
            if (currentImageIndex !== -1) {
                currentRank = currentImageIndex + 1;
            }

            // หาค่าอันดับก่อนหน้าของรูปภาพ
            const previousImageIndex = beforeResults.findIndex((item: any) => ImageID === item.ImageID );
            if (previousImageIndex !== -1) {
                previousRank = previousImageIndex + 1;
            }

            // คำนวณค่าการเปลี่ยนแปลงของอันดับ
            if (currentRank !== null && previousRank !== null) {
                rankChange = previousRank - currentRank;
            }

            res.json({ currentRank, previousRank, rankChange });
        });
    });
});
