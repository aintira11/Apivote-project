import express from "express";
import { conn, queryAsync } from "../dbconnect";

export const router =express.Router();


router.get('/rankdif', (req, res) => {
    // ดึงข้อมูลรูปภาพและคะแนนก่อนการโหวตของวันก่อนหน้า
    const sqlBefore = `SELECT * FROM Vote WHERE Date_vote = CURDATE() - INTERVAL 1 DAY ORDER BY V_Score DESC `;
    conn.query({sql: sqlBefore, timeout: 60000}, (err, beforeResults) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching photos for the previous day' });
        }

        // ดึงข้อมูลรูปภาพและคะแนนหลังการโหวตของวันปัจจุบัน
        const sqlAfter = `SELECT * FROM Vote WHERE Date_vote = CURDATE() ORDER BY V_Score DESC `;
        conn.query({sql: sqlAfter, timeout: 60000}, (err, afterResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error fetching photos for the current day' });
            }

            // คำนวณหาความแตกต่างในอันดับระหว่างวันก่อนหน้าและวันปัจจุบัน
            const rankingsDiff: { ImageID: any; V_Score: number; diff: number | null; rank_previous: number; rank_current: number }[] = [];
            afterResults.forEach((afterItem: { ImageID: any; V_Score: number; }, index: number) => {
                const beforeIndex = beforeResults.findIndex((item: { ImageID: any; }) => item.ImageID === afterItem.ImageID);
                 //findIndex เพื่อค้นหาว่ารูปภาพเดียวกันใน afterItem มีอันดับเท่าไรในข้อมูลเมื่อวาน (ที่เก็บใน beforeResults)
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


router.get('/allPhoto/Rank', (req, res) => {
    const sql = "SELECT * FROM Image ,User WHERE Image.User_Id = User.User_Id  ORDER BY Score DESC";
    conn.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching votes' });
        }
        res.json(result);
    });
});
