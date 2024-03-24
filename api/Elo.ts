import express from "express";
import { conn, queryAsync } from "../dbconnect";
// import { modelUser } from "../model/model";
export const router = express.Router();

// router.post("/elo/vote",(req,res)=>{
//     const ImageID1 = req.body.ImageID1;
//     const ImageID2 = req.body.ImageID2;
//     const Score1 = req.body.Score1;
//     const Score2 = req.body.Score2;

//     console.log("ImageID1 :",ImageID1);
//     console.log("ImageID2 :",ImageID2);
//     console.log("Score1 :",Score1);
//     console.log("Score2 :",Score2);

//     let Ra: number ;
//     let Rb: number;
  
//     //select ข้อมูลของรูปภาพ ออกมา
//     conn.query("SELECT * FROM Image WHERE ImageID =?",[ImageID1],
//     (error,results1) =>{
//         if(error){
//             return res .status(500).json({error : " error Image1"});
//         }
//         Ra = results1[0].Score; //เก็บคะแนนเดิมที่ดึงออกมา

//     conn.query("SELECT * FROM Image WHERE ImageID =?",[ImageID2],
//     (error,results2) =>{
//         if(error){
//             return res .status(500).json({error : " error Image2"});
//         }
//         Rb = results2[0].Score;  //เก็บคะแนนเดิมที่ดึงออกมา

//         console.log("Ra :",Ra);
//         console.log("Rb :",Rb);


//         //คำนวณ ELO 
//         const Ea = 1 / (1+ Math.pow(10,(Rb -Ra)/400));
//         const Eb = 1 / (1+ Math.pow(10,(Ra -Rb)/400));
//         console.log("Ea : " + Ea);
//         console.log("Eb : " + Eb);

//         //เอาค่า Ea,Eb มาลบ ในที้นี้ Score (ที่ส่งมาจากการคลิก)ชนะ =1 , แพ้=0
//         const Rpa : number = Ra + 32 *(Score1 - Ea);
//         const Rpb : number = Ra + 32 *(Score2 - Eb);
//         console.log("Rpa : " + Rpa);
//         console.log("Rpb : " + Rpb);


//         const DateOriginal = new Date();
//         const day = DateOriginal.getDate();
//         const month = DateOriginal.getMonth() + 1;
//         const year = DateOriginal.getFullYear();
//         const matDateDATA = `${year}-${month}-${day}`;
//         console.log(matDateDATA);


//          //เช็คว่า รูปนี้เคยมีการโหวตในวันนั้นๆแล้วหรือยัง  ถ้าเคยถูกโหวตไปแล้วจะไม่ทำการเพิ่ม ฟิวในtable Vote 
//         //แต่จะเป็นการ อัพเดตจะแนนใน table Image เลย
//         conn.query("SELECT Date_vote FROM Vote where Date_vote = ? AND ImageID = ?",[matDateDATA,results1[0].ImageID],(error,results11)=>{
//             if(error){
//                 return res.status(500).json({error : "error "});
//             }else{
//                 if(results11.length == 0){
//                     const sql = "INSERT INTO `Vote` ( 	`ImageID`	,`Date_vote`,	`V_Score` ) VALUES (?,NOW(),?)" ;
//                     conn.query(sql,[ImageID1,Rpa],
//                         (err,result)=>{
//                             if(err){ 
//                                 console.error("Error 2",err);
//                                 res.status(500).json({error : "Error 3"});
//                             }else {
//                                 const sql ="UPDATE `Image` SET `Score`=? WHERE `ImageID` =?";
//                                 conn.query(sql,[Rpa,ImageID1],
//                                     (err)=>{
//                                         if(err){
//                                             console.error("Error innterating user",err);
//                                             res.status(500).json({error : "Error 4"});
//                                         }
//                                     });
//                             }
                            
//                         });
                    
//                 }else{
            
