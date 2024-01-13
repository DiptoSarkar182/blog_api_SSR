const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/images");
    },
  });

  const fileFilter =  (req, file, cb ) =>{
    if(file.mimetype === "image/jpeg" || file.mimetype === 'image/png'){
        cb(null, true)
    } else {
        //reject file 
        cb({message: "Unsupported file format"}, false)
    }
}

  // Create multer upload instance and add file size limit.
  const upload = multer({
    storage:storage, 
    limits:{fileSize: 1024 * 1024}, 
    fileFilter:fileFilter
})

module.exports = upload;