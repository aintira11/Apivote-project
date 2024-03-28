import express from "express";

export const router = express.Router();

let cooldown = 0; // ตัวแปรสำหรับเก็บค่า cooldown เริ่มต้น

// เส้น API สำหรับตั้งค่า cooldown
router.post('/:cooldownTime', (req, res) => {
    const { cooldownTime } = req.params; // รับค่า cooldownTime จาก URL parameter
    const cooldownMinutes = parseInt(cooldownTime); // แปลงค่าเป็นตัวเลขและเก็บไว้ในตัวแปร cooldownMinutes
    cooldown = cooldownMinutes * 60000; // แปลงเป็นมิลลิวินาทีและกำหนดให้กับตัวแปร cooldown

    // ส่งข้อมูลการตั้งค่า cooldown กลับไปในรูปแบบ JSON
    const responseData = {
        minutes: cooldownMinutes,
        milliseconds: cooldown
    };
    res.json(responseData);

    // หรือหากคุณต้องการส่งข้อความยืนยันเพิ่มเติม
    // res.send('Cooldown time has been set successfully.');
});

// เส้น API สำหรับดึงค่า cooldown ที่เก็บไว้
router.get('/time', (req, res) => {
    // ส่งค่า cooldown ที่เก็บไว้ในรูปแบบ JSON กลับไป
    res.json({ cooldown: cooldown });
});