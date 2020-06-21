const express = require('express')
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')
const postController = require('../controllers/postController')

const router = express.Router()

/* Error handler for async / await functions */
const catchErrors = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch(next)
  }
}

/**
 * AUTH ROUTES: /api/auth
 */
router.post('/api/auth/signup', authController.validateSignup, catchErrors(authController.signup))
router.post('/api/auth/signin', authController.signin)
router.get('/api/auth/signout', authController.signout)

/**
 * USER ROUTES: /api/users
 *
 */

// userId가 파라미터로 들어간 모든 경로에 대해 getUserById를 먼저 실행
// req.profile 에 파라미터로 넘겨준 userId에 해당하는 user정보를 저장하고
// req.user와 userId의 user가 일치하는지를 req.isAuthUser에 저장
router.param('userId', userController.getUserById)

router.put(
  '/api/users/follow',
  authController.checkAuth,
  catchErrors(userController.addFollowing),
  catchErrors(userController.addFollower)
)
router.put(
  '/api/users/unfollow',
  authController.checkAuth,
  catchErrors(userController.deleteFollowing),
  catchErrors(userController.deleteFollower)
)

router
  .route('/api/users/:userId')
  .get(userController.getAuthUser)
  .put(
    authController.checkAuth,
    userController.uploadAvatar,
    catchErrors(userController.resizeAvatar),
    catchErrors(userController.updateUser)
  )
  .delete(authController.checkAuth, catchErrors(userController.deleteUser))

router.get('/api/users', userController.getUsers)
router.get('/api/users/profile/:userId', userController.getUserProfile)
router.get('/api/users/feed/:userId', authController.checkAuth, catchErrors(userController.getUserFeed))

/**
 * POST ROUTES: /api/posts
 */
router.param('postId', postController.getPostById)

router.put('/api/posts/like', authController.checkAuth, catchErrors(postController.toggleLike))
router.put('/api/posts/unlike', authController.checkAuth, catchErrors(postController.toggleLike))

router.put('/api/posts/comment', authController.checkAuth, catchErrors(postController.toggleComment))
router.put('/api/posts/uncomment', authController.checkAuth, catchErrors(postController.toggleComment))

router.delete('/api/posts/:postId', authController.checkAuth, catchErrors(postController.deletePost))

router.post(
  '/api/posts/new/:userId',
  authController.checkAuth,
  postController.uploadImage,
  catchErrors(postController.resizeImage),
  catchErrors(postController.addPost)
)
router.get('/api/posts/by/:userId', catchErrors(postController.getPostsByUser))
router.get('/api/posts/feed/:userId', catchErrors(postController.getPostFeed))

module.exports = router
