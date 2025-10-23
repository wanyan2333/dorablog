
import yup from "yup";
import { getDatabase } from "./database.js";

/**
 * Gets all users in the database.
 * 
 * @returns array of user objects
 */
export async function getAllUsers() {
  const db = await getDatabase();
  const users = await db.all("SELECT * FROM Users");
  return users;
}

/**
 * Gets the user with the given username, if it exists.
 * 
 * @param {number} userId the user id
 * @returns usrer object if found, null otherwise
 */
export async function getUserWithUserId(userId) {
  const db = await getDatabase();
  const user = await db.get("SELECT * FROM Users WHERE id = ?", userId);
  return user;
}

/**
 * Gets the user with the given username, if it exists.
 * @param {string} username the user name
 * @returns user object if found, null otherwise
 */
export async function getUserWithusername(username) {
  const db = await getDatabase();
  const user = await db.get("SELECT * FROM Users WHERE username = ?", username);
  return user;
}

/**
 * Gets the user with the given username and password, if it exists.
 *
 * @param {string} username the username to search
 * @param {string} password the password to search
 * @returns the user with the given credentials, or undefined.
 */
export async function getUserWithCredentials(username, password) {
  const db = await getDatabase();
  const user = await db.get("SELECT * FROM Users WHERE username = ? AND password = ?", username, password);
  return user;
}

/**
 * Schema for "update user". We can optionally supply a username, password, realname, admin, 
 * description, and / or avatarUrl. We cannot edit the id,
 * or supply any other random data.
 */
const updateUserSchema = yup
  .object({
    username: yup.string().min(1).optional(),
    password: yup.string().min(5).optional(),
    realname: yup.string().min(1).optional(),
    admin: yup.boolean().optional(),
    description: yup.string().optional(),
    avatarUrl: yup.string().url().optional()
  })
  .required();

/**
 * Updates the user with the given id if it exists, with the given update data. Update data can optionally include a firstName, lastName,
 * password, and / or blurb.
 *
 * Throws an exception if the user with the given id is not found, or the update data is invalid.
 *
 * @param {*} id the user id to update
 * @param {*} udpateData the update data to apply.
 */
export function updateUser(id, udpateData) {
  getUserWithUserId(id).then((users) => {
    if (!users || users.length === 0) {
      throw new Error(`User with id ${id} not found`);
    }
    const user = users[0];

    // Validate incoming data (throw error if invalid)
    const parsedUpdateData = updateUserSchema.validateSync(udpateData, {
      abortEarly: false,
      stripUnknown: true
    });
    // Do the update
    Object.assign(user, parsedUpdateData);
  });
}

export async function createUser(userData) {
  // Implementation for creating a new user
  const db = await getDatabase();
  const {username, password, realname, admin, description, avatarUrl} = userData;
  const user = await db.run(
    "INSERT INTO Users (username, password, realname, admin, description, avatarUrl) VALUES (?, ?, ?, ?, ?, ?)", 
    username, password, realname, admin, description, avatarUrl);
  return user;
}