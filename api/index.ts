import express from "express";

export const router = express.Router();

let cooldown = 0; // ตัวแปรสำหรับเก็บค่า cooldown เริ่มต้น

// เส้น API สำหรับตั้งค่า cooldown
router.post('/:cooldownTime', (req, res) => {
    const { cooldownTime } = req.params; // รับค่า cooldownTime จาก URL parameter
    const cooldownMinutes = parseInt(cooldownTime); // แปลงค่าเป็นตัวเลขและเก็บไว้ในตัวแปร cooldownMinutes
    const cooldown = cooldownMinutes * 60000; // แปลงเป็นมิลลิวินาทีและกำหนดให้กับตัวแปร cooldown
    // 1 นาที เท่ากับ 60 วินาที
    const responseData = {
        minutes: cooldownMinutes,
        milliseconds: cooldown
    };
    res.json(responseData); // ส่งข้อมูลกลับไปในรูปแบบ JSON
});


// เส้น API สำหรับดึงค่า cooldown ที่เก็บไว้
router.get('/time', (req, res) => {
    res.json({ cooldown: cooldown.toString() }); // ส่งค่า cooldown เป็นข้อมูลประเภท JSON
});

