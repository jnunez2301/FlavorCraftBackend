# FlavorCraftBackend
Api documentation for [FlavorCraft](https://github.com/jnunez2301/FlavorCraft)
## About Deno 1.45.3(19/10/2024)

This app was made with `Deno 1.45.3` which for some reason has no compatibility with further versions due to mongodb child dependencies not working as intended in some use cases. If you cannot boot this app on your local machine please make sure to downgrade to **1.45** using `deno upgrade --version 1.45.3`.


## Enviroment

Before you start you need to create an `.env` file with this requirements.

```javascript

SERVER_PORT="3000"
FRONTEND_URL="http://localhost:5173"
MONGODB_URI="mongodb://localhost:27017"
JWT_SECRET="JWT_SECRET"
// AWS Config is totally optional if not provided it will store the base64 img
ENCRYPT_SECRET="ENCRYPT_SECRET"
AWS_ACCESS_KEY="AWS_ACCESS_KEY"
AWS_SECRET_KEY="AWS_SECRET_KEY"
AWS_REGION="AWS_REGION"
AWS_BUCKET="AWS_BUCKET"
AWS_CLOUDFRONT_URL="AWS_CLOUDFRONT_URL"
AWS_CLOUDFRONT_DISTRIBUTION_ID="AWS_CLOUDFRONT_DISTRIBUTION_ID"
ENVIRONMENT="DEVLOPMENT"
```

# How to run

This project was built with [Deno](https://deno.com/) which means you will have to install it once thats done just run

```bash
deno task dev # watch mode
deno task start # normal mode
```
## Authentication Endpoints

### 1. Login

- **Endpoint**: `POST /api/auth/login`
- **URL**: `http://localhost:3000/api/auth/login`

**Headers:**

- `Content-Type: application/json`

**Request Body:**

```json
{
  "nickname": "user",
  "password": "user123"
}
```

### 2. Register

- **Endpoint**: `POST /api/auth/register`
- **URL**: `http://localhost:3000/api/auth/register`

**Headers:**

- `Content-Type: application/json`

**Request Body:**

```json
{
  "username": "user",
  "email": "user@mail.com",
  "password": "user123"
}
```

### 3. Get Profile

- **Endpoint**: `GET /api/auth/profile`
- **URL**: `http://localhost:3000/api/auth/profile`

## Recipe Endpoints

### 1. Get Recipe by ID

- **Endpoint**: `GET /api/recipes/{recipeId}`
- **Example URL**: `http://localhost:3000/api/recipes/66b915f81c9bb156bca1f53e`

### 2. Create a New Recipe

- **Endpoint**: `POST /api/recipes`
- **URL**: `http://localhost:3000/api/recipes`

**Headers:**

- `Content-Type: application/json`

**Request Body:**

```json
{
  "userId": "66b915f81c9bb156bca1f53e",
  "title": "Spaghetti Carbonara",
  "description": "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.",
  "category": "Pasta",
  "typeOfCousine": "Italian",
  "caloriesPerServing": 400,
  "servings": 4,
  "prepTime": 900,
  "ingredients": [
    "200g spaghetti",
    "100g pancetta",
    "2 large eggs",
    "50g pecorino cheese",
    "50g parmesan",
    "Freshly ground black pepper",
    "Salt"
  ],
  "sauceInstructions": [
    "Beat the eggs in a bowl, then add grated cheeses and mix well."
  ],
  "instructions": [
    "Cook the pasta in a large pot of boiling salted water until al dente.",
    "Fry the pancetta in a hot pan until crispy.",
    "Add the cooked pasta to the pan with pancetta.",
    "Remove the pan from the heat and quickly stir in the egg and cheese mixture.",
    "Toss well, adding a little reserved pasta water if necessary to loosen the sauce.",
    "Serve immediately with extra cheese and pepper."
  ],
  "sideDishesReeccomendations": [
    "Garlic Bread",
    "Caesar Salad"
  ],
  "backgroundImg": "https://example.com/images/spaghetti-carbonara.jpg"
}
```

### 3. Update a Recipe

- **Endpoint**: `PUT /api/recipes/{recipeId}/user/{userId}`
- **Example URL**: `http://localhost:3000/api/recipes/66bd1301228ffc4edfa00ada/user/66b915f81c9bb156bca1f53e`

**Headers:**

- `Content-Type: application/json`

**Request Body:**

```json
{
  "description": "A new description from POSTMAN"
}
```

### 4. Delete a Recipe

- **Endpoint**: `DELETE /api/recipes/{recipeId}/user/{userId}`
- **Example URL**: `http://localhost:3000/api/recipes/66bd125a228ffc4edfa00ac8/user/66b915f81c9bb156bca1f53e`

### 5. Get Recipe by User ID

- **Endpoint**: `GET /api/recipes/{recipeId}/user/{userId}`
- **Example URL**: `http://localhost:3000/api/recipes/66bd125a228ffc4edfa00acb/user/66b915f81c9bb156bca1f53e`

### 6. Get Recipe PDF

- **Endpoint**: `GET /api/recipes/{recipeId}/user/{userId}/pdf`
- **Example URL**: `http://localhost:3000/api/recipes/66bd125a228ffc4edfa00acb/user/66b915f81c9bb156bca1f53e/pdf`

---
