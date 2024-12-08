# Step 1: Use the official Node.js image as the base image
FROM node:18 AS build

# Step 2: Set the working directory
WORKDIR /frontend

# Step 3: Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the React app
COPY . .

# Step 6: Build the React app
RUN npm run build

# Step 7: Use an Nginx image to serve the app
FROM nginx:alpine

# Step 8: Copy the build files to the Nginx container
COPY --from=build /frontend/build /usr/share/nginx/html

# Copy the custom Nginx config file
COPY nginx.conf /etc/nginx/nginx.conf

# Step 9: Expose port 80 (default for Nginx)
EXPOSE 80

# Step 10: Start Nginx to serve the app
CMD ["nginx", "-g", "daemon off;"]
