import express from "express";
import { updateUser, getAllUsers, createUser } from "../../data/users-dao.js";
import { requiresAdmin, requiresAuthentication } from "../../middleware/auth-middleware.js";

const router = express.Router();
/**
 * Sending a GET request to /api/users/ will return an array of all users in the system.
 * 
 * This route is protected by the requiresAdmin middleware, so only admin users can access it.
 */
router.get("/", requiresAdmin, (req, res) => {
  getAllUsers().then((users) => {
    return res.status(200).json(users);
  });
});

/**
 * Sending a GET request to /api/users/me will return the user info for the currently authenticated user,
 * or return a 401 if there's an authentication error.
 *
 * The authentication functionality is handled by the requiresAuthentication middleware, which adds the user
 * info to req.user. So we just need to return that.
 * 
 * This function is copied from the course repository.
 * @author: Andrew Meads
 */
router.get("/me", requiresAuthentication, (req, res) => {
  return res.json(req.user);
});

/**
 * Sending a PATCH request to /api/users/me will allow requesters to update the currently authenticated user's
 * firstName, lastName, password, and blurb.
 *
 * If there is no currently authenticated user, a 401 response is returned (handled by requiresAuthentication middleware).
 *
 * If the "update user" info in req.body is invalid, a 422 response is returned.
 *
 * Otherwise, the user info is updated and a 204 response is returned.
 * This function is copied from the course repository.
 * @author: Andrew Meads 
 */
router.patch("/me", requiresAuthentication, (req, res) => {
  try {
    updateUser(req.user.id, req.body).then(() => {
      return res.sendStatus(204);
    });
  } catch {
    return res.sendStatus(422);
  }
});

/**
 * Sending a POST request to /api/users/ will create a new user with the given info in req.body.
 * If successful, a 200 response is returned with the created user info.
 * If there's an error, a 500 response is returned.
 */
router.post("/Info", (req, res) => {
    try {
        const userInfo = req.body;
        createUser(userInfo).then((newUser) => {
          return res.status(200).json(newUser);
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;