//                     const sql ="UPDATE `Vote` SET `V_Score`=? where  ImageID = ? And Date_vote=?";
//                     conn.query(sql,[Rpa,ImageID1,matDateDATA],
//                                     (err,result)=>{
//                                         if(err){
//                                             console.error("Error 5",err);
//                                             res.status(500).json({error : "Error innterating user"});
//                                         }else {
//                                             const sql ="UPDATE `Image` SET `Score`=? WHERE `ImageID` =?";
//                                             conn.query(sql,[Rpa,ImageID1],
//                                              (err)=>{
//                                                  if(err){
//                                                     console.error("Error innterating user",err);
//                                                     res.status(500).json({error : "Error innterating user"});
//                                         }
//                                     });
//                                  }
//                             });

//                 }
       
               
//                 conn.query("SELECT Date_vote FROM Vote where Date_vote = ? AND ImageID = ?",[matDateDATA,results2[0].ImageID],(error,results12)=>{
//                     if(error){
//                         return res.status(500).json({error : "AN error "});
//                     }else{
//                         if(results12.length == 0){
//                             const sql = "INSERT INTO `Vote` ( 	`ImageID`	,`Date_vote`,	`V_Score` ) VALUES (?,NOW(),?)" ;
//                             conn.query(sql,[ImageID2,Rpb],
//                                 (err,result)=>{
//                                     if(err){
//                                         console.error("Error innterating user",err);
//                                         res.status(500).json({error : "Error innterating user"});
//                                     }else {
//                                         const sql ="UPDATE `Image` SET `Score`=? WHERE `ImageID` =?";
//                                         conn.query(sql,[Rpb,ImageID2],
//                                             (err)=>{
//                                                 if(err){
//                                                     console.error("Error innterating user",err);
//                                                     res.status(500).json({error : "Error innterating user"});
//                                                 }
//                                             });
//                                     }
                                    
//                                 });
                            
//                         }else{
//                             const sql ="UPDATE `Vote` SET `V_Score`=? where  ImageID = ? And Date_vote=?";
//                             conn.query(sql,[Rpb,ImageID2,matDateDATA],
//                                             (err,result)=>{
//                                                 if(err){
//                                                     console.error("Error innterating user",err);
//                                                     res.status(500).json({error : "Error innterating user"});
//                                                 }else {
//                                                     const sql ="UPDATE `Image` SET `Score`=? WHERE `ImageID` =?";
//                                                     conn.query(sql,[Rpb,ImageID2],
//                                                      (err)=>{
//                                                          if(err){
//                                                             console.error("Error innterating user",err);
//                                                             res.status(500).json({error : "Error innterating user"});
//                                                               }
//                                                      });
//                                                  }
//                                  });
        
//                         }

//                     }
//                 });
//             }
//         });
        
     
//     });
// });

