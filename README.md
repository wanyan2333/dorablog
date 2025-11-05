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

Newpost:
This page is used to create and publish new articles. It includes a rich text editor that supports formatting options such as bold, italic, and underline. You can add up to one header image and insert up to nine images within the content. Each article must include a title and an appropriate tag (Technology, Entertainment, Health, Travel, Lifestyle, or News). It’s very easy to use: enter your title, select a tag, write your content, add images if needed, and then click “Publish Article”. After publishing, you will be automatically redirected to the article’s view page. If the user is not logged in, this page will automatically redirect to the login page.

Blogdetail:
This page displays the full content of an article, including the title, text, images, tags, author information, and publication date. The page provides a like button that shows the current number of likes, and the sidebar displays recommended related articles, which can be clicked to navigate to their content pages. Below the article, there is a comments section with an option to hide all comments with one click. Users can view existing comments and post new ones, but liking or commenting requires being logged in. If you are the author or an administrator, you will also see edit and delete options below the article, allowing you to click “Edit Article” to modify the content or “Delete Article” to remove it.

Articles:
This is the main article browsing page, where all blog posts are displayed as cards. Each card shows the cover image, article title, author, number of likes, and number of comments. The page provides a search function, tag filters, and sorting options (by date, title, or author). Logged-in users can also view the posts they have liked via the “My Likes” button. Users can enter keywords in the search box to search, select tags to filter, and choose a sorting method to find the desired article. Click any card to enter the article’s detail page.

Login:

Profile:

Register:

## Description of how to use Java Swing admin interface

Press the login button to login with a admin account(Leo 123456). After login, the users info will be shown in table. Select a user, its info will be displayed in right panel and press the delete button to delete it. Then, the table will refresh. You can also press the logout button to logout.

# Additional dependency

tinymce-svelte(for article editting), bcrypt(for passsword hashing and salting), jsonwebtoken(for json web token)

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

![](./Blue%20Cat%20Four.png)
