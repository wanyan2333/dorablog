# Final project - A personal blogging system - Team Blue Cat Four

This repository contains a starting point for your team's final project. We look forward to seeing your progress and your final results this semester!

Your team should update this README to include the information required, as presented in the project handout available on Canvas.

Your team members are:

- Leo Mo-yung _(xmu745@aucklanduni.ac.nz)_
- Yushun Shi _(yshi675@aucklanduni.ac.nz)_
- Xuan Zeng _(xzen317@aucklanduni.ac.nz)_
- Zhongwei Zhang _(zahz885@aucklanduni.ac.nz)_

## Development Environment Setup & Commit Guidelines

It is important each team member has the right development environment setup on their computer.
Please update this with any other processes your group is following.

Extensions to install:

- [VSCode Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [VSCode Svelete](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- _Add other optional extensions here :)_

Commands to run before commits:

- In Backend `npm run format` to double check code is formatted
- In Frontend `npm run format` to double check code is formatted

All commits MUST have a brief descriptive message

Useful usernames / passwords: Leo 123456 (admin); Xuan 123456.

## API documentation

see the APIsDoc.md in backend folder

## Description of all pages

Homepage:
This is the main landing page of the blog system, featuring a navigation bar at the top for accessing different sections of the site including Home, Articles, New Post (for logged-in users), Profile (for logged-in users), Login, and Register. The main content area displays the four most popular articles based on like count, each presented as a card showing the header image, title, author, and like count. Users can like articles directly from the homepage, and if they are not logged in, a toast notification will appear prompting them to log in to like articles. Below the articles section, there is a daily  quote module that fetches random quotes from external APIs, with a refresh button to get new quotes. The page features a responsive design that adapts to different screen sizes and supports both light and dark themes. When users click on any article card, they are navigated to the detailed article page. A footer component is included at the bottom of the page providing additional information.

Newpost:
This page is used to create and publish new articles. It includes a rich text editor that supports formatting options such as bold, italic, and underline. You can add up to one header image and insert up to nine images within the content. Each article must include a title and an appropriate tag (Technology, Entertainment, Health, Travel, Lifestyle, or News). It’s very easy to use: enter your title, select a tag, write your content, add images if needed, and then click “Publish Article”. After publishing, you will be automatically redirected to the article’s view page. If the user is not logged in, this page will automatically redirect to the login page.

Blogdetail:
This page displays the full content of an article, including the title, text, images, tags, author information, and publication date. The page provides a like button that shows the current number of likes, and the sidebar displays recommended related articles, which can be clicked to navigate to their content pages. Below the article, there is a comments section with an option to hide all comments with one click. Users can view existing comments and post new ones, but liking or commenting requires being logged in. If you are the author or an administrator, you will also see edit and delete options below the article, allowing you to click “Edit Article” to modify the content or “Delete Article” to remove it.

Articles:
This is the main article browsing page, where all blog posts are displayed as cards. Each card shows the cover image, article title, author, number of likes, and number of comments. The page provides a search function, tag filters, and sorting options (by date, title, or author). Logged-in users can also view the posts they have liked via the “My Likes” button. Users can enter keywords in the search box to search, select tags to filter, and choose a sorting method to find the desired article. Click any card to enter the article’s detail page.

Login:
This is a clean and simple authentication page for existing users to access their accounts. The page features a centered login card with a beautiful blurred background. Users need to enter their username and password to log in. The page includes a "Home" button in the top-left corner that allows users to return to the homepage without logging in. If the login credentials are correct, a success message "Login successful, redirecting..." will appear, and users will be automatically redirected to the homepage within 1 second. If the credentials are incorrect, an error message such as "Invalid credentials" will be displayed (not using alert popups, but styled inline messages). The system uses JWT token authentication with httpOnly cookies for security, and users will remain logged in for 7 days. At the bottom of the page, there's a link "Don't have an account yet? Register now" that directs users to the registration page.

Register:
This page allows new users to create an account on DoraBlog. The registration form includes several fields: The username field (required, minimum 3 characters) has real-time availability checking - as you type, it shows whether the username is available with a green checkmark or already taken with a red error message. The password field (required, minimum 6 characters) features a password strength indicator that displays a color-coded bar (red for weak, yellow for medium, green for strong) and provides real-time feedback. Users must enter the password twice in "Choose password" and "Confirm password" fields, and the page will show "Passwords do not match" or "✓ Passwords match" accordingly - the register button is disabled until passwords match. The avatar selection section is optional and allows users to choose from 8 predefined avatars (including team member avatars and Doraemon-themed options) or upload their own custom avatar with instant preview. Additional optional fields include real name, birthdate (with format YYYY-MM-DD), and an "About me" text area for a brief self-description. All validation happens in real-time with inline messages (not alert popups) using color-coded borders and feedback. The "Register" button is only enabled when all required fields are valid. Upon successful registration, users see the message "Registration successful! Redirecting to login..." and are automatically redirected to the login page where they can immediately log in with their new credentials. At the bottom, there's a link "Already have an account? Log in" for existing users. The page uses bcrypt for secure password hashing and includes protection against common security vulnerabilities.

Profile:
This is the user profile management page, accessible only to logged-in users. Unauthenticated users will be automatically redirected to the login page. The page displays "My Profile" at the top with an "Edit Profile" button. In view mode, the page shows the user's circular avatar, username, real name, birthdate, and personal description (About Me). Clicking the "Edit Profile" button enters edit mode, where all fields become editable. Users can change their avatar (choosing from predefined avatars or uploading a custom one), modify their username (the system will check username availability in real-time, showing error messages if the username is already taken), update their real name, birthdate, and personal description. Users can also choose to change their password, requiring them to enter and confirm the new password. After editing, click "Save Changes" to save modifications or "Cancel" to discard changes. At the bottom of the page, there's a red "Danger Zone" section with a "Delete Account" button for permanently deleting the account. Before deletion, users must type "DELETE" as a confirmation. The system warns that this action is irreversible and will permanently delete all articles and comments associated with the user.

## Description of how to use Java Swing admin interface

Press the login button to login with a admin account(Leo 123456). After login, the users info will be shown in table. Select a user, its info will be displayed in right panel and press the delete button to delete it. Then, the table will refresh. You can also press the logout button to logout.

# Additional dependency

tinymce-svelte(for article editting), bcrypt(for password hashing and salting), jsonwebtoken(for json web token), multer(for article images and avatar upload), quotable.io and adviceslip.com APIs(for daily inspirational quotes).

## Git

> [!IMPORTANT]
> It is always easier to merge files that are either new files, or files that no one else has changed. Create new modules / components to reduce the chance of Git Conflicts! However expect conflicts to occur as part of normal development.

> [!TIP]
> The below assumes you have experience with GIT Pull requests, if not please address this.

All groups MUST use Pull Requests (PR) with at least 1 peer review for merging code into main, this is to improve code quality and to give team members an opportunity to understand your code in case they need to use it.

If team-members don't need to use PR, then they should be working on feature branches and get latest commits in main by merging main into their feature branch (`git merge main`, or `git rebase main`).

> [!TIP]
> Consider a branch naming convention `feature/<some-meaningful-feature-name>`

Correct and **timely** execution of the PR process with evidence of good code review can contribute **significantly** to a better codebase and team member collaboration.

![](./Blue%20Cat%20Four.jpg)