// });
router.post("/elo/vote", (req, res) => {
    const ImageID1 = req.body.ImageID1;
    const ImageID2 = req.body.ImageID2;
    const Score1 = req.body.Score1;
    const Score2 = req.body.Score2;

    console.log("ImageID1 :", ImageID1);
    console.log("ImageID2 :", ImageID2);
    console.log("Score1 :", Score1);
    console.log("Score2 :", Score2);

    let Ra: number;
    let Rb: number;

    //select ข้อมูลของรูปภาพ ออกมา
    conn.query("SELECT * FROM Image WHERE ImageID =?", [ImageID1], (error, results1) => {
        if (error) {
            return res.status(500).json({ error: " error Image1" });
        }
        Ra = results1[0].Score; //เก็บคะแนนเดิมที่ดึงออกมา

        conn.query("SELECT * FROM Image WHERE ImageID =?", [ImageID2], (error, results2) => {
            if (error) {
                return res.status(500).json({ error: " error Image2" });
            }
            Rb = results2[0].Score;  //เก็บคะแนนเดิมที่ดึงออกมา

            console.log("Ra :", Ra);
            console.log("Rb :", Rb);

            //คำนวณ ELO 
            const Ea = 1 / (1 + Math.pow(10, (Rb - Ra) / 400));
            const Eb = 1 / (1 + Math.pow(10, (Ra - Rb) / 400));
            console.log("Ea : " + Ea);
            console.log("Eb : " + Eb);

            //เอาค่า Ea,Eb มาลบ ในที้นี้ Score (ที่ส่งมาจากการคลิก)ชนะ =1 , แพ้=0
            const Rpa: number = Ra + 32 * (Score1 - Ea);
            const Rpb: number = Rb + 32 * (Score2 - Eb);
            console.log("Rpa : " + Rpa);
            console.log("Rpb : " + Rpb);

             // Return JSON response with required data
       
            // เช็คว่า รูปนี้เคยมีการโหวตในวันนั้นๆ แล้วหรือยัง
            // ถ้าเคยถูกโหวตไปแล้วจะไม่ทำการเพิ่มฟิวใน table Vote
            // แต่จะเป็นการอัพเดตจะแนนใน table Image เลย
            conn.query("SELECT Date_vote FROM Vote WHERE Date_vote = CURDATE() AND ImageID = ?", [results1[0].ImageID], (error, results11) => {
                if (error) {
                    return res.status(500).json({ error: "error" });
                } else {
                    if (results11.length == 0) {
                        const sql = "INSERT INTO `Vote` (`ImageID`, `Date_vote`, `V_Score`) VALUES (?, NOW(), ?)";
                        conn.query(sql, [ImageID1, Rpa], (err, result) => {
                            if (err) {
                                console.error("Error 2", err);
                                res.status(500).json({ error: "Error 3" });
                            } else {
                                const sql = "UPDATE `Image` SET `Score` = ? WHERE `ImageID` = ?";
                                conn.query(sql, [Rpa, ImageID1], (err) => {
                                    if (err) {
                                        console.error("Error in updating user", err);
                                        res.status(500).json({ error: "Error 4" });
                                    }
                                });
                            }
                        });
                    } else {
                        const sql = "UPDATE `Vote` SET `V_Score` = ? WHERE `ImageID` = ? AND `Date_vote` = CURDATE()";
                        conn.query(sql, [Rpa, ImageID1], (err, result) => {
                            if (err) {
                                console.error("Error 5", err);
                                res.status(500).json({ error: "Error in updating user" });
                            } else {
                                const sql = "UPDATE `Image` SET `Score` = ? WHERE `ImageID` = ?";
                                conn.query(sql, [Rpa, ImageID1], (err) => {
                                    if (err) {
                                        console.error("Error in updating user", err);
                                        res.status(500).json({ error: "Error in updating user" });
                                    }
                                });
                            }
                        });
                    }

                    conn.query("SELECT Date_vote FROM Vote WHERE Date_vote = CURDATE() AND ImageID = ?", [results2[0].ImageID], (error, results12) => {
                        if (error) {
                            return res.status(500).json({ error: "AN error" });
                        } else {
                            if (results12.length == 0) {
                                const sql = "INSERT INTO `Vote` (`ImageID`, `Date_vote`, `V_Score`) VALUES (?, NOW(), ?)";
                                conn.query(sql, [ImageID2, Rpb], (err, result) => {
                                    if (err) {
                                        console.error("Error in updating user", err);
                                        res.status(500).json({ error: "Error in updating user" });
                                    } else {
                                        const sql = "UPDATE `Image` SET `Score` = ? WHERE `ImageID` = ?";
                                        conn.query(sql, [Rpb, ImageID2], (err) => {
                                            if (err) {
                                                console.error("Error in updating user", err);
                                                res.status(500).json({ error: "Error in updating user" });
                                            }
                                        });
                                    }
                                });
                            } else {
                                const sql = "UPDATE `Vote` SET `V_Score` = ? WHERE `ImageID` = ? AND `Date_vote` = CURDATE()";
                                conn.query(sql, [Rpb, ImageID2], (err, result) => {
                                    if (err) {
                                        console.error("Error in updating user", err);
                                        res.status(500).json({ error: "Error in updating user" });
                                    } else {
                                        const sql = "UPDATE `Image` SET `Score` = ? WHERE `ImageID` = ?";
                                        conn.query(sql, [Rpb, ImageID2], (err) => {
                                            if (err) {
                                                console.error("Error in updating user", err);
                                                res.status(500).json({ error: "Error in updating user" });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            });

            return res.json({
                ImageID1: ImageID1,
                OleScore1: Ra,
                OleScore2: Rb,
                ImageID2: ImageID2,
                Score1: Score1,
                Score2: Score2,
                Ea:Ea.toFixed(13),
                Eb: Eb.toFixed(13),
                Rpa: Rpa.toFixed(13),
                Rpb: Rpb.toFixed(13)
            });
        });
        
    });
    
});

