const express = require("express")
const Product = require("../models/Product")
const { protect, admin } = require("../middleware/authMiddleware")

const router = express.Router();

// Create Product route
router.post("/", protect, admin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            display,
            condition,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
        } = req.body;
        const product = new Product({
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            display,
            condition,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
            user: req.user._id,
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Update product Id
// access Private/admin
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            display,
            condition,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
        } = req.body;

        const product = await Product.findById(req.params.id);
        //find product by id
        if (product) {
            //update product field
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.discountPrice = discountPrice || product.discountPrice;
            product.countInStock = countInStock || product.countInStock;
            product.category = category || product.category;
            product.brand = brand || product.brand;
            product.sizes = sizes || product.sizes;
            product.colors = colors || product.colors;
            product.display = display || product.display;
            product.condition = condition || product.condition;
            product.images = images || product.images;
            product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
            product.isPublished = isPublished !== undefined ? isPublished : product.isPublished;
            product.tags = tags || product.tags;
            product.dimensions = dimensions || product.dimensions;
            product.weight = weight || product.weight;
            product.sku = sku || product.sku;

            //Save updated product to database
            const updatedProduct = await product.save();
            res.json(updatedProduct);

        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");

    }
})

//Delete route by id
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: "Product removed" })
        } else {
            res.status(404).json({ message: "Product not found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
})

// Get all products
router.get("/", async (req, res) => {
    try {
        const {
            size,
            color,
            display,
            condition,
            category,
            minPrice,
            maxPrice,
            sortBy,
            search,
            limit
        } = req.query;
        let query = {};

        //filter product

        if (category && category.toLocaleLowerCase() !== "all") {
            query.category = category
        }
        if (size) {
            query.sizes = { $in: [size] };
        }
        if (color) {
            query.colors = { $in: [color] };
        }
        if (display) {
            query.display = { $in: [display] };
        }
        if (condition) {
            query.condition = { $in: [condition] };
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ]
        }

        let sort = {};
        if (sortBy) {
            switch (sortBy) {
                case "priceAsc":
                    sort = { price: 1 };
                    break;
                case "priceDesc":
                    sort = { price: -1 };
                    break;
                case "popularity":
                    sort = { rating: -1 };
                    break;
                default:
                    break;
            }
        }

        let products = await Product.find(query)
            .sort(sort)
            .limit(Number(limit) || 0);
        res.json(products)


    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");

    }
})


// Best Seller 
//Get product with highest rating
router.get("/best-seller", async (req, res) => {
    try {
        const bestSeller = await Product.findOne().sort({ rating: -1 });
        if (bestSeller) {
            res.json(bestSeller);
        } else {
            res.status(404).json({ message: "No best seller found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error")
    }
})

//New-arrivals
router.get("/new-arrivals", async (req, res) => {
    try {
        const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
        res.json(newArrivals)
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error")
    }
})

// Get Products by ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: "Product Not Found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
})


// Get similar products
router.get("/similar/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const similarProducts = await Product.find({
            _id: { $ne: id },
            brand: product.brand,
            category: product.category,
        }).limit(4);

        res.json(similarProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error")
    }
})

module.exports = router;