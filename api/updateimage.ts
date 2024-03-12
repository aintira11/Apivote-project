import express from "express";
import path from "path";
import multer from "multer";
import { conn } from "../dbconnect";

// Create Express router
export const router = express.Router();

class FileMiddleware {
    filename = "";
    public readonly diskLoader = multer({
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, path.join(__dirname, "../uploads"));
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 10000);
          this.filename = uniqueSuffix + "." + file.originalname.split(".").pop();
          cb(null, this.filename);
        },
      }),
      limits: {
        fileSize: 67108864, // 64 MByte
      },
    });
  }


// Initialize FileMiddleware instance
const fileUpload = new FileMiddleware();

// Handle PUT request to edit image
router.put("/edit/:ImageID", fileUpload.diskLoader.single("Photo"), (req, res) => {
    const id = +req.params.ImageID;
    const { Name_photo} = req.body;
    const Photo ="/uploads/"+fileUpload.filename; // Uploaded image file

    // Update image data in the database
    const sqlUpdate = "UPDATE Image SET Name_photo=?, Photo=?, Date_upload=NOW()  WHERE ImageID=?";
    conn.query(sqlUpdate, [Name_photo, Photo, id], (err, result) => {
        if (err) {
            console.error('Error updating image:', err);
            res.status(500).json({ error: 'Error updating image' });
            return;
        }
        
        res.status(200).json({ affected_rows: result.affectedRows });
    });
});