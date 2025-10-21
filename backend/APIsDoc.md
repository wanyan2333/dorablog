# Markdown syntax guide

## APIs

/api/login(post)  userName, password, 
/api/logout(post)
/api/register(post)  userName, password, realName, birthDate, description, avatar
/api/registered(get)是否已注册  userName
/api/users(get) 需要管理员权限
/api/users/:id(delete)
/api/userInfo(get) 

/api/article(post)
/api/article/:id(get)
/api/article(get)
/api/article/user/:id(get)

/api/comments(get)??
/api/comments/:id(get)
/api/comments/:id(post)
/api/comments/:id(put)
/api/comments/:id(delete)



| Parameters  | Type | Optional/Must | Meaning |
| ------------- |:-------------:|:-------------:|:-------------:|
| left foo      | right foo     | right foo     | right foo     |
| left bar      | right bar     | right foo     | right foo     |
| left baz      | right baz     | right foo     | right foo     |


## ER diagram

UserInfo: <ins>id</ins>, userName, password, realName, admin, description, * _avatarId_ 

Articles: <ins>id</ins>, title, date, content, *_userId_, *_headerId_

Comments: <ins>id</ins>, date, content, *_userId_, *_ariticleId_, *_<ins>parentCommentId</ins>_

Images: <ins>id</ins>, url

ArticleImg: <ins>ariticleId</ins>, <ins>imgId</ins>

ArticleLike: *_<ins>ariticleId</ins>_, *_<ins>userId</ins>_
