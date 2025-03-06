# xhipment-assignment

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/Nil2000/xhipment-assignment.git
   cd xhipment-backend-assignment
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Copy the contents of `.env.example` into `.env`:
     ```sh
     cp .env.example .env
     ```
   - Update the values in the `.env` file as needed.

## Running the Project

1. Seed the database:

   ```sh
   npm run db:seed
   ```

2. Start the worker:

   ```sh
   npm run start:worker
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

4. To start the application in production mode:

   ```sh
   npm start
   ```

## API Details

### 1. Register User

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully"
  }
  ```

### 2. Login User

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User logged in successfully",
    "userId": "60d0fe4f5311236168a109ca",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  }
  ```

### 3. Refresh Token

- **URL:** `/api/auth/refresh`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  }
  ```
- **Response:**
  ```json
  {
    "message": "Token refreshed successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 4. Create Order

- **URL:** `/api/orders`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "userId": "60d0fe4f5311236168a109ca",
    "items": [
      {
        "id": "item123",
        "quantity": 2
      }
    ],
    "totalAmount": 100
  }
  ```
- **Response:**
  ```json
  {
    "message": "Order created successfully",
    "orderId": "60d0fe4f5311236168a109cb"
  }
  ```

### 5. Get Order Details

- **URL:** `/api/orders/:id`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "order": {
      "id": "60d0fe4f5311236168a109cb",
      "userId": "60d0fe4f5311236168a109ca",
      "items": [
        {
          "itemId": "item123",
          "quantity": 2
        }
      ],
      "totalAmount": 100,
      "status": "PENDING"
    }
  }
  ```
