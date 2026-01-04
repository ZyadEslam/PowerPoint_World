import connectDB from "../app/utils/db";
import Category from "../app/models/category";

const seedCategories = async () => {
  try {
    await connectDB();

    const categories = [
      {
        name: "New Collection",
        slug: "new-collection",
        description: "Discover our latest arrivals and trending products",
        isFeatured: true,
        sortOrder: 1,
        products: [],
      },
      {
        name: "Summer",
        slug: "summer",
        description: "Perfect products for the summer season",
        isFeatured: true,
        sortOrder: 2,
        products: [],
      },
      {
        name: "Winter",
        slug: "winter",
        description: "Cozy and warm products for winter",
        isFeatured: true,
        sortOrder: 3,
        products: [],
      },
      {
        name: "Electronics",
        slug: "electronics",
        description: "Latest gadgets and electronic devices",
        isFeatured: false,
        sortOrder: 4,
        products: [],
      },
      {
        name: "Fashion",
        slug: "fashion",
        description: "Trendy clothing and accessories",
        isFeatured: false,
        sortOrder: 5,
        products: [],
      },
      {
        name: "Home & Garden",
        slug: "home-garden",
        description: "Everything for your home and garden",
        isFeatured: false,
        sortOrder: 6,
        products: [],
      },
      {
        name: "Sports & Fitness",
        slug: "sports-fitness",
        description: "Gear for sports and fitness enthusiasts",
        isFeatured: false,
        sortOrder: 7,
        products: [],
      },
      {
        name: "Books & Media",
        slug: "books-media",
        description: "Books, movies, and digital media",
        isFeatured: false,
        sortOrder: 8,
        products: [],
      },
    ];

    // Clear existing categories
    await Category.deleteMany({});

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);

    console.log(`Successfully seeded ${createdCategories.length} categories:`);
    createdCategories.forEach((category) => {
      console.log(`- ${category.name} (${category.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedCategories();
}

export default seedCategories;
