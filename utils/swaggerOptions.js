import swaggerJsdoc from "swagger-jsdoc";
import { configDotenv } from "dotenv";

configDotenv();

const swaggerDefinition = {
  openapi: "3.0.0", 
  info: {
    title: "Chat", 
    version: "1.0.0", 
    description: "API Docomotion", 
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "cookie",
        name: "access_token",
      },
    },
  },
  servers: [
    {
      url: process.env.URL || "http://localhost:3000", 
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
