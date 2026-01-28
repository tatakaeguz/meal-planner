'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'
import { 
  Calendar, Clock, Heart, Utensils, Plus, Check, ChevronDown, ChevronUp, 
  LogOut, Sparkles, X, Loader2, Smile, Frown, Meh, Scale, Ruler,
  Trash2, CalendarPlus, Target, TrendingUp, ChevronLeft, ChevronRight,
  ThumbsUp, ThumbsDown, RotateCcw, Sun, Coffee, Moon, History, Mail,
  Settings, Star, RefreshCw, ChefHat, Flame, Award, UserCircle, Phone, AtSign
} from 'lucide-react'

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Types
interface UserProfile {
  // Identity
  first_name: string
  last_name: string
  username: string
  email: string
  phone: string
  // Physical
  height_cm: number
  weight_kg: number
  bmi: number
  daily_calories: number
  // Preferences
  meals_per_day: number
  meal_types: string[]
  cuisine_preferences: string[]
  dietary_restrictions: string[]
  dislikes: string[]
  // Health
  health_data: {
    alt: number
    ast: number
    ldl: number
    hdl: number
  }
  onboarding_completed: boolean
}

interface Meal {
  id: string
  name: string
  time: string
  duration: number
  cuisine: string
  benefits: string[]
  ingredients: string[]
  instructions: string[]
  nutrition: { calories: number; fiber: string; protein: string; carbs: string; fat: string }
  healthScore: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  addedManually?: boolean
  liked?: boolean
  disliked?: boolean
  portionScale?: number
}

interface DayPlan {
  date: string
  dayName: string
  meals: Meal[]
  totalCalories: number
  isToday: boolean
}

interface WeekPlan {
  weekStart: string
  days: DayPlan[]
  reviewed: boolean
  favoriteIds: string[]
}

interface MoodData {
  energy: 'low' | 'medium' | 'high'
  mood: 'stressed' | 'neutral' | 'happy'
  craving: string
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
}

