const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const products = require("./data/products");

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB connected successfully!");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        console.log("🔄 Deleting existing data...");
        await Product.deleteMany();
        console.log("✅ Deleted all products!");

        await User.deleteMany();
        console.log("✅ Deleted all users!");

        console.log("🔄 Creating admin user...");
        const createdUser = await User.create({
            name: "Admin User",
            email: "admin@example.com",
            password: "123456",
            role: "admin"
        });

        console.log("✅ Admin user created:", createdUser);

        const userID = createdUser._id;

        console.log("🔄 Preparing product data...");
        const sampleProducts = products.map((product) => ({
            ...product,
            user: userID
        }));

        console.log("🔄 Inserting new products...");
        await Product.insertMany(sampleProducts);
        console.log("✅ Product data seeded successfully!");

        process.exit();
    } catch (error) {
        console.error("❌ Error seeding the data:", error);
        process.exit(1);
    }
};

const startSeeding = async () => {
    await connectDB();
    await seedData();
};

startSeeding();
