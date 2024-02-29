var express = require('express');
var router = express.Router();
const upload = require('../helpers/multer')

const postController = require('../controllers/postController');
const userController = require('../controllers/userController');



router.get("/", postController.post_list);

router.get("/sign-up", userController.sign_up_get);
router.post("/sign-up", userController.sign_up_post);

router.get("/logout", userController.logout);
router.get("/login", userController.log_in_get);
router.post("/login", userController.log_in_post);
router.get("/demo-user", userController.demo_user_get);

router.get("/create-blog", postController.new_blog_get);
router.post("/create-blog", upload.array('image',1), postController.new_blog_post);

router.get("/my-account", postController.my_account_get);
router.get("/my-account/:id/delete", postController.my_account_delete_get);
router.get("/:id/post-detail", postController.post_detail_get);
router.get("/:id/like-blog", postController.post_like);
router.get("/:id/dislike-blog", postController.post_dislike);

router.get("/my-account/:id/post-privacy", postController.post_privacy);

router.post("/:id/post-detail", postController.add_post_comment);
router.get("/delete-comment/:id", postController.delete_post_comment);

router.get("/my-account/:id/edit-post", postController.edit_post_get);
router.post("/my-account/:id/edit-post", upload.array('image',1), postController.edit_post_post);


module.exports = router;