// Comprehensive Recipe Database - Organized by cuisine and meal type
const RECIPE_DATABASE: Meal[] = [
  // ==================== MEDITERRANEAN ====================
  // Breakfast
  { id: 'med-b1', name: 'Greek Yogurt Bowl with Honey & Figs', time: '08:00', duration: 10, cuisine: 'Mediterranean', mealType: 'breakfast', benefits: ['Probiotics', 'Liver support', 'High protein'], ingredients: ['1.5 cups Greek yogurt', '2 fresh figs, quartered', '2 tbsp raw honey', '1/4 cup walnuts', '1 tbsp chia seeds', 'Fresh mint leaves'], instructions: ['Add thick Greek yogurt to a bowl', 'Arrange quartered figs on top', 'Drizzle generously with raw honey', 'Sprinkle walnuts and chia seeds', 'Garnish with fresh mint leaves', 'Serve immediately for best texture'], nutrition: { calories: 480, fiber: '6g', protein: '24g', carbs: '45g', fat: '22g' }, healthScore: 92 },
  { id: 'med-b2', name: 'Shakshuka with Crusty Bread', time: '08:00', duration: 25, cuisine: 'Mediterranean', mealType: 'breakfast', benefits: ['Vitamin A', 'Antioxidants', 'Protein rich'], ingredients: ['4 large eggs', '1 can (400g) crushed tomatoes', '1 red bell pepper, diced', '1 onion, diced', '4 cloves garlic, minced', '1 tsp cumin', '1 tsp paprika', '1/2 tsp cayenne', 'Fresh parsley', 'Crusty sourdough bread', '2 tbsp olive oil', 'Crumbled feta cheese'], instructions: ['Heat olive oil in a large skillet over medium heat', 'Sauté onion and bell pepper for 5 minutes until soft', 'Add garlic, cumin, paprika, and cayenne, cook 1 minute', 'Pour in crushed tomatoes, simmer 10 minutes', 'Create 4 wells in the sauce using a spoon', 'Crack an egg into each well', 'Cover and cook 5-7 minutes until whites are set', 'Top with crumbled feta and fresh parsley', 'Serve with warm crusty bread for dipping'], nutrition: { calories: 520, fiber: '5g', protein: '24g', carbs: '42g', fat: '28g' }, healthScore: 88 },
  { id: 'med-b3', name: 'Avocado Toast with Poached Eggs & Za\'atar', time: '08:00', duration: 20, cuisine: 'Mediterranean', mealType: 'breakfast', benefits: ['Healthy fats', 'Raises HDL', 'Heart healthy'], ingredients: ['2 slices sourdough bread', '1 ripe avocado', '2 large eggs', '1 tbsp za\'atar spice blend', '1 tbsp extra virgin olive oil', 'Cherry tomatoes, halved', 'Red pepper flakes', 'Flaky sea salt', '1 tbsp white vinegar (for poaching)'], instructions: ['Toast sourdough until golden and crispy', 'Bring a pot of water to gentle simmer, add vinegar', 'Create a whirlpool and carefully drop in eggs, poach 3-4 minutes', 'Mash avocado with salt and a squeeze of lemon', 'Spread avocado generously on toast', 'Place poached eggs on top', 'Drizzle with olive oil', 'Sprinkle za\'atar, red pepper flakes, and sea salt', 'Add cherry tomato halves on the side'], nutrition: { calories: 540, fiber: '12g', protein: '20g', carbs: '38g', fat: '34g' }, healthScore: 90 },
  { id: 'med-b4', name: 'Mediterranean Breakfast Wrap', time: '08:00', duration: 15, cuisine: 'Mediterranean', mealType: 'breakfast', benefits: ['High protein', 'Fiber', 'Balanced'], ingredients: ['1 large whole wheat tortilla', '3 eggs scrambled', '1/4 cup hummus', '1/4 cup feta cheese', '1/4 cup sun-dried tomatoes', 'Handful spinach', '2 tbsp olive oil', 'Fresh herbs'], instructions: ['Scramble eggs in olive oil until fluffy', 'Warm tortilla in a dry pan', 'Spread hummus across the center', 'Add scrambled eggs', 'Top with feta, sun-dried tomatoes, and spinach', 'Roll up tightly, cut in half', 'Serve immediately'], nutrition: { calories: 580, fiber: '8g', protein: '28g', carbs: '42g', fat: '34g' }, healthScore: 89 },
  
  // Lunch
  { id: 'med-l1', name: 'Grilled Salmon with Quinoa Tabbouleh', time: '13:00', duration: 35, cuisine: 'Mediterranean', mealType: 'lunch', benefits: ['Omega-3s', 'Raises HDL', 'Liver support'], ingredients: ['200g salmon fillet', '1 cup quinoa', '1 large cucumber, diced', '2 cups fresh parsley, chopped', '1/2 cup fresh mint, chopped', '3 Roma tomatoes, diced', '1/4 cup extra virgin olive oil', '3 tbsp fresh lemon juice', '3 green onions, sliced', '2 cloves garlic, minced', 'Salt and pepper to taste'], instructions: ['Cook quinoa according to package directions, let cool', 'Season salmon with olive oil, salt, pepper, and lemon zest', 'Grill salmon 4-5 minutes per side until flaky', 'In a large bowl, combine cooled quinoa with cucumber, tomatoes, parsley, and mint', 'Whisk together olive oil, lemon juice, and garlic', 'Toss quinoa salad with dressing', 'Let flavors meld for 10 minutes', 'Serve salmon over the tabbouleh', 'Garnish with extra lemon wedges'], nutrition: { calories: 580, fiber: '8g', protein: '42g', carbs: '38g', fat: '28g' }, healthScore: 97 },
  { id: 'med-l2', name: 'Mediterranean Chickpea & Vegetable Stew', time: '13:00', duration: 40, cuisine: 'Mediterranean', mealType: 'lunch', benefits: ['Lowers LDL', 'High fiber', 'Plant protein'], ingredients: ['2 cans chickpeas, drained', '1 can diced tomatoes', '1 large eggplant, cubed', '2 zucchini, sliced', '1 red bell pepper, diced', '1 onion, diced', '4 cloves garlic, minced', '1 tsp cumin', '1 tsp coriander', '1/2 tsp cinnamon', '1/4 cup olive oil', 'Fresh cilantro', 'Crusty bread for serving'], instructions: ['Heat olive oil in a large Dutch oven over medium-high heat', 'Add eggplant cubes, cook until golden, about 8 minutes', 'Remove eggplant, add onion and bell pepper, sauté 5 minutes', 'Add garlic and spices, cook 1 minute until fragrant', 'Add tomatoes, chickpeas, and 1 cup water', 'Return eggplant, add zucchini', 'Simmer covered for 20 minutes', 'Season with salt and pepper', 'Serve hot with fresh cilantro and crusty bread'], nutrition: { calories: 420, fiber: '14g', protein: '16g', carbs: '52g', fat: '18g' }, healthScore: 94 },
  { id: 'med-l3', name: 'Greek Salad with Grilled Chicken Souvlaki', time: '13:00', duration: 30, cuisine: 'Mediterranean', mealType: 'lunch', benefits: ['Lean protein', 'Antioxidants', 'Heart healthy'], ingredients: ['300g chicken breast', '2 tbsp olive oil', '2 tbsp lemon juice', '2 tsp dried oregano', '4 cloves garlic, minced', '1 large cucumber', '4 Roma tomatoes', '1 red onion', '200g feta cheese', '1/2 cup Kalamata olives', 'Red wine vinegar', 'Extra virgin olive oil for dressing'], instructions: ['Marinate chicken in olive oil, lemon, oregano, and garlic for 15 minutes', 'Thread chicken onto skewers', 'Grill over high heat 4-5 minutes per side', 'Cut cucumber, tomatoes, and onion into large chunks', 'Arrange vegetables on a platter', 'Add olives and large chunks of feta', 'Drizzle with olive oil and red wine vinegar', 'Season with salt, pepper, and dried oregano', 'Serve chicken skewers over the salad'], nutrition: { calories: 520, fiber: '5g', protein: '45g', carbs: '18g', fat: '32g' }, healthScore: 91 },

  // Dinner
  { id: 'med-d1', name: 'Herb-Crusted Baked Sea Bass with Roasted Vegetables', time: '19:00', duration: 45, cuisine: 'Mediterranean', mealType: 'dinner', benefits: ['Omega-3s', 'Liver detox', 'Low fat'], ingredients: ['400g sea bass fillets', '1 cup fresh breadcrumbs', '1/4 cup fresh parsley', '2 tbsp fresh dill', '2 tbsp fresh thyme', 'Zest of 1 lemon', '4 tbsp olive oil', '500g cherry tomatoes', '2 zucchini, sliced', '1 red onion, wedged', '1 fennel bulb, sliced', '4 cloves garlic, whole'], instructions: ['Preheat oven to 400°F (200°C)', 'Toss vegetables with 2 tbsp olive oil, salt, and pepper', 'Spread on a baking sheet, roast for 15 minutes', 'Mix breadcrumbs with herbs, lemon zest, and remaining olive oil', 'Season fish with salt and pepper', 'Press herb mixture onto the fish', 'Place fish on top of partially roasted vegetables', 'Bake for 15-18 minutes until fish flakes easily', 'Squeeze fresh lemon over everything before serving'], nutrition: { calories: 480, fiber: '7g', protein: '38g', carbs: '28g', fat: '24g' }, healthScore: 95 },
  { id: 'med-d2', name: 'Lamb Kofta with Tzatziki & Warm Pita', time: '19:00', duration: 40, cuisine: 'Mediterranean', mealType: 'dinner', benefits: ['High protein', 'Probiotics', 'B vitamins'], ingredients: ['500g ground lamb', '1 onion, grated', '4 cloves garlic, minced', '1/4 cup fresh parsley', '1/4 cup fresh mint', '1 tsp cumin', '1 tsp coriander', '1/2 tsp cinnamon', 'For tzatziki: 1 cup Greek yogurt, 1 cucumber grated, 2 cloves garlic, 1 tbsp dill, lemon juice', '4 pita breads', 'Sliced tomatoes and red onion for serving'], instructions: ['Combine lamb with onion, garlic, herbs, and spices', 'Mix well and form into oval shapes around skewers', 'Refrigerate 15 minutes to firm up', 'Make tzatziki: squeeze water from cucumber, mix all ingredients', 'Grill kofta over high heat, 3-4 minutes per side', 'Warm pita bread on the grill', 'Serve kofta with tzatziki, warm pita, tomatoes, and onion', 'Drizzle with olive oil and sprinkle with sumac'], nutrition: { calories: 620, fiber: '4g', protein: '38g', carbs: '42g', fat: '34g' }, healthScore: 82 },

  // ==================== ASIAN ====================
  // Breakfast
  { id: 'asian-b1', name: 'Japanese Tamagoyaki with Miso Soup & Rice', time: '08:00', duration: 25, cuisine: 'Asian', mealType: 'breakfast', benefits: ['Protein rich', 'Probiotics', 'Balanced'], ingredients: ['4 large eggs', '2 tbsp dashi stock', '1 tbsp mirin', '1 tsp soy sauce', '1 tsp sugar', 'Vegetable oil', '1 cup steamed rice', 'For miso soup: 4 cups dashi, 3 tbsp white miso paste, 1 block silken tofu cubed, 2 green onions sliced, wakame seaweed', 'Pickled vegetables'], instructions: ['Cook rice and keep warm', 'Whisk eggs with dashi, mirin, soy sauce, and sugar', 'Heat tamagoyaki pan or small skillet over medium heat', 'Add thin layer of egg mixture, let set partially', 'Roll from one end to the other', 'Push roll to the side, add more egg mixture', 'Repeat rolling process 4-5 times', 'Let rest, then slice into rounds', 'For soup: heat dashi, dissolve miso paste (don\'t boil)', 'Add tofu and wakame, garnish with green onions', 'Serve tamagoyaki with rice, miso soup, and pickles'], nutrition: { calories: 520, fiber: '4g', protein: '26g', carbs: '52g', fat: '22g' }, healthScore: 88 },
  { id: 'asian-b2', name: 'Congee with Ginger, Pork & Soft-Boiled Egg', time: '08:00', duration: 45, cuisine: 'Asian', mealType: 'breakfast', benefits: ['Easy to digest', 'Warming', 'Liver support'], ingredients: ['1 cup jasmine rice', '8 cups chicken broth', '150g ground pork', '2 inch piece fresh ginger, sliced', '2 cloves garlic, minced', '2 eggs', 'Toppings: sliced green onions, crispy shallots, sesame oil, soy sauce, white pepper', 'Fresh cilantro', 'Fried dough sticks (youtiao)'], instructions: ['Rinse rice thoroughly until water runs clear', 'Brown ground pork in a pot, season with soy sauce', 'Add rice, broth, ginger, and garlic', 'Bring to a boil, then reduce to a low simmer', 'Cook uncovered for 35-40 minutes, stirring occasionally', 'Rice should break down into a creamy porridge', 'Meanwhile, soft-boil eggs: 6.5 minutes in boiling water, then ice bath', 'Season congee with salt to taste', 'Ladle into bowls, top with halved soft-boiled egg', 'Add green onions, crispy shallots, drizzle of sesame oil', 'Serve with fried dough sticks'], nutrition: { calories: 560, fiber: '3g', protein: '28g', carbs: '58g', fat: '24g' }, healthScore: 85 },
  { id: 'asian-b3', name: 'Nasi Lemak Breakfast', time: '08:00', duration: 35, cuisine: 'Asian', mealType: 'breakfast', benefits: ['Balanced', 'Protein', 'Satisfying'], ingredients: ['1.5 cups coconut rice', '2 eggs', 'Sambal sauce', '1/2 cup roasted peanuts', 'Fried anchovies', 'Cucumber slices', 'Coconut milk for rice'], instructions: ['Cook rice with coconut milk and pandan leaf', 'Fry eggs sunny-side up', 'Prepare sambal by blending chilies, shallots, and shrimp paste', 'Toast peanuts until fragrant', 'Fry anchovies until crispy', 'Mound coconut rice on plate', 'Arrange egg, sambal, peanuts, anchovies around rice', 'Add fresh cucumber slices', 'Serve immediately'], nutrition: { calories: 580, fiber: '4g', protein: '22g', carbs: '54g', fat: '32g' }, healthScore: 82 },

  // Lunch
  { id: 'asian-l1', name: 'Teriyaki Salmon Bowl with Edamame', time: '13:00', duration: 30, cuisine: 'Asian', mealType: 'lunch', benefits: ['Omega-3s', 'Raises HDL', 'Complete protein'], ingredients: ['200g salmon fillet', 'For teriyaki: 1/4 cup soy sauce, 2 tbsp mirin, 2 tbsp sake, 1 tbsp honey, 1 tsp ginger grated', '1.5 cups sushi rice', '1 cup edamame, shelled', '1 avocado, sliced', 'Pickled ginger', 'Cucumber, sliced', 'Sesame seeds', 'Nori strips'], instructions: ['Cook sushi rice according to package, season with rice vinegar', 'Combine teriyaki ingredients in a small saucepan, simmer until thickened', 'Season salmon with salt and pepper', 'Pan-sear salmon skin-side down 4 minutes, flip', 'Brush with teriyaki sauce, cook 3 more minutes', 'Cook edamame in salted boiling water 3 minutes', 'Assemble bowl: rice base, sliced salmon on top', 'Arrange edamame, avocado, cucumber around the bowl', 'Drizzle with remaining teriyaki sauce', 'Top with sesame seeds, nori strips, and pickled ginger'], nutrition: { calories: 620, fiber: '8g', protein: '40g', carbs: '58g', fat: '26g' }, healthScore: 94 },
  { id: 'asian-l2', name: 'Vietnamese Pho with Beef & Fresh Herbs', time: '13:00', duration: 50, cuisine: 'Asian', mealType: 'lunch', benefits: ['Anti-inflammatory', 'Warming', 'Low fat'], ingredients: ['200g beef sirloin, sliced thin', '8 cups beef bone broth', '4 star anise', '2 cinnamon sticks', '4 whole cloves', '2 inch ginger, halved and charred', '1 onion, halved and charred', '200g rice noodles', 'Fish sauce to taste', 'Fresh herbs: Thai basil, cilantro, mint', 'Bean sprouts', 'Lime wedges', 'Hoisin and sriracha for serving', 'Sliced jalapeños'], instructions: ['Char ginger and onion under broiler or over flame until blackened', 'Toast star anise, cinnamon, and cloves in dry pan until fragrant', 'Add broth, charred aromatics, and toasted spices to pot', 'Simmer for 30 minutes to develop flavor', 'Strain broth, season with fish sauce and a pinch of sugar', 'Cook rice noodles according to package', 'Place noodles in large bowls', 'Top with raw sliced beef', 'Ladle boiling hot broth over (this cooks the beef)', 'Serve with platter of fresh herbs, sprouts, lime, and sauces'], nutrition: { calories: 480, fiber: '3g', protein: '35g', carbs: '55g', fat: '14g' }, healthScore: 89 },
  { id: 'asian-l3', name: 'Thai Larb Lettuce Wraps', time: '13:00', duration: 25, cuisine: 'Asian', mealType: 'lunch', benefits: ['Lean protein', 'Low carb', 'Fresh herbs'], ingredients: ['400g ground chicken or turkey', '3 tbsp fish sauce', '3 tbsp lime juice', '1 tbsp rice powder (toasted rice, ground)', '1 tsp chili flakes', '4 shallots, sliced thin', '1/4 cup fresh mint', '1/4 cup fresh cilantro', '2 tbsp green onions', '1 head butter lettuce', 'Sticky rice for serving'], instructions: ['Cook ground meat in a dry skillet, breaking into small pieces', 'Remove from heat once cooked through', 'In a bowl, mix fish sauce, lime juice, and chili flakes', 'Pour dressing over warm meat, toss well', 'Add shallots, mint, cilantro, and green onions', 'Sprinkle toasted rice powder and toss again', 'Taste and adjust seasonings', 'Separate lettuce leaves and arrange on platter', 'Spoon larb mixture into lettuce cups', 'Serve with sticky rice on the side'], nutrition: { calories: 380, fiber: '4g', protein: '36g', carbs: '22g', fat: '16g' }, healthScore: 90 },

  // Dinner
  { id: 'asian-d1', name: 'Miso-Glazed Black Cod with Bok Choy', time: '19:00', duration: 35, cuisine: 'Asian', mealType: 'dinner', benefits: ['Omega-3s', 'Liver support', 'Anti-inflammatory'], ingredients: ['400g black cod fillets', '1/4 cup white miso paste', '2 tbsp mirin', '2 tbsp sake', '1 tbsp sugar', '4 baby bok choy, halved', '2 tbsp sesame oil', '2 cloves garlic, minced', '1 tbsp ginger, minced', 'Steamed jasmine rice', 'Sesame seeds and green onions for garnish'], instructions: ['Mix miso, mirin, sake, and sugar until smooth', 'Coat cod fillets generously with miso mixture', 'Marinate for at least 2 hours (or overnight)', 'Preheat broiler to high', 'Place cod on a foil-lined baking sheet', 'Broil 8-10 minutes until caramelized and flaky', 'Meanwhile, heat sesame oil in a wok', 'Add garlic and ginger, stir-fry 30 seconds', 'Add bok choy, stir-fry 3-4 minutes until tender-crisp', 'Serve cod over rice with bok choy alongside', 'Garnish with sesame seeds and green onions'], nutrition: { calories: 520, fiber: '4g', protein: '38g', carbs: '42g', fat: '22g' }, healthScore: 96 },
  { id: 'asian-d2', name: 'Korean Bibimbap with Gochujang', time: '19:00', duration: 45, cuisine: 'Asian', mealType: 'dinner', benefits: ['Balanced meal', 'Vegetables', 'Fermented foods'], ingredients: ['300g beef bulgogi (or tofu)', '2 cups short-grain rice', '2 cups spinach', '1 cup bean sprouts', '1 carrot, julienned', '1 zucchini, julienned', '4 shiitake mushrooms, sliced', '4 eggs', 'Gochujang sauce', 'Sesame oil', 'Sesame seeds', 'Kimchi for serving', 'Soy sauce, garlic, sugar for seasoning vegetables'], instructions: ['Cook rice and keep warm', 'Blanch spinach, squeeze dry, season with sesame oil and garlic', 'Blanch bean sprouts, season with sesame oil and salt', 'Sauté carrots with a pinch of salt until tender-crisp', 'Sauté zucchini until lightly golden', 'Sauté mushrooms with soy sauce until caramelized', 'Cook bulgogi in a hot pan until browned', 'Fry eggs sunny-side up', 'Arrange rice in bowls, top with each vegetable in sections', 'Place bulgogi and fried egg in center', 'Serve with gochujang and sesame oil', 'Mix everything together before eating'], nutrition: { calories: 680, fiber: '6g', protein: '35g', carbs: '72g', fat: '28g' }, healthScore: 88 },

  // ==================== MEXICAN/LATIN ====================
  // Breakfast
  { id: 'mex-b1', name: 'Huevos Rancheros with Fresh Salsa', time: '08:00', duration: 25, cuisine: 'Mexican', mealType: 'breakfast', benefits: ['Protein rich', 'Fiber', 'Vitamin C'], ingredients: ['4 large eggs', '4 corn tortillas', '1 can black beans, drained', '2 cups fresh salsa roja', '1 avocado, sliced', '1/4 cup queso fresco', 'Fresh cilantro', 'For salsa: 4 Roma tomatoes, 2 jalapeños, 1/4 onion, 2 cloves garlic, lime juice'], instructions: ['Make salsa: char tomatoes, jalapeños, onion, and garlic', 'Blend charred vegetables with lime juice and salt', 'Warm black beans with a splash of water and cumin', 'Lightly fry tortillas in oil until slightly crispy', 'Fry eggs sunny-side up or over-easy', 'Place two tortillas on each plate', 'Top with black beans and fried eggs', 'Spoon warm salsa over everything', 'Add avocado slices and crumbled queso fresco', 'Garnish with fresh cilantro and serve immediately'], nutrition: { calories: 480, fiber: '12g', protein: '22g', carbs: '45g', fat: '24g' }, healthScore: 87 },
  { id: 'mex-b2', name: 'Chilaquiles Verdes with Crema', time: '08:00', duration: 30, cuisine: 'Mexican', mealType: 'breakfast', benefits: ['Comfort food', 'Calcium', 'Vegetables'], ingredients: ['8 corn tortillas, cut into triangles', '2 cups salsa verde', '2 eggs', '1/4 cup Mexican crema', '1/2 cup queso fresco', '1/4 red onion, sliced thin', 'Fresh cilantro', 'Vegetable oil for frying', 'Pickled jalapeños (optional)', 'Refried beans for serving'], instructions: ['Fry tortilla triangles until crispy, drain on paper towels', 'Heat salsa verde in a large skillet', 'Add crispy tortillas, toss to coat (they should soften slightly)', 'Create wells and crack in eggs, cover and cook 3-4 minutes', 'Transfer to plates', 'Drizzle with Mexican crema', 'Top with queso fresco, onion slices, and cilantro', 'Serve with refried beans on the side'], nutrition: { calories: 520, fiber: '8g', protein: '18g', carbs: '52g', fat: '28g' }, healthScore: 80 },

  // Lunch
  { id: 'mex-l1', name: 'Fish Tacos with Mango Salsa & Chipotle Crema', time: '13:00', duration: 30, cuisine: 'Mexican', mealType: 'lunch', benefits: ['Omega-3s', 'Vitamin C', 'Light'], ingredients: ['400g white fish (mahi-mahi or cod)', '8 small corn tortillas', 'For mango salsa: 1 mango diced, 1/4 red onion, 1 jalapeño, cilantro, lime juice', 'For chipotle crema: 1/2 cup sour cream, 1 chipotle pepper in adobo, lime juice', 'Shredded red cabbage', 'Lime wedges', 'Cumin, paprika, garlic powder for fish seasoning'], instructions: ['Mix fish seasoning: cumin, paprika, garlic powder, salt', 'Coat fish fillets with seasoning', 'Make mango salsa: combine all ingredients, refrigerate', 'Make chipotle crema: blend sour cream with chipotle and lime', 'Grill or pan-sear fish 3-4 minutes per side', 'Warm tortillas on a dry skillet', 'Flake fish into large chunks', 'Assemble tacos: cabbage, fish, mango salsa', 'Drizzle with chipotle crema', 'Serve with lime wedges'], nutrition: { calories: 480, fiber: '8g', protein: '35g', carbs: '48g', fat: '18g' }, healthScore: 92 },
  { id: 'mex-l2', name: 'Chicken Tortilla Soup', time: '13:00', duration: 45, cuisine: 'Mexican', mealType: 'lunch', benefits: ['Comfort food', 'Anti-inflammatory', 'Protein'], ingredients: ['500g chicken thighs', '6 cups chicken broth', '1 can fire-roasted tomatoes', '1 onion, diced', '4 cloves garlic', '2 jalapeños', '1 tbsp cumin', '1 tbsp chili powder', 'Corn tortillas for strips', 'Toppings: avocado, sour cream, cheese, cilantro, lime'], instructions: ['Poach chicken in broth with onion, garlic, and jalapeño for 20 minutes', 'Remove chicken, shred with two forks', 'Blend tomatoes with remaining onion, garlic, and spices', 'Add tomato mixture to broth, simmer 15 minutes', 'Cut tortillas into strips, fry until crispy', 'Return shredded chicken to soup', 'Season with salt, pepper, and lime juice', 'Ladle into bowls', 'Top with crispy tortilla strips, avocado, cheese, sour cream', 'Garnish with cilantro and serve with lime'], nutrition: { calories: 420, fiber: '6g', protein: '32g', carbs: '35g', fat: '18g' }, healthScore: 88 },

  // Dinner
  { id: 'mex-d1', name: 'Carne Asada with Grilled Vegetables & Chimichurri', time: '19:00', duration: 40, cuisine: 'Mexican', mealType: 'dinner', benefits: ['High protein', 'Iron', 'B vitamins'], ingredients: ['500g flank or skirt steak', 'For marinade: 1/4 cup lime juice, 4 cloves garlic, 1 jalapeño, 1/4 cup cilantro, 2 tbsp olive oil, cumin', 'For chimichurri: 1 cup parsley, 1/4 cup oregano, 4 cloves garlic, 1/2 cup olive oil, 3 tbsp red wine vinegar', '2 bell peppers', '2 zucchini', '1 red onion', 'Warm tortillas', 'Lime wedges'], instructions: ['Blend marinade ingredients, coat steak, marinate 30 min to 2 hours', 'Make chimichurri: pulse all ingredients in food processor', 'Cut vegetables into large pieces for grilling', 'Grill steak over high heat 4-5 minutes per side for medium-rare', 'Rest steak 10 minutes before slicing', 'Grill vegetables until charred and tender', 'Slice steak against the grain', 'Arrange on platter with grilled vegetables', 'Drizzle generously with chimichurri', 'Serve with warm tortillas and lime wedges'], nutrition: { calories: 580, fiber: '5g', protein: '45g', carbs: '25g', fat: '35g' }, healthScore: 85 },
  { id: 'mex-d2', name: 'Shrimp & Vegetable Fajitas', time: '19:00', duration: 25, cuisine: 'Mexican', mealType: 'dinner', benefits: ['Lean protein', 'Vegetables', 'Quick'], ingredients: ['500g large shrimp, peeled', '2 bell peppers, sliced', '1 large onion, sliced', '2 tbsp fajita seasoning', '3 tbsp olive oil', '8 flour tortillas', 'Lime juice', 'Toppings: guacamole, sour cream, pico de gallo, cheese'], instructions: ['Toss shrimp with half the fajita seasoning', 'Toss peppers and onions with remaining seasoning', 'Heat large skillet or cast iron over high heat', 'Add oil, then vegetables, cook 5-6 minutes until charred', 'Push vegetables to the side, add shrimp', 'Cook shrimp 2-3 minutes until pink', 'Squeeze lime juice over everything', 'Warm tortillas in a dry pan or microwave', 'Serve sizzling vegetables and shrimp with tortillas', 'Let everyone build their own fajitas with toppings'], nutrition: { calories: 520, fiber: '6g', protein: '38g', carbs: '48g', fat: '20g' }, healthScore: 90 },

  // ==================== AMERICAN/COMFORT ====================
  // Breakfast
  { id: 'amer-b1', name: 'Veggie-Loaded Omelette with Whole Grain Toast', time: '08:00', duration: 20, cuisine: 'American', mealType: 'breakfast', benefits: ['Protein rich', 'Vegetables', 'Low carb'], ingredients: ['3 large eggs', '1/4 cup milk', '1/4 cup bell peppers, diced', '1/4 cup mushrooms, sliced', '1/4 cup spinach', '2 tbsp onion, diced', '1/4 cup cheese (cheddar or feta)', '1 tbsp butter', '2 slices whole grain bread', 'Fresh herbs (chives, parsley)', 'Salt and pepper'], instructions: ['Sauté vegetables in butter until softened, set aside', 'Beat eggs with milk, salt, and pepper', 'Heat butter in non-stick pan over medium heat', 'Pour in egg mixture, let set for 30 seconds', 'Gently push edges toward center, letting raw egg flow underneath', 'When mostly set, add vegetables and cheese to one half', 'Fold omelette in half, cook 1 more minute', 'Slide onto plate', 'Toast bread, serve alongside omelette', 'Garnish with fresh herbs'], nutrition: { calories: 420, fiber: '4g', protein: '26g', carbs: '28g', fat: '24g' }, healthScore: 86 },
  { id: 'amer-b2', name: 'Banana Oat Pancakes with Berry Compote', time: '08:00', duration: 25, cuisine: 'American', mealType: 'breakfast', benefits: ['Fiber rich', 'Natural sugars', 'Heart healthy'], ingredients: ['1.5 cups rolled oats', '2 ripe bananas', '2 eggs', '1 cup milk', '1 tsp baking powder', '1 tsp vanilla extract', '1/2 tsp cinnamon', 'For compote: 2 cups mixed berries, 2 tbsp honey, 1 tbsp lemon juice', 'Greek yogurt for serving', 'Butter for cooking'], instructions: ['Blend oats in food processor until flour-like', 'Add bananas, eggs, milk, baking powder, vanilla, and cinnamon', 'Blend until smooth batter forms', 'Let rest 5 minutes', 'Make compote: simmer berries with honey and lemon until slightly thick', 'Heat buttered griddle over medium heat', 'Pour 1/4 cup batter per pancake', 'Cook until bubbles form, flip, cook 2 more minutes', 'Stack pancakes, top with warm berry compote', 'Add dollop of Greek yogurt'], nutrition: { calories: 480, fiber: '8g', protein: '16g', carbs: '72g', fat: '14g' }, healthScore: 84 },

  // Lunch
  { id: 'amer-l1', name: 'Turkey & Avocado Club Sandwich', time: '13:00', duration: 15, cuisine: 'American', mealType: 'lunch', benefits: ['Lean protein', 'Healthy fats', 'Quick'], ingredients: ['8oz sliced turkey breast', '1 ripe avocado', '4 slices whole grain bread', '4 strips turkey bacon', '2 leaves romaine lettuce', '2 slices tomato', '2 tbsp mayo or avocado mayo', '1 tbsp Dijon mustard', 'Salt and pepper'], instructions: ['Toast bread until golden', 'Cook turkey bacon until crispy', 'Mash avocado with salt, pepper, and squeeze of lime', 'Spread mayo and mustard on bread slices', 'Layer first slice: lettuce, tomato, turkey', 'Add second slice: avocado spread, bacon', 'Top with third slice of bread', 'Secure with toothpicks, cut diagonally', 'Serve with side salad or chips'], nutrition: { calories: 520, fiber: '10g', protein: '38g', carbs: '42g', fat: '24g' }, healthScore: 83 },
  { id: 'amer-l2', name: 'Grilled Chicken Caesar Salad', time: '13:00', duration: 25, cuisine: 'American', mealType: 'lunch', benefits: ['Lean protein', 'Low carb', 'Calcium'], ingredients: ['300g chicken breast', '1 large head romaine lettuce', '1/2 cup parmesan, shaved', '1 cup croutons', 'For dressing: 2 anchovy fillets, 2 cloves garlic, 1 egg yolk, 2 tbsp lemon juice, 1 tsp Dijon, 1/2 cup olive oil, parmesan', 'Lemon wedges'], instructions: ['Make dressing: blend anchovies, garlic, egg yolk, lemon, and Dijon', 'Slowly drizzle in olive oil while blending', 'Stir in grated parmesan, season to taste', 'Season chicken with salt, pepper, and olive oil', 'Grill 6-7 minutes per side until cooked through', 'Rest chicken 5 minutes, then slice', 'Chop romaine and place in large bowl', 'Toss with dressing', 'Top with sliced chicken, shaved parmesan, and croutons', 'Serve with lemon wedges'], nutrition: { calories: 480, fiber: '4g', protein: '42g', carbs: '18g', fat: '28g' }, healthScore: 87 },

  // Dinner
  { id: 'amer-d1', name: 'Herb-Roasted Chicken with Root Vegetables', time: '19:00', duration: 60, cuisine: 'American', mealType: 'dinner', benefits: ['Protein rich', 'Vegetables', 'Comfort food'], ingredients: ['4 chicken thighs (bone-in, skin-on)', '4 carrots, chunked', '3 parsnips, chunked', '1 lb baby potatoes, halved', '1 onion, wedged', '6 cloves garlic', 'Fresh rosemary and thyme', '4 tbsp olive oil', '2 tbsp butter', 'Chicken broth', 'Salt and pepper'], instructions: ['Preheat oven to 425°F (220°C)', 'Toss vegetables with 2 tbsp olive oil, salt, and pepper', 'Spread in a large roasting pan', 'Season chicken generously with salt and pepper', 'Stuff fresh herbs and garlic under the skin', 'Place chicken on top of vegetables', 'Drizzle with remaining olive oil, dot with butter', 'Roast for 45-50 minutes until chicken is golden and cooked through', 'Let rest 5 minutes before serving', 'Spoon pan juices over everything'], nutrition: { calories: 580, fiber: '8g', protein: '38g', carbs: '42g', fat: '30g' }, healthScore: 85 },
  { id: 'amer-d2', name: 'Baked Salmon with Lemon-Dill Sauce & Asparagus', time: '19:00', duration: 30, cuisine: 'American', mealType: 'dinner', benefits: ['Omega-3s', 'Raises HDL', 'Quick'], ingredients: ['400g salmon fillet', '1 bunch asparagus, trimmed', 'For sauce: 1/2 cup Greek yogurt, 2 tbsp fresh dill, 2 tbsp lemon juice, 1 clove garlic minced, zest of 1 lemon', '3 tbsp olive oil', 'Salt and pepper', 'Lemon slices', 'Quinoa or rice for serving'], instructions: ['Preheat oven to 400°F (200°C)', 'Place salmon on a lined baking sheet', 'Arrange asparagus around the salmon', 'Drizzle everything with olive oil', 'Season with salt, pepper, and lemon zest', 'Place lemon slices on top of salmon', 'Bake for 15-18 minutes until salmon flakes easily', 'Meanwhile, mix all sauce ingredients', 'Serve salmon and asparagus with sauce drizzled on top', 'Accompany with quinoa or rice'], nutrition: { calories: 480, fiber: '5g', protein: '42g', carbs: '18g', fat: '28g' }, healthScore: 95 },

  // ==================== INDIAN ====================
  // Breakfast
  { id: 'indian-b1', name: 'Masala Dosa with Sambar & Coconut Chutney', time: '08:00', duration: 35, cuisine: 'Indian', mealType: 'breakfast', benefits: ['Fermented', 'Fiber', 'Vegetarian'], ingredients: ['For dosa batter (make ahead): 1 cup rice, 1/3 cup urad dal, fermented overnight', 'For potato filling: 3 potatoes boiled and mashed, 1 onion, curry leaves, mustard seeds, turmeric, green chilies', 'For sambar: 1/2 cup toor dal, vegetables (drumstick, carrot, tomato), sambar powder, tamarind', 'For chutney: 1 cup fresh coconut, 2 green chilies, ginger, salt'], instructions: ['Make sambar: cook dal until soft, add vegetables and spices', 'Add tamarind water and simmer until thick', 'Make potato filling: sauté mustard seeds and curry leaves', 'Add onion and green chilies, cook until soft', 'Add mashed potatoes, turmeric, salt, mix well', 'Make chutney: blend coconut, chilies, and ginger with water', 'Heat a flat pan, spread thin layer of dosa batter', 'Cook until crispy, add potato filling, fold', 'Serve with sambar and coconut chutney'], nutrition: { calories: 420, fiber: '8g', protein: '12g', carbs: '68g', fat: '12g' }, healthScore: 82 },

  // Lunch
  { id: 'indian-l1', name: 'Chicken Tikka Masala with Basmati Rice', time: '13:00', duration: 45, cuisine: 'Indian', mealType: 'lunch', benefits: ['High protein', 'Anti-inflammatory', 'Flavorful'], ingredients: ['500g chicken breast, cubed', 'For marinade: 1 cup yogurt, 2 tbsp tikka masala spice, ginger-garlic paste', 'For sauce: 1 can tomato puree, 1 onion, ginger-garlic paste, garam masala, kashmiri chili, cream', '2 cups basmati rice', 'Fresh cilantro', 'Butter and oil', 'Naan bread'], instructions: ['Marinate chicken in yogurt and spices for at least 1 hour', 'Cook basmati rice with a pinch of salt', 'Grill or pan-fry marinated chicken until charred', 'Sauté onion until golden, add ginger-garlic paste', 'Add tomato puree and spices, simmer 15 minutes', 'Add grilled chicken to the sauce', 'Stir in cream, simmer 5 more minutes', 'Garnish with fresh cilantro', 'Serve with basmati rice and warm naan'], nutrition: { calories: 620, fiber: '4g', protein: '42g', carbs: '58g', fat: '24g' }, healthScore: 84 },
  { id: 'indian-l2', name: 'Chana Masala with Jeera Rice', time: '13:00', duration: 40, cuisine: 'Indian', mealType: 'lunch', benefits: ['High fiber', 'Plant protein', 'Lowers LDL'], ingredients: ['2 cans chickpeas, drained', '2 onions, diced', '4 tomatoes, pureed', '2 inch ginger, minced', '6 cloves garlic, minced', '2 green chilies', 'Spices: cumin, coriander, turmeric, garam masala, amchur (mango powder)', 'Fresh cilantro', 'Basmati rice with cumin seeds (jeera rice)'], instructions: ['Make jeera rice: toast cumin seeds in oil, add rice and water, cook', 'Sauté onions until deeply golden (10-12 minutes)', 'Add ginger, garlic, and green chilies', 'Add pureed tomatoes and all spices', 'Cook until oil separates (10 minutes)', 'Add chickpeas and 1 cup water', 'Simmer 15-20 minutes until thick and flavorful', 'Mash some chickpeas for creamier texture', 'Finish with amchur and fresh cilantro', 'Serve with jeera rice'], nutrition: { calories: 480, fiber: '14g', protein: '18g', carbs: '72g', fat: '12g' }, healthScore: 92 },

  // Dinner
  { id: 'indian-d1', name: 'Tandoori Fish with Mint Raita', time: '19:00', duration: 35, cuisine: 'Indian', mealType: 'dinner', benefits: ['Lean protein', 'Omega-3s', 'Low carb'], ingredients: ['400g firm white fish (cod or halibut)', 'For marinade: 1 cup yogurt, 2 tbsp tandoori masala, ginger-garlic paste, lemon juice, kashmiri chili', 'For raita: 1 cup yogurt, 1/2 cucumber grated, fresh mint, cumin, salt', 'Lemon wedges', 'Red onion rings', 'Fresh cilantro', 'Mixed salad'], instructions: ['Mix all marinade ingredients', 'Coat fish fillets, marinate 30 minutes to 2 hours', 'Make raita: combine all ingredients, refrigerate', 'Preheat oven to highest setting or use broiler', 'Place fish on a wire rack over baking sheet', 'Bake/broil 12-15 minutes until charred and cooked through', 'Garnish with red onion rings and cilantro', 'Serve with mint raita and lemon wedges', 'Accompany with fresh salad'], nutrition: { calories: 380, fiber: '2g', protein: '42g', carbs: '12g', fat: '18g' }, healthScore: 93 },

  // ==================== SNACKS ====================
  { id: 'snack-1', name: 'Apple Slices with Almond Butter & Cinnamon', time: '10:30', duration: 5, cuisine: 'American', mealType: 'snack', benefits: ['Fiber', 'Healthy fats', 'Energy boost'], ingredients: ['1 large apple', '2 tbsp almond butter', '1/4 tsp cinnamon', 'Drizzle of honey (optional)'], instructions: ['Core and slice apple into wedges', 'Arrange on a plate', 'Add almond butter in a small bowl for dipping', 'Sprinkle cinnamon over apple slices', 'Drizzle with honey if desired'], nutrition: { calories: 280, fiber: '6g', protein: '6g', carbs: '32g', fat: '16g' }, healthScore: 88 },
  { id: 'snack-2', name: 'Greek Yogurt Parfait with Granola', time: '15:00', duration: 5, cuisine: 'Mediterranean', mealType: 'snack', benefits: ['Probiotics', 'Protein', 'Calcium'], ingredients: ['1 cup Greek yogurt', '1/4 cup granola', '1/2 cup mixed berries', '1 tbsp honey', 'Mint leaves'], instructions: ['Layer half the yogurt in a glass', 'Add half the berries and granola', 'Repeat layers', 'Drizzle with honey', 'Top with mint leaves'], nutrition: { calories: 320, fiber: '4g', protein: '18g', carbs: '42g', fat: '10g' }, healthScore: 90 },
  { id: 'snack-3', name: 'Hummus with Veggie Sticks', time: '16:00', duration: 5, cuisine: 'Mediterranean', mealType: 'snack', benefits: ['Fiber', 'Plant protein', 'Vitamins'], ingredients: ['1/2 cup hummus', '1 carrot, cut into sticks', '1 cucumber, cut into sticks', '1 bell pepper, sliced', 'Cherry tomatoes', 'Olive oil and paprika for garnish'], instructions: ['Scoop hummus into a bowl', 'Drizzle with olive oil and sprinkle paprika', 'Arrange vegetable sticks around the hummus', 'Serve immediately'], nutrition: { calories: 240, fiber: '8g', protein: '8g', carbs: '28g', fat: '12g' }, healthScore: 92 },
  { id: 'snack-4', name: 'Trail Mix with Dark Chocolate', time: '11:00', duration: 2, cuisine: 'American', mealType: 'snack', benefits: ['Raises HDL', 'Antioxidants', 'Energy'], ingredients: ['1/4 cup raw almonds', '1/4 cup walnuts', '2 tbsp pumpkin seeds', '2 tbsp dried cranberries', '1 oz dark chocolate (70%+), chopped'], instructions: ['Combine all ingredients in a bowl', 'Portion into a container for grab-and-go', 'Store in airtight container'], nutrition: { calories: 320, fiber: '5g', protein: '10g', carbs: '22g', fat: '24g' }, healthScore: 85 },
  { id: 'snack-5', name: 'Caprese Skewers', time: '14:00', duration: 10, cuisine: 'Mediterranean', mealType: 'snack', benefits: ['Calcium', 'Lycopene', 'Fresh'], ingredients: ['12 cherry tomatoes', '12 mini mozzarella balls (bocconcini)', '12 fresh basil leaves', 'Balsamic glaze', 'Extra virgin olive oil', 'Salt and pepper'], instructions: ['Thread tomato, basil leaf, and mozzarella onto small skewers', 'Arrange on a plate', 'Drizzle with olive oil and balsamic glaze', 'Season with salt and pepper', 'Serve immediately'], nutrition: { calories: 220, fiber: '2g', protein: '14g', carbs: '8g', fat: '16g' }, healthScore: 86 },
  { id: 'snack-6', name: 'Edamame with Sea Salt', time: '15:30', duration: 5, cuisine: 'Asian', mealType: 'snack', benefits: ['Plant protein', 'Fiber', 'Isoflavones'], ingredients: ['2 cups edamame in pods', 'Flaky sea salt', 'Optional: chili flakes, sesame seeds, lime zest'], instructions: ['Boil edamame in salted water for 4 minutes', 'Drain well', 'Toss with sea salt and any optional seasonings', 'Serve warm in a bowl'], nutrition: { calories: 180, fiber: '8g', protein: '16g', carbs: '14g', fat: '8g' }, healthScore: 91 },
  { id: 'snack-7', name: 'Cottage Cheese with Pineapple', time: '10:00', duration: 3, cuisine: 'American', mealType: 'snack', benefits: ['High protein', 'Calcium', 'Vitamin C'], ingredients: ['1 cup low-fat cottage cheese', '1/2 cup fresh pineapple chunks', '1 tbsp honey', 'Pinch of cinnamon'], instructions: ['Add cottage cheese to a bowl', 'Top with fresh pineapple chunks', 'Drizzle with honey', 'Sprinkle with cinnamon', 'Enjoy immediately'], nutrition: { calories: 220, fiber: '1g', protein: '24g', carbs: '22g', fat: '4g' }, healthScore: 89 },
  { id: 'snack-8', name: 'Banana with Peanut Butter', time: '15:00', duration: 3, cuisine: 'American', mealType: 'snack', benefits: ['Potassium', 'Energy', 'Healthy fats'], ingredients: ['1 medium banana', '2 tbsp natural peanut butter', 'Optional: dark chocolate chips'], instructions: ['Slice banana into rounds', 'Spread peanut butter on top', 'Add chocolate chips if desired', 'Enjoy as a quick energy boost'], nutrition: { calories: 290, fiber: '4g', protein: '8g', carbs: '32g', fat: '16g' }, healthScore: 85 },
  { id: 'snack-9', name: 'Avocado Toast Bites', time: '11:00', duration: 8, cuisine: 'American', mealType: 'snack', benefits: ['Healthy fats', 'Fiber', 'Heart healthy'], ingredients: ['1 small avocado', '4 whole grain crackers or toast rounds', 'Everything bagel seasoning', 'Lemon juice', 'Flaky salt'], instructions: ['Mash avocado with lemon juice and salt', 'Spread on crackers or toast rounds', 'Sprinkle with everything bagel seasoning', 'Serve immediately'], nutrition: { calories: 240, fiber: '8g', protein: '4g', carbs: '18g', fat: '18g' }, healthScore: 88 },
  { id: 'snack-10', name: 'Roasted Chickpeas', time: '16:00', duration: 35, cuisine: 'Mediterranean', mealType: 'snack', benefits: ['Plant protein', 'Fiber', 'Lowers LDL'], ingredients: ['1 can chickpeas, drained and dried', '1 tbsp olive oil', '1 tsp cumin', '1 tsp paprika', '1/2 tsp garlic powder', 'Salt to taste'], instructions: ['Preheat oven to 400°F (200°C)', 'Pat chickpeas completely dry', 'Toss with olive oil and spices', 'Spread on baking sheet in single layer', 'Roast 30-35 minutes until crispy', 'Let cool before serving'], nutrition: { calories: 200, fiber: '8g', protein: '10g', carbs: '28g', fat: '6g' }, healthScore: 93 },
  { id: 'snack-11', name: 'Rice Cakes with Cream Cheese & Cucumber', time: '14:30', duration: 5, cuisine: 'American', mealType: 'snack', benefits: ['Light', 'Hydrating', 'Low calorie'], ingredients: ['2 rice cakes', '2 tbsp cream cheese', '1/2 cucumber, sliced', 'Fresh dill', 'Everything seasoning'], instructions: ['Spread cream cheese on rice cakes', 'Top with cucumber slices', 'Garnish with fresh dill', 'Sprinkle with everything seasoning'], nutrition: { calories: 180, fiber: '2g', protein: '4g', carbs: '24g', fat: '8g' }, healthScore: 82 },
  { id: 'snack-12', name: 'Mixed Berries with Whipped Cream', time: '15:30', duration: 5, cuisine: 'American', mealType: 'snack', benefits: ['Antioxidants', 'Vitamin C', 'Light'], ingredients: ['1 cup mixed berries (strawberries, blueberries, raspberries)', '2 tbsp whipped cream', '1 tbsp sliced almonds', 'Fresh mint'], instructions: ['Wash and dry berries', 'Place in a bowl', 'Top with whipped cream', 'Sprinkle with almonds', 'Garnish with mint'], nutrition: { calories: 150, fiber: '4g', protein: '2g', carbs: '18g', fat: '8g' }, healthScore: 87 },
  { id: 'snack-13', name: 'Turkey & Cheese Roll-Ups', time: '11:30', duration: 5, cuisine: 'American', mealType: 'snack', benefits: ['High protein', 'Low carb', 'Filling'], ingredients: ['4 slices deli turkey', '2 slices Swiss cheese', 'Mustard', 'Pickle spears'], instructions: ['Lay out turkey slices', 'Add half slice of cheese to each', 'Spread with mustard', 'Roll up tightly', 'Serve with pickle spears'], nutrition: { calories: 200, fiber: '0g', protein: '22g', carbs: '2g', fat: '12g' }, healthScore: 84 },
  { id: 'snack-14', name: 'Mango Lassi Smoothie', time: '10:00', duration: 5, cuisine: 'Indian', mealType: 'snack', benefits: ['Probiotics', 'Vitamin C', 'Refreshing'], ingredients: ['1 cup mango chunks (fresh or frozen)', '1/2 cup plain yogurt', '1/2 cup milk', '1 tbsp honey', 'Pinch of cardamom'], instructions: ['Add all ingredients to blender', 'Blend until smooth', 'Pour into glass', 'Sprinkle with cardamom', 'Serve cold'], nutrition: { calories: 260, fiber: '2g', protein: '8g', carbs: '48g', fat: '4g' }, healthScore: 86 },
  { id: 'snack-15', name: 'Guacamole with Tortilla Chips', time: '16:00', duration: 10, cuisine: 'Mexican', mealType: 'snack', benefits: ['Healthy fats', 'Fiber', 'Heart healthy'], ingredients: ['2 ripe avocados', '1/4 cup diced tomato', '2 tbsp red onion, minced', '1 jalapeño, minced', 'Lime juice', 'Cilantro', 'Tortilla chips'], instructions: ['Mash avocados in a bowl', 'Add tomato, onion, and jalapeño', 'Season with lime juice and salt', 'Fold in cilantro', 'Serve with tortilla chips'], nutrition: { calories: 340, fiber: '10g', protein: '4g', carbs: '28g', fat: '26g' }, healthScore: 85 },
  { id: 'snack-16', name: 'Protein Energy Balls', time: '14:00', duration: 15, cuisine: 'American', mealType: 'snack', benefits: ['Energy', 'Protein', 'No-bake'], ingredients: ['1 cup oats', '1/2 cup peanut butter', '1/3 cup honey', '1/2 cup chocolate chips', '2 tbsp chia seeds', '1 tsp vanilla'], instructions: ['Mix all ingredients in a bowl', 'Refrigerate for 30 minutes', 'Roll into 1-inch balls', 'Store in fridge for up to a week', 'Grab 2-3 for a snack'], nutrition: { calories: 280, fiber: '4g', protein: '8g', carbs: '32g', fat: '14g' }, healthScore: 84 },
]

