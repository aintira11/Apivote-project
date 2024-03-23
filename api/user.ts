import express from "express";
import { conn, queryAsync } from "../dbconnect";
import { modelUser } from "../model/model";
import bcrypt from "bcrypt";

export const router =express.Router();

//login
router.get("/:user",async(req,res)=>{
    const Email = req.query.Email;
    const Password = req.query.Password;
    const sql = "select * from User WHERE Email =? AND Password=?";
    conn.query(sql,[Email,Password],(err,result)=>{
        res.json(result);
    });
}); 
// router.get("/:user", async (req, res) => {
//     const Email = req.query.Email;
//     const Password = req.query.Password;

//     // เข้ารหัสรหัสผ่านที่ถูกส่งมาก่อนที่จะใช้ในคำสั่ง SQL
//     const hashedPassword = await bcrypt.hash(Password, 10); // 10 เป็นค่า salt

//     const sql = "SELECT * FROM User WHERE Email = ? AND Password = ?";
//     conn.query(sql, [Email, hashedPassword], (err, result) => {
//         res.json(result);
//     });
// });

//*** */
router.get("/read/:Id",async(req,res)=>{
    const User_Id = req.query.User_Id;
    // const Password = req.query.Password;
    const sql = "select * from User WHERE User_Id =? ";
    conn.query(sql,[User_Id],(err,result)=>{
        res.json(result);
    });
}); 



//member add
router.post('/:add',(req,res)=>{
    let user : modelUser = req.body;
    let sql = "INSERT INTO `User`(`Email`,`Password`,`UserName`,`Name`,`Type`,`Avatar`) VALUES(?,?,?,?,'member','https://www.hotelbooqi.com/wp-content/uploads/2021/12/128-1280406_view-user-icon-png-user-circle-icon-png.png')";

    conn.query(sql,[user.Email, user.Password, user.UserName, user.Name],(err,result)=>{
                    if(err){
                        console.error('Error inserting user :',err);
                        res.status(500).json({error: 'Error inserting user'});
                    } else {
                        res.status(201).json({affected_row:result.affectedRows});
                    }
                });
    // ทำการ hash รหัสผ่าน
    // bcrypt.hash(user.Password, 10, function(err: any, hash: any) {
    //     if(err) {
    //         console.error('Error hashing password:', err);
    //         res.status(500).json({error: 'Error hashing password'});
    //     } else {
    //         // เมื่อ hash สำเร็จ ให้นำ hash ไปเก็บลงในฐานข้อมูล
    //         conn.query(sql,[user.Email, hash, user.UserName, user.Name],(err,result)=>{
    //             if(err){
    //                 console.error('Error inserting user :',err);
    //                 res.status(500).json({error: 'Error inserting user'});
    //             } else {
    //                 res.status(201).json({affected_row:result.affectedRows});
    //             }
    //         });
    //     }
    // });
});


// PUT endpoint สำหรับการอัปเดตข้อมูลผู้ใช้ *ยังอัพรูปไม่ได้
router.put("/:User_id", async (req, res) =>  {
    const id = +req.params.User_id;
    const newUser = req.body;

    // ดึงข้อมูลผู้ใช้เดิมจากฐานข้อมูล
    const sqlSelect = 'SELECT * FROM User WHERE User_Id = ?';
    conn.query(sqlSelect, [id], (err, results) => {
        if (err) {
            console.error('Error selecting user:', err);
            res.status(500).json({ error: 'Error selecting user' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const originalUser = results[0];

        // รวมข้อมูลใหม่กับข้อมูลเดิม
        const updatedUser = { ...originalUser, ...newUser };

        // ทำการอัปเดตข้อมูลในฐานข้อมูล
        const sqlUpdate = "UPDATE User SET UserName=?, Name=?, Avatar=? WHERE User_Id=?";
        conn.query(sqlUpdate, [updatedUser.UserName, updatedUser.Name, updatedUser.Avatar, id], (err, result) => {
            if (err) {
                console.error('Error updating user:', err);
                res.status(500).json({ error: 'Error updating user' });
                return;
            }
            
            res.status(200).json({ affected_rows: result.affectedRows });
        });
    });
}); 


//  get all สมาชิก
router.get("/get/allMembers",async(req,res)=>{
    const sql = "SELECT * FROM User ";
    // const sql = "SELECT * FROM User WHERE Type = 'member' ";
    conn.query(sql,(err,result)=>{
        res.json(result);
        console.log(JSON.stringify(result));
    });
});