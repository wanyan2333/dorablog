import { getUserWithusername } from "../data/users-dao.js";
import { getusernameFromJWT } from "../utils/jwt-utils.js";

/**
 * A middleware which will get the auth JWT from req.cookies.authToken, verify it, find the matching user, and add it to req.user.
 *
 * If any of those processes fail, a 401 status will be returned. Otherwise, the next() function will be called to continue executing
 * your route handlers.
 * 
 * This function is copied from the course repository.
 * @author: Andrew Meads
 */
export function requiresAuthentication(req, res, next) {
  if (!req.cookies.authToken) return res.sendStatus(401);

  try {
    const username = getusernameFromJWT(req.cookies.authToken);
    getUserWithusername(username).then((user) => {
      if (!user) return res.sendStatus(401);
      req.user = user;
      return next();
    });
  } catch {
    return res.sendStatus(401);
  }
}

/**
 * A middleware which will get the auth JWT from req.cookies.authToken, verify it, find the matching user, and add it to req.user.
 * Additionally, it will check that the user is an admin.
 *
 * If any of those processes fail, a 401 status will be returned. Otherwise, the next() function will be called to continue executing
 * your route handlers.
 */
export function requiresAdmin(req, res, next) {
  if (!req.cookies.authToken) return res.sendStatus(401);

  try {
    const username = getusernameFromJWT(req.cookies.authToken);
    getUserWithusername(username).then((user) => {
      if (!user || !user.admin) return res.sendStatus(401);
      req.user = user;
      return next();
    });
  } catch {
    return res.sendStatus(401);
  }
}