// Utility functions
const getWeekStart = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

// Use local date formatting to avoid timezone issues
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDisplayDate = (dateStr: string): string => {
  // Parse the date string to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Get today's date string in local timezone
const getTodayString = (): string => {
  const today = new Date()
  return formatDate(today)
}

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

const formatTime = (date: Date): string => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

const calculateBMI = (heightCm: number, weightKg: number): number => {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

const calculateCalories = (bmi: number, weightKg: number): number => {
  // Basic calculation - can be refined
  if (bmi < 18.5) return Math.round(weightKg * 35) // Underweight - higher intake
  if (bmi < 25) return Math.round(weightKg * 30) // Normal
  if (bmi < 30) return Math.round(weightKg * 25) // Overweight - moderate deficit
  return Math.round(weightKg * 22) // Obese - larger deficit
}

const getBMICategory = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' }
  if (bmi < 25) return { label: 'Normal', color: 'text-green-600' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' }
  return { label: 'Obese', color: 'text-red-600' }
}

const canGenerateNextWeek = (): boolean => {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 6 || dayOfWeek === 0 // Saturday or Sunday
}

const generateCalendarUrl = (meal: Meal, dateStr: string): string => {
  const startDate = new Date(dateStr)
  const [hours, minutes] = meal.time.split(':')
  startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  const endDate = new Date(startDate)
  endDate.setMinutes(endDate.getMinutes() + meal.duration)
  const formatDateTime = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const title = encodeURIComponent(`🍽️ ${meal.name}`)
  const details = encodeURIComponent(`${meal.cuisine} Cuisine\n\nBenefits: ${meal.benefits.join(', ')}\n\nIngredients:\n${meal.ingredients.join('\n')}\n\nInstructions:\n${meal.instructions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nNutrition: ${meal.nutrition.calories} cal | Protein: ${meal.nutrition.protein} | Carbs: ${meal.nutrition.carbs} | Fat: ${meal.nutrition.fat}`)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDateTime(startDate)}/${formatDateTime(endDate)}&details=${details}`
}

const getBenefitColor = (benefit: string) => {
  if (benefit.includes('LDL') || benefit.includes('cholesterol')) return 'bg-red-100 text-red-700'
  if (benefit.includes('HDL') || benefit.includes('Heart')) return 'bg-pink-100 text-pink-700'
  if (benefit.includes('Liver') || benefit.includes('detox')) return 'bg-amber-100 text-amber-700'
  if (benefit.includes('Omega')) return 'bg-blue-100 text-blue-700'
  if (benefit.includes('Protein')) return 'bg-purple-100 text-purple-700'
  if (benefit.includes('Fiber')) return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-700'
}

const getFilteredMeals = (profile: UserProfile, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', excludeIds: string[] = []): Meal[] => {
  return RECIPE_DATABASE.filter(meal => {
    if (meal.mealType !== mealType) return false
    if (excludeIds.includes(meal.id)) return false
    if (profile.cuisine_preferences.length > 0 && !profile.cuisine_preferences.includes(meal.cuisine)) return false
    // Check for dislikes in ingredients
    const mealText = (meal.name + ' ' + meal.ingredients.join(' ')).toLowerCase()
    if (profile.dislikes.some(d => mealText.includes(d.toLowerCase()))) return false
    return true
  })
}

const scoreMeal = (meal: Meal, profile: UserProfile): number => {
  let score = meal.healthScore
  // Boost meals that address health concerns
  if (profile.health_data.alt > 45 && meal.benefits.some(b => b.includes('Liver'))) score += 15
  if (profile.health_data.ldl > 100 && meal.benefits.some(b => b.includes('LDL') || b.includes('Fiber'))) score += 12
  if (profile.health_data.hdl < 60 && meal.benefits.some(b => b.includes('HDL') || b.includes('Omega'))) score += 12
  return score
}

// Default profile
const defaultProfile: UserProfile = {
  // Identity
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  phone: '',
  // Physical
  height_cm: 170,
  weight_kg: 70,
  bmi: 24.2,
  daily_calories: 2000,
  // Preferences
  meals_per_day: 3,
  meal_types: ['breakfast', 'lunch', 'dinner'],
  cuisine_preferences: [],
  dietary_restrictions: [],
  dislikes: [],
  // Health
  health_data: { alt: 81, ast: 42, ldl: 188, hdl: 50 },
  onboarding_completed: false
}

// Generate username from name
const generateUsername = (firstName: string, lastName: string): string => {
  const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '')
  const random = Math.floor(Math.random() * 1000)
  return `${base}${random}`
}

// Validate phone number (basic format)
const isValidPhone = (phone: string): boolean => {
  if (!phone) return true // Optional field
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15
}

// Sanitize input (prevent XSS)
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>\"\'&]/g, '').trim().slice(0, 100)
}

// Auth Component
function AuthScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleGoogleSignIn = async () => {
    if (!supabase) return
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setMessage(error.message)
    else setMessage('Check your email for the login link!')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-white to-rose-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🥗 Smart Meal Planner</h1>
          <p className="text-gray-600">Personalized nutrition based on your health</p>
        </div>

        <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all mb-4">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">or</span></div>
        </div>

        <form onSubmit={handleMagicLink}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-amber-500 outline-none" />
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            Send Magic Link
          </button>
        </form>

        {message && <p className={`mt-4 text-sm text-center ${message.includes('Check') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
        <p className="text-xs text-gray-400 text-center mt-6">Version 4.0 • Fully Personalized</p>
      </div>
    </div>
  )
}

// Onboarding Component
function OnboardingFlow({ onComplete, userEmail }: { onComplete: (profile: UserProfile) => void; userEmail: string }) {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<UserProfile>({ ...defaultProfile, email: userEmail })
  const [heightFeet, setHeightFeet] = useState(5)
  const [heightInches, setHeightInches] = useState(7)
  const [weightLbs, setWeightLbs] = useState(154)
  const [nameError, setNameError] = useState('')

  const totalSteps = 6

  const updateBMI = () => {
    const heightCm = Math.round((heightFeet * 12 + heightInches) * 2.54)
    const weightKg = Math.round(weightLbs * 0.453592)
    const bmi = calculateBMI(heightCm, weightKg)
    const calories = calculateCalories(bmi, weightKg)
    setProfile(p => ({ ...p, height_cm: heightCm, weight_kg: weightKg, bmi, daily_calories: calories }))
  }

  useEffect(() => { updateBMI() }, [heightFeet, heightInches, weightLbs])

  // Auto-generate username when name changes
  useEffect(() => {
    if (profile.first_name && !profile.username) {
      setProfile(p => ({ ...p, username: generateUsername(p.first_name, p.last_name) }))
    }
  }, [profile.first_name, profile.last_name])

  const cuisines = ['Mediterranean', 'Asian', 'Mexican', 'American', 'Indian']
  const restrictions = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free', 'Low-sodium']
  const commonDislikes = ['Seafood', 'Mushrooms', 'Cilantro', 'Spicy food', 'Onions', 'Tomatoes', 'Eggs', 'Avocado']

  const bmiInfo = getBMICategory(profile.bmi)

  const validateStep1 = (): boolean => {
    if (!profile.first_name.trim()) {
      setNameError('Please enter your first name')
      return false
    }
    setNameError('')
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step < totalSteps) setStep(s => s + 1)
    else onComplete({ ...profile, onboarding_completed: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-white to-rose-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>

        {/* Step 1: Name & Identity */}
        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Welcome! What's your name?</h2>
              <p className="text-gray-600 text-sm mt-1">We'll use this to personalize your experience</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  value={profile.first_name}
                  onChange={(e) => setProfile(p => ({ ...p, first_name: sanitizeInput(e.target.value) }))}
                  placeholder="Sarah"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none ${nameError ? 'border-red-300' : 'border-gray-200'}`}
                  autoFocus
                />
                {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-gray-400">(optional)</span></label>
                <input
                  type="text"
                  value={profile.last_name}
                  onChange={(e) => setProfile(p => ({ ...p, last_name: sanitizeInput(e.target.value) }))}
                  placeholder="Johnson"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AtSign className="w-4 h-4" />
                  <span>Your username: <span className="font-medium text-gray-800">@{profile.username || 'username'}</span></span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Auto-generated • Editable in settings</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Mail className="w-4 h-4" />
                  <span>{userEmail}</span>
                </div>
                <p className="text-xs text-blue-500 mt-1">From your sign-in</p>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Height & Weight */}
        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Nice to meet you, {profile.first_name}!</h2>
              <p className="text-gray-600 text-sm mt-1">Enter your measurements to calculate your daily needs</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <select value={heightFeet} onChange={e => setHeightFeet(parseInt(e.target.value))} className="w-full px-4 py-3 border border-gray-200 rounded-xl">
                      {[4, 5, 6, 7].map(f => <option key={f} value={f}>{f} ft</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select value={heightInches} onChange={e => setHeightInches(parseInt(e.target.value))} className="w-full px-4 py-3 border border-gray-200 rounded-xl">
                      {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i} in</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
                <input type="number" value={weightLbs} onChange={e => setWeightLbs(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Your BMI</span>
                  <span className={`font-bold ${bmiInfo.color}`}>{profile.bmi} - {bmiInfo.label}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Suggested daily calories</span>
                  <span className="font-bold text-amber-600">{profile.daily_calories} cal</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Meals per day */}
        {step === 3 && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">How many meals do you eat?</h2>
              <p className="text-gray-600 text-sm mt-1">This helps us plan your daily nutrition</p>
            </div>

            <div className="space-y-3">
              {[
                { value: 3, label: '3 meals', desc: 'Breakfast, Lunch, Dinner' },
                { value: 4, label: '4 meals', desc: '+ Morning or Afternoon snack' },
                { value: 5, label: '5 meals', desc: '+ Morning & Afternoon snacks' },
                { value: 6, label: '6 meals', desc: '+ Multiple snacks throughout' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    const types = ['breakfast', 'lunch', 'dinner']
                    if (opt.value >= 4) types.push('morning_snack')
                    if (opt.value >= 5) types.push('afternoon_snack')
                    if (opt.value >= 6) types.push('evening_snack')
                    setProfile(p => ({ ...p, meals_per_day: opt.value, meal_types: types }))
                  }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${profile.meals_per_day === opt.value ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="font-semibold text-gray-800">{opt.label}</div>
                  <div className="text-sm text-gray-500">{opt.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 4: Cuisine preferences */}
        {step === 4 && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">What cuisines do you enjoy?</h2>
              <p className="text-gray-600 text-sm mt-1">Select all that apply (or skip for variety)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {cuisines.map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => {
                    setProfile(p => ({
                      ...p,
                      cuisine_preferences: p.cuisine_preferences.includes(cuisine)
                        ? p.cuisine_preferences.filter(c => c !== cuisine)
                        : [...p.cuisine_preferences, cuisine]
                    }))
                  }}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${profile.cuisine_preferences.includes(cuisine) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="text-2xl mb-1">
                    {cuisine === 'Mediterranean' && '🫒'}
                    {cuisine === 'Asian' && '🥢'}
                    {cuisine === 'Mexican' && '🌮'}
                    {cuisine === 'American' && '🍔'}
                    {cuisine === 'Indian' && '🍛'}
                  </div>
                  <div className="font-medium text-gray-800 text-sm">{cuisine}</div>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              {profile.cuisine_preferences.length === 0 ? 'No preference = variety from all cuisines!' : `Selected: ${profile.cuisine_preferences.length}`}
            </p>
          </>
        )}

        {/* Step 5: Dietary restrictions */}
        {step === 5 && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Any dietary restrictions?</h2>
              <p className="text-gray-600 text-sm mt-1">We'll make sure to accommodate these</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {restrictions.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setProfile(p => ({
                      ...p,
                      dietary_restrictions: p.dietary_restrictions.includes(r)
                        ? p.dietary_restrictions.filter(x => x !== r)
                        : [...p.dietary_restrictions, r]
                    }))
                  }}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${profile.dietary_restrictions.includes(r) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Foods you dislike</label>
              <div className="flex flex-wrap gap-2">
                {commonDislikes.map(d => (
                  <button
                    key={d}
                    onClick={() => {
                      setProfile(p => ({
                        ...p,
                        dislikes: p.dislikes.includes(d) ? p.dislikes.filter(x => x !== d) : [...p.dislikes, d]
                      }))
                    }}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${profile.dislikes.includes(d) ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}
                  >
                    {profile.dislikes.includes(d) ? '✗ ' : ''}{d}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 6: Health data */}
        {step === 6 && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Your health markers</h2>
              <p className="text-gray-600 text-sm mt-1">We'll prioritize recipes that support your health</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">ALT (U/L)</label>
                  <input type="number" value={profile.health_data.alt} onChange={e => setProfile(p => ({ ...p, health_data: { ...p.health_data, alt: parseInt(e.target.value) || 0 } }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">AST (U/L)</label>
                  <input type="number" value={profile.health_data.ast} onChange={e => setProfile(p => ({ ...p, health_data: { ...p.health_data, ast: parseInt(e.target.value) || 0 } }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">LDL (mg/dL)</label>
                  <input type="number" value={profile.health_data.ldl} onChange={e => setProfile(p => ({ ...p, health_data: { ...p.health_data, ldl: parseInt(e.target.value) || 0 } }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">HDL (mg/dL)</label>
                  <input type="number" value={profile.health_data.hdl} onChange={e => setProfile(p => ({ ...p, health_data: { ...p.health_data, hdl: parseInt(e.target.value) || 0 } }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 text-sm">
                <p className="font-medium text-amber-800 mb-2">Based on your markers, we'll focus on:</p>
                <ul className="space-y-1 text-amber-700">
                  {profile.health_data.alt > 45 && <li>• Liver-supporting foods (beets, leafy greens, citrus)</li>}
                  {profile.health_data.ldl > 100 && <li>• LDL-lowering foods (oats, beans, fatty fish)</li>}
                  {profile.health_data.hdl < 60 && <li>• HDL-boosting foods (olive oil, nuts, avocado)</li>}
                  {profile.health_data.alt <= 45 && profile.health_data.ldl <= 100 && profile.health_data.hdl >= 60 && <li>• Great markers! We'll focus on maintaining your health.</li>}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600">
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium"
          >
            {step === totalSteps ? 'Start Planning' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main App Component
export default function MealPlannerApp() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [currentWeekPlan, setCurrentWeekPlan] = useState<WeekPlan | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)
  const [showAddMealFlow, setShowAddMealFlow] = useState(false)
  const [addMealStep, setAddMealStep] = useState<'mood' | 'recommendation' | 'confirmed'>('mood')
  const [moodData, setMoodData] = useState<MoodData>({ energy: 'medium', mood: 'neutral', craving: '', timeOfDay: getTimeOfDay() })
  const [recommendedMeal, setRecommendedMeal] = useState<Meal | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWeekReview, setShowWeekReview] = useState(false)
  const [showGenerateWeek, setShowGenerateWeek] = useState(false)
  const [todayCalories, setTodayCalories] = useState(0)
  const [dislikedMealIds, setDislikedMealIds] = useState<string[]>([])
  const [favoriteMealIds, setFavoriteMealIds] = useState<string[]>([])

  // Auth check
  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const initAuth = async () => {
      if (code) { await supabase.auth.exchangeCodeForSession(code); window.history.replaceState({}, '', '/') }
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) await loadProfile(session.user.id)
      setLoading(false)
    }
    initAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null) })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    if (!supabase) return
    const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).single()
    if (data && data.onboarding_completed) setProfile(data as UserProfile)
  }

  const saveProfile = async (newProfile: UserProfile) => {
    if (!supabase || !user) return
    await supabase.from('user_profiles').upsert({ id: user.id, ...newProfile })
    setProfile(newProfile)
  }

  // Load week plan
  useEffect(() => {
    if (!user || !profile.onboarding_completed) return
    loadWeekPlan()
  }, [user, profile.onboarding_completed, weekOffset])

  const loadWeekPlan = async () => {
    if (!supabase || !user) return
    const today = new Date()
    const weekStart = getWeekStart(today)
    weekStart.setDate(weekStart.getDate() + (weekOffset * 7))
    const weekStartStr = formatDate(weekStart)
    const todayStr = getTodayString()

    const { data } = await supabase.from('meal_plans').select('*').eq('user_id', user.id).eq('week_start', weekStartStr).single()
    if (data) {
      // Dynamically update isToday for each day based on current date
      const updatedDays = data.meals.map((day: DayPlan) => ({
        ...day,
        isToday: day.date === todayStr
      }))
      
      setCurrentWeekPlan({ 
        weekStart: data.week_start, 
        days: updatedDays, 
        reviewed: data.reviewed || false, 
        favoriteIds: data.favorite_ids || [] 
      })
      
      // Set selected day to today if this week
      if (weekOffset === 0) {
        const todayIdx = updatedDays.findIndex((d: DayPlan) => d.isToday)
        if (todayIdx >= 0) setSelectedDayIndex(todayIdx)
      }
    } else {
      setCurrentWeekPlan(null)
    }
  }

  const generateWeekPlan = async (repeatIds: string[] = [], forCurrentWeek: boolean = false) => {
    if (!user || !supabase) return
    const today = new Date()
    const weekStart = getWeekStart(today)
    
    // If forCurrentWeek, generate for this week; otherwise next week
    if (!forCurrentWeek) {
      weekStart.setDate(weekStart.getDate() + 7)
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const todayStr = getTodayString()
    
    // Track used IDs separately for main meals (no repeats) and snacks (can repeat after a few days)
    const usedMainIds: string[] = [...dislikedMealIds]
    const days: DayPlan[] = []
    
    // Calculate target calories per meal type
    const mainMealsCount = profile.meal_types.filter(t => !t.includes('snack')).length
    const snackCount = profile.meal_types.filter(t => t.includes('snack')).length
    // Main meals get ~30% each (breakfast slightly less, dinner slightly more)
    const breakfastTarget = Math.round(profile.daily_calories * 0.25)
    const lunchTarget = Math.round(profile.daily_calories * 0.30)
    const dinnerTarget = Math.round(profile.daily_calories * 0.30)
    const snackTarget = snackCount > 0 ? Math.round((profile.daily_calories * 0.15) / snackCount) : 0

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = formatDate(date)
      const dayMeals: Meal[] = []
      const dayUsedSnackIds: string[] = [] // Only track snacks within the same day
      let dayCaloriesSoFar = 0

      // Get meals for each meal type
      for (const mealType of profile.meal_types) {
        const isSnack = mealType.includes('snack')
        const type = isSnack ? 'snack' : mealType as 'breakfast' | 'lunch' | 'dinner'
        const time = mealType === 'breakfast' ? '08:00' : mealType === 'lunch' ? '13:00' : mealType === 'dinner' ? '19:00' : mealType === 'morning_snack' ? '10:30' : mealType === 'afternoon_snack' ? '15:30' : '20:00'
        
        // Calculate target for this meal
        let targetCalories = snackTarget
        if (mealType === 'breakfast') targetCalories = breakfastTarget
        else if (mealType === 'lunch') targetCalories = lunchTarget
        else if (mealType === 'dinner') targetCalories = dinnerTarget
        
        // For the last meal of the day, try to hit the daily target
        const isLastMeal = profile.meal_types.indexOf(mealType) === profile.meal_types.length - 1
        if (isLastMeal) {
          targetCalories = Math.max(targetCalories, profile.daily_calories - dayCaloriesSoFar)
        }
        
        // Try to use repeat meals first
        let selectedMeal: Meal | undefined
        const excludeIds = isSnack ? dayUsedSnackIds : usedMainIds
        
        if (repeatIds.length > 0) {
          const repeatMeals = RECIPE_DATABASE.filter(m => repeatIds.includes(m.id) && m.mealType === type && !excludeIds.includes(m.id))
          if (repeatMeals.length > 0) {
            selectedMeal = repeatMeals[Math.floor(Math.random() * repeatMeals.length)]
          }
        }
        
        if (!selectedMeal) {
          const available = getFilteredMeals(profile, type, excludeIds)
          // Score meals by health AND calorie proximity
          const scored = available.map(m => {
            let score = scoreMeal(m, profile)
            // Bonus for being close to calorie target (max 20 points)
            const calorieDiff = Math.abs(m.nutrition.calories - targetCalories)
            const calorieBonus = Math.max(0, 20 - Math.floor(calorieDiff / 25))
            score += calorieBonus
            // Prefer slightly higher calorie options if under target
            if (dayCaloriesSoFar < profile.daily_calories * 0.7 && m.nutrition.calories >= targetCalories) {
              score += 5
            }
            return { ...m, healthScore: score }
          }).sort((a, b) => b.healthScore - a.healthScore)
          
          // Pick from top 3 for variety (narrower to stay closer to calorie targets)
          const topMeals = scored.slice(0, Math.min(3, scored.length))
          if (topMeals.length > 0) {
            selectedMeal = topMeals[Math.floor(Math.random() * topMeals.length)]
          }
        }
        
        if (selectedMeal) {
          dayMeals.push({ ...selectedMeal, time })
          dayCaloriesSoFar += selectedMeal.nutrition.calories
          if (isSnack) {
            dayUsedSnackIds.push(selectedMeal.id)
          } else {
            usedMainIds.push(selectedMeal.id)
          }
        }
      }

      days.push({
        date: dateStr,
        dayName: dayNames[date.getDay()],
        meals: dayMeals,
        totalCalories: dayMeals.reduce((sum, m) => sum + m.nutrition.calories, 0),
        isToday: dateStr === todayStr
      })
    }

    // POST-PROCESSING: Scale portions to hit calorie target
    const scaledDays = days.map(day => {
      const currentCals = day.totalCalories
      const targetCals = profile.daily_calories
      
      // If within 5% of target, don't scale
      if (Math.abs(currentCals - targetCals) / targetCals < 0.05) {
        return day
      }
      
      // Calculate scaling factor (cap between 0.85 and 1.25 for realistic portions)
      const scaleFactor = Math.min(1.25, Math.max(0.85, targetCals / currentCals))
      
      // Scale each meal's calories
      const scaledMeals = day.meals.map(meal => ({
        ...meal,
        nutrition: {
          ...meal.nutrition,
          calories: Math.round(meal.nutrition.calories * scaleFactor)
        },
        portionScale: scaleFactor // Store for UI display if needed
      }))
      
      return {
        ...day,
        meals: scaledMeals,
        totalCalories: scaledMeals.reduce((sum, m) => sum + m.nutrition.calories, 0)
      }
    })

    const newPlan: WeekPlan = { weekStart: formatDate(weekStart), days: scaledDays, reviewed: false, favoriteIds: [] }
    
    await supabase.from('meal_plans').upsert({
      user_id: user.id,
      week_start: newPlan.weekStart,
      meals: newPlan.days,
      total_calories: newPlan.days.reduce((sum, d) => sum + d.totalCalories, 0),
      reviewed: false,
      favorite_ids: []
    })

    if (forCurrentWeek) {
      setCurrentWeekPlan(newPlan)
      // Find today's index
      const todayIdx = newPlan.days.findIndex(d => d.isToday)
      if (todayIdx >= 0) setSelectedDayIndex(todayIdx)
    } else {
      setWeekOffset(weekOffset + 1)
    }
    setShowGenerateWeek(false)
  }

  const swapMeal = async (dayIndex: number, mealIndex: number) => {
    if (!currentWeekPlan || !supabase || !user) return
    
    const currentMeal = currentWeekPlan.days[dayIndex].meals[mealIndex]
    setDislikedMealIds(prev => [...prev, currentMeal.id])
    
    const usedIds = currentWeekPlan.days.flatMap(d => d.meals.map(m => m.id))
    usedIds.push(currentMeal.id)
    
    const available = getFilteredMeals(profile, currentMeal.mealType, usedIds)
    const scored = available.map(m => ({ ...m, healthScore: scoreMeal(m, profile) })).sort((a, b) => b.healthScore - a.healthScore)
    
    if (scored.length === 0) return
    
    const newMeal = { ...scored[0], time: currentMeal.time }
    const updatedDays = [...currentWeekPlan.days]
    updatedDays[dayIndex].meals[mealIndex] = newMeal
    updatedDays[dayIndex].totalCalories = updatedDays[dayIndex].meals.reduce((sum, m) => sum + m.nutrition.calories, 0)
    
    setCurrentWeekPlan({ ...currentWeekPlan, days: updatedDays })
    
    await supabase.from('meal_plans').upsert({
      user_id: user.id,
      week_start: currentWeekPlan.weekStart,
      meals: updatedDays,
      total_calories: updatedDays.reduce((sum, d) => sum + d.totalCalories, 0)
    })
  }

  const toggleFavorite = async (mealId: string) => {
    if (!currentWeekPlan) return
    const newFavorites = currentWeekPlan.favoriteIds.includes(mealId)
      ? currentWeekPlan.favoriteIds.filter(id => id !== mealId)
      : [...currentWeekPlan.favoriteIds, mealId]
    
    setCurrentWeekPlan({ ...currentWeekPlan, favoriteIds: newFavorites })
    setFavoriteMealIds(newFavorites)
    
    if (supabase && user) {
      await supabase.from('meal_plans').update({ favorite_ids: newFavorites }).eq('user_id', user.id).eq('week_start', currentWeekPlan.weekStart)
    }
  }

  const handleSignOut = async () => { if (supabase) await supabase.auth.signOut() }

  const startAddMealFlow = () => {
    setMoodData(prev => ({ ...prev, timeOfDay: getTimeOfDay(), craving: '' }))
    setAddMealStep('mood')
    setRecommendedMeal(null)
    setShowAddMealFlow(true)
  }

  const generateRecommendation = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const currentMeals = selectedDay?.meals || []
      const type = moodData.timeOfDay === 'morning' ? 'breakfast' : moodData.timeOfDay === 'afternoon' ? 'lunch' : moodData.timeOfDay === 'evening' ? 'dinner' : 'snack'
      const usedIds = currentMeals.map(m => m.id)
      const available = getFilteredMeals(profile, type, usedIds)
      const scored = available.map(m => {
        let score = scoreMeal(m, profile)
        if (moodData.mood === 'stressed' && m.benefits.some(b => b.includes('Omega'))) score += 10
        if (moodData.energy === 'low' && m.benefits.some(b => b.includes('Protein'))) score += 8
        return { ...m, healthScore: score }
      }).sort((a, b) => b.healthScore - a.healthScore)
      
      const recommendation = scored[0] || RECIPE_DATABASE[0]
      recommendation.time = formatTime(new Date())
      setRecommendedMeal(recommendation)
      setAddMealStep('recommendation')
      setIsGenerating(false)
    }, 1500)
  }

  const confirmMeal = async () => {
    if (!recommendedMeal || !currentWeekPlan || !supabase || !user) return
    const mealWithFlag = { ...recommendedMeal, addedManually: true }
    const updatedDays = [...currentWeekPlan.days]
    updatedDays[selectedDayIndex].meals.push(mealWithFlag)
    updatedDays[selectedDayIndex].totalCalories += recommendedMeal.nutrition.calories
    setCurrentWeekPlan({ ...currentWeekPlan, days: updatedDays })
    if (selectedDay?.isToday) setTodayCalories(prev => prev + recommendedMeal.nutrition.calories)
    await supabase.from('meal_plans').upsert({ user_id: user.id, week_start: currentWeekPlan.weekStart, meals: updatedDays, total_calories: updatedDays.reduce((sum, d) => sum + d.totalCalories, 0) })
    setAddMealStep('confirmed')
  }

  const deleteMeal = async (mealIndex: number) => {
    if (!currentWeekPlan || !supabase || !user) return
    const meal = selectedDay?.meals[mealIndex]
    if (!meal) return
    const updatedDays = [...currentWeekPlan.days]
    updatedDays[selectedDayIndex].meals = updatedDays[selectedDayIndex].meals.filter((_, i) => i !== mealIndex)
    updatedDays[selectedDayIndex].totalCalories -= meal.nutrition.calories
    setCurrentWeekPlan({ ...currentWeekPlan, days: updatedDays })
    if (selectedDay?.isToday) setTodayCalories(prev => prev - meal.nutrition.calories)
    await supabase.from('meal_plans').upsert({ user_id: user.id, week_start: currentWeekPlan.weekStart, meals: updatedDays, total_calories: updatedDays.reduce((sum, d) => sum + d.totalCalories, 0) })
  }

  const addAllToCalendar = () => {
    if (!selectedDay) return
    selectedDay.meals.forEach((meal, i) => { setTimeout(() => window.open(generateCalendarUrl(meal, selectedDay.date), '_blank'), i * 800) })
  }

  const selectedDay = currentWeekPlan?.days[selectedDayIndex]
  const isCurrentWeek = weekOffset === 0

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
  if (!user) return <AuthScreen />
  if (!profile.onboarding_completed) return <OnboardingFlow onComplete={saveProfile} userEmail={user.email || ''} />

  // No plan yet - show generate screen
  if (!currentWeekPlan && weekOffset === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-white to-rose-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to plan your week?</h2>
          <p className="text-gray-600 mb-6">Generate your personalized meal plan based on your preferences and health goals.</p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="font-medium text-gray-800 mb-2">Your plan will include:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {profile.meals_per_day} meals per day</li>
              <li>• {profile.daily_calories} calories daily target</li>
              <li>• {profile.cuisine_preferences.length > 0 ? profile.cuisine_preferences.join(', ') : 'All cuisines'}</li>
              <li>• Focus on {profile.health_data.ldl > 100 ? 'lowering LDL, ' : ''}{profile.health_data.hdl < 60 ? 'raising HDL, ' : ''}{profile.health_data.alt > 45 ? 'liver support' : 'maintaining health'}</li>
            </ul>
          </div>

          <button
            onClick={() => generateWeekPlan([], true)}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate My Week
          </button>
          
          <button onClick={handleSignOut} className="mt-4 text-sm text-gray-500">Sign out</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {profile.first_name ? `Hi ${profile.first_name}! 👋` : '🥗 Meal Planner'}
            </h1>
            <p className="text-sm text-gray-500">{profile.daily_calories} cal/day • {profile.meals_per_day} meals</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl bg-white border shadow-sm"><Settings className="w-5 h-5 text-gray-600" /></button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setWeekOffset(prev => prev - 1)} disabled={weekOffset <= -4} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
            <div className="text-center">
              <p className="font-semibold text-gray-800">{isCurrentWeek ? 'This Week' : weekOffset > 0 ? 'Next Week' : `${Math.abs(weekOffset)} Week${Math.abs(weekOffset) > 1 ? 's' : ''} Ago`}</p>
              {currentWeekPlan && <p className="text-sm text-gray-500">{formatDisplayDate(currentWeekPlan.days[0].date)} - {formatDisplayDate(currentWeekPlan.days[6].date)}</p>}
            </div>
            <button 
              onClick={() => {
                if (!canGenerateNextWeek() && weekOffset === 0) {
                  alert('You can generate next week\'s plan starting Saturday!')
                } else if (weekOffset === 0) {
                  setShowGenerateWeek(true)
                } else {
                  setWeekOffset(prev => prev + 1)
                }
              }} 
              disabled={weekOffset >= 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {isCurrentWeek && canGenerateNextWeek() && (
            <button
              onClick={() => setShowGenerateWeek(true)}
              className="w-full mt-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Plan Next Week
            </button>
          )}
        </div>

        {currentWeekPlan ? (
          <>
            {/* Today's Progress */}
            {isCurrentWeek && selectedDay?.isToday && (
              <div className="bg-white rounded-xl p-4 shadow-sm border mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Target className="w-5 h-5 text-amber-500" /><span className="font-medium text-gray-700">Today's Progress</span></div>
                  <span className="text-sm text-gray-500">{selectedDay.totalCalories} / {profile.daily_calories} cal</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${selectedDay.totalCalories > profile.daily_calories ? 'bg-red-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} style={{ width: `${Math.min((selectedDay.totalCalories / profile.daily_calories) * 100, 100)}%` }} />
                </div>
              </div>
            )}

            {/* Health Focus */}
            <div className="bg-white rounded-xl p-4 shadow-sm border mb-4">
              <div className="flex items-center gap-2 mb-2"><Heart className="w-5 h-5 text-rose-500" /><span className="font-medium text-gray-700">Your Health Focus</span></div>
              <div className="flex flex-wrap gap-2">
                {profile.health_data.alt > 45 && <span className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full">🔶 Liver (ALT: {profile.health_data.alt})</span>}
                {profile.health_data.ldl > 100 && <span className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-full">❤️ LDL: {profile.health_data.ldl}</span>}
                {profile.health_data.hdl < 60 && <span className="text-xs px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full">💗 HDL: {profile.health_data.hdl}</span>}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={startAddMealFlow} className="flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl shadow-md"><Plus className="w-5 h-5" /><span className="font-medium">Add Meal</span></button>
              <button onClick={addAllToCalendar} className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl shadow-sm border"><CalendarPlus className="w-5 h-5 text-blue-500" /><span className="font-medium text-gray-700">Sync Day</span></button>
            </div>

            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
              {currentWeekPlan.days.map((day, index) => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDayIndex(index)}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl font-medium whitespace-nowrap flex-shrink-0 min-w-[65px] ${selectedDayIndex === index ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : day.isToday ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                  <span className="text-xs opacity-80">{formatDisplayDate(day.date)}</span>
                  <span className="text-sm">{day.dayName.slice(0, 3)}</span>
                  {day.isToday && <span className="text-xs">Today</span>}
                </button>
              ))}
            </div>

            {/* Day Summary */}
            {selectedDay && (
              <div className="flex items-center justify-between mb-4 px-1">
                <div><h2 className="font-semibold text-gray-800">{selectedDay.dayName}</h2><p className="text-sm text-gray-500">{selectedDay.meals.length} meals • {selectedDay.totalCalories} cal</p></div>
              </div>
            )}

            {/* Meals List */}
            <div className="space-y-3">
              {selectedDay?.meals.map((meal, mealIndex) => {
                const isExpanded = expandedMeal === `${selectedDay.date}-${mealIndex}`
                const isFavorite = currentWeekPlan.favoriteIds.includes(meal.id)
                return (
                  <div key={`${meal.id}-${mealIndex}`} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${meal.addedManually ? 'border-green-200' : ''}`}>
                    <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedMeal(isExpanded ? null : `${selectedDay.date}-${mealIndex}`)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {meal.time}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{meal.cuisine}</span>
                            {isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <h3 className="font-semibold text-gray-800">{meal.name}</h3>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {meal.benefits.slice(0, 2).map((benefit, i) => <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${getBenefitColor(benefit)}`}>{benefit}</span>)}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{meal.nutrition.calories} cal</span>
                            {meal.portionScale && meal.portionScale !== 1 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                {meal.portionScale > 1 ? `+${Math.round((meal.portionScale - 1) * 100)}%` : `${Math.round((meal.portionScale - 1) * 100)}%`} portion
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(meal.id) }}
                            className={`p-1.5 rounded-lg ${isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                          >
                            <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); swapMeal(selectedDayIndex, mealIndex) }}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                            title="Not for me"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2"><Utensils className="w-4 h-4" /> Ingredients</h4>
                            <ul className="space-y-1">{meal.ingredients.map((ing, i) => <li key={i} className="text-sm text-gray-600">• {ing}</li>)}</ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Instructions</h4>
                            <ol className="space-y-2">{meal.instructions.map((inst, i) => <li key={i} className="text-sm text-gray-600"><span className="font-medium text-amber-600">{i + 1}.</span> {inst}</li>)}</ol>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-4">
                              <div className="text-center"><p className="text-lg font-bold text-gray-800">{meal.nutrition.calories}</p><p className="text-xs text-gray-500">cal</p></div>
                              <div className="text-center"><p className="text-lg font-bold text-purple-600">{meal.nutrition.protein}</p><p className="text-xs text-gray-500">protein</p></div>
                              <div className="text-center"><p className="text-lg font-bold text-blue-600">{meal.nutrition.carbs}</p><p className="text-xs text-gray-500">carbs</p></div>
                              <div className="text-center"><p className="text-lg font-bold text-orange-600">{meal.nutrition.fat}</p><p className="text-xs text-gray-500">fat</p></div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); window.open(generateCalendarUrl(meal, selectedDay.date), '_blank') }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><CalendarPlus className="w-5 h-5" /></button>
                              <button onClick={() => deleteMeal(mealIndex)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No plan for this week. Navigate to a week with a plan.</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">Version 4.0 • Fully Personalized</p>
      </div>

      {/* Add Meal Modal */}
      {showAddMealFlow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{addMealStep === 'mood' ? '🍽️ Add a Meal' : addMealStep === 'recommendation' ? '✨ Perfect Match' : '🎉 Meal Added!'}</h2>
              <button onClick={() => setShowAddMealFlow(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            {addMealStep === 'mood' && (
              <>
                <p className="text-gray-600 mb-4">How are you feeling? I'll find the perfect meal.</p>
                <div className="mb-4 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                  {moodData.timeOfDay === 'morning' && <Sun className="w-5 h-5 text-amber-500" />}
                  {moodData.timeOfDay === 'afternoon' && <Coffee className="w-5 h-5 text-orange-500" />}
                  {moodData.timeOfDay === 'evening' && <Moon className="w-5 h-5 text-indigo-500" />}
                  {moodData.timeOfDay === 'night' && <Moon className="w-5 h-5 text-gray-500" />}
                  <span className="text-sm text-gray-700 capitalize">{moodData.timeOfDay} • {formatTime(new Date())}</span>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map(level => (
                      <button key={level} onClick={() => setMoodData(prev => ({ ...prev, energy: level }))} className={`flex-1 py-3 rounded-xl font-medium ${moodData.energy === level ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {level === 'low' ? '😴' : level === 'medium' ? '😊' : '⚡'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                  <div className="flex gap-2">
                    {(['stressed', 'neutral', 'happy'] as const).map(m => (
                      <button key={m} onClick={() => setMoodData(prev => ({ ...prev, mood: m }))} className={`flex-1 py-3 rounded-xl font-medium ${moodData.mood === m ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {m === 'stressed' ? <Frown className="w-5 h-5 mx-auto" /> : m === 'neutral' ? <Meh className="w-5 h-5 mx-auto" /> : <Smile className="w-5 h-5 mx-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Any cravings?</label>
                  <input type="text" value={moodData.craving} onChange={(e) => setMoodData(prev => ({ ...prev, craving: e.target.value }))} placeholder="e.g., something sweet, light..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <button onClick={generateRecommendation} disabled={isGenerating} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGenerating ? 'Finding...' : 'Get Recommendation'}
                </button>
              </>
            )}

            {addMealStep === 'recommendation' && recommendedMeal && (
              <>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-4 border border-amber-200">
                  <div className="flex items-start justify-between mb-2"><h3 className="font-bold text-lg text-gray-800">{recommendedMeal.name}</h3><span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{recommendedMeal.healthScore}% match</span></div>
                  <p className="text-sm text-gray-500 mb-2">{recommendedMeal.cuisine} Cuisine • {recommendedMeal.duration} min prep</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">{recommendedMeal.benefits.map((b, i) => <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${getBenefitColor(b)}`}>{b}</span>)}</div>
                  <div className="flex gap-4 text-sm text-gray-600"><span>🕐 {recommendedMeal.time}</span><span>🔥 {recommendedMeal.nutrition.calories} cal</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={generateRecommendation} disabled={isGenerating} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 flex items-center justify-center gap-2">{isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}Try Another</button>
                  <button onClick={confirmMeal} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"><ThumbsUp className="w-4 h-4" />Add This</button>
                </div>
              </>
            )}

            {addMealStep === 'confirmed' && recommendedMeal && (
              <>
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-green-600" /></div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{recommendedMeal.name}</h3>
                  <p className="text-gray-600 mb-4">Added to {selectedDay?.dayName} at {recommendedMeal.time}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowAddMealFlow(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600">Done</button>
                  <button onClick={() => { window.open(generateCalendarUrl(recommendedMeal, selectedDay?.date || ''), '_blank'); setShowAddMealFlow(false) }} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"><CalendarPlus className="w-4 h-4" />Calendar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Generate Week Modal */}
      {showGenerateWeek && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">📅 Plan Next Week</h2>
              <button onClick={() => setShowGenerateWeek(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            
            {currentWeekPlan && currentWeekPlan.favoriteIds.length > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="font-medium text-yellow-800 mb-2">⭐ Your favorites this week:</p>
                <div className="space-y-1">
                  {RECIPE_DATABASE.filter(m => currentWeekPlan.favoriteIds.includes(m.id)).slice(0, 3).map(m => (
                    <p key={m.id} className="text-sm text-yellow-700">• {m.name}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => generateWeekPlan(currentWeekPlan?.favoriteIds || [])}
                className="w-full p-4 border-2 border-green-200 bg-green-50 rounded-xl text-left hover:bg-green-100 transition-all"
              >
                <div className="font-semibold text-green-800 flex items-center gap-2"><Award className="w-5 h-5" /> Include my favorites</div>
                <p className="text-sm text-green-600 mt-1">Mix your starred meals with new recommendations</p>
              </button>
              
              <button
                onClick={() => generateWeekPlan()}
                className="w-full p-4 border-2 border-gray-200 rounded-xl text-left hover:bg-gray-50 transition-all"
              >
                <div className="font-semibold text-gray-800 flex items-center gap-2"><Sparkles className="w-5 h-5" /> Fresh start</div>
                <p className="text-sm text-gray-600 mt-1">All new meals based on your preferences</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">⚙️ Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {/* User Identity */}
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <UserCircle className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-medium text-purple-800">Your Profile</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-purple-600 mb-1">Name</p>
                    <p className="text-gray-800 font-medium">{profile.first_name} {profile.last_name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-purple-600 mb-1 block">Username</label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center bg-white border border-purple-200 rounded-lg px-3">
                        <AtSign className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={profile.username}
                          onChange={(e) => setProfile(p => ({ ...p, username: sanitizeInput(e.target.value).toLowerCase().replace(/\s/g, '') }))}
                          className="flex-1 py-2 px-2 text-sm outline-none"
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 mb-1">Email</p>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{profile.email}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Verified</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-purple-600 mb-1 block">Phone <span className="text-gray-400">(optional)</span></label>
                    <div className="flex items-center bg-white border border-purple-200 rounded-lg px-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value.replace(/[^\d\s\-\+\(\)]/g, '').slice(0, 20) }))}
                        className="flex-1 py-2 px-2 text-sm outline-none"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">For future SMS reminders</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Stats</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600">BMI: <span className="font-medium">{profile.bmi}</span></p>
                  <p className="text-gray-600">Calories: <span className="font-medium">{profile.daily_calories}/day</span></p>
                  <p className="text-gray-600">Meals: <span className="font-medium">{profile.meals_per_day}/day</span></p>
                  <p className="text-gray-600">Status: <span className={`font-medium ${getBMICategory(profile.bmi).color}`}>{getBMICategory(profile.bmi).label}</span></p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Cuisine preferences</p>
                <p className="text-gray-600 text-sm">{profile.cuisine_preferences.length > 0 ? profile.cuisine_preferences.join(', ') : 'All cuisines'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Dislikes</p>
                <p className="text-gray-600 text-sm">{profile.dislikes.length > 0 ? profile.dislikes.join(', ') : 'None set'}</p>
              </div>

              <button
                onClick={async () => { 
                  await saveProfile(profile)
                  generateWeekPlan([], true)
                  setShowSettings(false) 
                }}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Save & Regenerate Week
              </button>

              <button
                onClick={() => { setProfile({ ...profile, onboarding_completed: false }); setShowSettings(false) }}
                className="w-full py-3 border border-amber-500 text-amber-600 rounded-xl font-medium"
              >
                Edit All Preferences
              </button>

              <button
                onClick={handleSignOut}
                className="w-full py-3 border border-gray-200 text-gray-500 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
