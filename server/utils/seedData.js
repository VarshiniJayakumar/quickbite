/**
 * Seed script — populates MongoDB with sample food items and an admin user.
 * Run with: node utils/seedData.js
 */
require('dotenv').config()
const mongoose = require('mongoose')
const Food = require('../models/Food')
const User = require('../models/User')

const foods = [
  { title: 'Classic Beef Burger', description: 'Juicy 150g beef patty with lettuce, tomato, and special sauce on a brioche bun.', price: 249, category: 'Burger', ingredients: ['Beef', 'Lettuce', 'Tomato', 'Cheese', 'Brioche Bun', 'Special Sauce'], rating: 4.8, available: true, featured: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
  { title: 'Spicy Chicken Burger', description: 'Crispy fried chicken with jalapenos and sriracha mayo. Not for the faint hearted!', price: 219, category: 'Burger', ingredients: ['Chicken', 'Jalapenos', 'Sriracha Mayo', 'Coleslaw', 'Potato Bun'], rating: 4.7, available: true, featured: true, image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&q=80' },
  { title: 'Margherita Pizza', description: 'Classic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella and basil.', price: 349, category: 'Pizza', ingredients: ['Tomato Sauce', 'Mozzarella', 'Fresh Basil', 'Olive Oil'], rating: 4.6, available: true, featured: true, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
  { title: 'Pepperoni Pizza', description: 'Loaded with premium pepperoni slices and a blend of three cheeses on a crispy crust.', price: 399, category: 'Pizza', ingredients: ['Pepperoni', 'Mozzarella', 'Cheddar', 'Tomato Sauce'], rating: 4.9, available: true, featured: true, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80' },
  { title: 'Chicken Ramen', description: 'Rich tonkotsu broth with tender chicken slices, soft-boiled egg and bamboo shoots.', price: 299, category: 'Noodles', ingredients: ['Ramen Noodles', 'Chicken', 'Egg', 'Bamboo Shoots', 'Nori', 'Spring Onion'], rating: 4.5, available: true, featured: true, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80' },
  { title: 'Pad Thai', description: 'Stir-fried rice noodles with shrimp, tofu, bean sprouts and crushed peanuts.', price: 279, category: 'Noodles', ingredients: ['Rice Noodles', 'Shrimp', 'Tofu', 'Bean Sprouts', 'Peanuts', 'Lime'], rating: 4.4, available: true, featured: false, image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80' },
  { title: 'Mango Smoothie', description: 'Fresh Alphonso mango blended with yogurt and a hint of cardamom.', price: 129, category: 'Drinks', ingredients: ['Alphonso Mango', 'Yogurt', 'Cardamom', 'Honey'], rating: 4.7, available: true, featured: false, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80' },
  { title: 'Cold Brew Coffee', description: 'Smooth 18-hour cold brew concentrate served over ice with oat milk.', price: 149, category: 'Drinks', ingredients: ['Cold Brew Coffee', 'Oat Milk', 'Ice', 'Brown Sugar Syrup'], rating: 4.6, available: true, featured: true, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
  { title: 'Chocolate Lava Cake', description: 'Warm dark chocolate cake with a gooey molten center, served with vanilla ice cream.', price: 199, category: 'Dessert', ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Flour', 'Vanilla Ice Cream'], rating: 4.9, available: true, featured: true, image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80' },
  { title: 'Mango Cheesecake', description: 'Creamy no-bake cheesecake with fresh Alphonso mango coulis and graham cracker crust.', price: 179, category: 'Dessert', ingredients: ['Cream Cheese', 'Mango', 'Graham Crackers', 'Butter', 'Heavy Cream'], rating: 4.8, available: true, featured: true, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80' },
  { title: 'Veggie Burger', description: 'House-made black bean patty with avocado, roasted red peppers and herb aioli.', price: 199, category: 'Burger', ingredients: ['Black Bean Patty', 'Avocado', 'Roasted Peppers', 'Herb Aioli', 'Sesame Bun'], rating: 4.3, available: true, featured: false, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80' },
  { title: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce base with grilled chicken, red onion, and fresh cilantro.', price: 379, category: 'Pizza', ingredients: ['BBQ Sauce', 'Grilled Chicken', 'Red Onion', 'Cilantro', 'Mozzarella'], rating: 4.6, available: true, featured: false, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' },
]

const adminUser = {
  name: 'Admin User',
  email: 'admin@quickbite.com',
  password: 'Admin@1234',
  role: 'admin',
  phone: '+91 98765 43210',
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    await Food.deleteMany({})
    await Food.insertMany(foods)
    console.log(`✅ Seeded ${foods.length} food items`)

    const existingAdmin = await User.findOne({ email: adminUser.email })
    if (!existingAdmin) {
      await User.create(adminUser)
      console.log('✅ Admin user created — email: admin@quickbite.com  password: Admin@1234')
    } else {
      console.log('ℹ️  Admin user already exists, skipping')
    }

    console.log('\n🎉 Seed complete!')
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err.message)
    process.exit(1)
  }
}

seed()
