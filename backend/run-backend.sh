brew services start postgresql@18
export DATABASE_URL="postgresql://samundrapoudel@localhost:5432/municipalgate"
export JWT_SECRET="municipalgate-secret"
export PORT=5001
npx nodemon src/server.js