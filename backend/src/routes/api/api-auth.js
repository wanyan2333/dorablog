/**
 * API route to handle user authentication (login/logout).
 * This file is copied from the course repository.
 * 
 * @author: Andrew Meads
 */

import express from "express";
import { createUserJWT } from "../../utils/jwt-utils.js";
import { getUserWithCredentials } from "../../data/users-dao.js";

const router = express.Router();

/**
 * Sending a POST request to /api/auth with a valid username and password will authenticate a user (log that user in) and
 * return the JWT auth token set as the "authToken" HTTP-only cookie. In addition, the user's username will be sent back
 * as JSON, in the response. This can be used to display the user's username on the frontend if required.
 *
 * If the user is already logged in, this will remove any old login details and replace the cookie with the new one.
 *
 * Sending invalid credentials will result in a 401. No difference between invalid username and invalid password.
 */
router.post("/", (req, res) => {
  // Get user with provided login details; return 401 if not found
  const { username, password } = req.body;
  console.log(username, password);
  getUserWithCredentials(username, password).then((user) => {
    if (!user) return res.sendStatus(401);

    // Create user JWT token and send it back as a HTTP-only cookie along with a 204 status.
    const jwtToken = createUserJWT(user.username);

    // Expires 24 hours from now
    const expires = new Date(Date.now() + 86400000);

    // Send the JWT token in an HTTP-only cookie named authToken which expires in 24 hours.
    return res.cookie("authToken", jwtToken, { httpOnly: true, expires }).json({ username });
  });
});

/**
 * Sending a DELETE request to /api/auth will invalidate the authToken cookie, essentially causing that user to be logged out.
 *
 * Since there's no harm in invalidating a cookie which doesn't exist, we don't need to check if the user is actually logged in
 * or not first.
 */
router.delete("/", (req, res) => {
  const expires = new Date(0); // Setting the expiry time of the cookie to some time in the past will cause it to be deleted.
  return res.cookie("authToken", "", { httpOnly: true, expires }).sendStatus(204);
});

export default router;