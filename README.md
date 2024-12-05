# Description of the project

this is a chat back end project that uses websockets and REST APIs to communicate between clients and the server and prisma with a postgres database to store the messages and users.

# technologies used in this project:

- express
- jsonwebtoken
- prisma
- postgres
- socket.io
- swagger
- javascript
- docker

# usage

to run the project you need to have nodejs and npm installed on your machine and you will need for a postgres database to be running.

you can create a postgres database using docker by running the following command:

```bash
docker run --name some-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_USER=user -e POSTGRES_DB=mydb -p 5432:5432 -d postgres
```

then you need to create a .env file in the root of the project and add the following variables:

```env
PORT="" # port for the server
URL="" # url for th swagger documentation
SECRETKEY="" # secret key for jwt use openssl rand -hex 32
DATABASE_URL="postgresql://user:password@localhost/mydb?schema=public" # database url
```

then run the following commands:

```bash
npm install --include=dev # to install the dependencies

npx prisma migrate # to create the database schema

npm run dev # to run the project
```
