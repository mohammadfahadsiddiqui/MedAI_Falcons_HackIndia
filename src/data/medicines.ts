import type { Medicine } from '../store/useCartStore';

export const medicines: Medicine[] = [
    // Pain Relief
    { id: 'm1', name: 'Paracetamol 500mg', brand: 'Calpol', category: 'Pain Relief', price: 28, mrp: 35, discount: 20, image: '💊', dosage: '500mg', description: 'Effective pain reliever and fever reducer. Suitable for headaches, body aches, and mild fever.', requiresPrescription: false, inStock: true, rating: 4.7, reviews: 2341, deliveryTime: '2-4 hrs' },
    { id: 'm2', name: 'Ibuprofen 400mg', brand: 'Brufen', category: 'Pain Relief', price: 45, mrp: 60, discount: 25, image: '💊', dosage: '400mg', description: 'Anti-inflammatory pain reliever for headaches, muscle pain, and dental pain.', requiresPrescription: false, inStock: true, rating: 4.5, reviews: 1876, deliveryTime: '2-4 hrs' },
    { id: 'm3', name: 'Aspirin 75mg', brand: 'Disprin', category: 'Pain Relief', price: 18, mrp: 25, discount: 28, image: '💊', dosage: '75mg', description: 'Low-dose aspirin for blood thinning and cardiovascular protection.', requiresPrescription: false, inStock: true, rating: 4.4, reviews: 987, deliveryTime: '2-4 hrs' },

    // Vitamins & Supplements
    { id: 'm4', name: 'Vitamin C 1000mg', brand: 'Limcee', category: 'Vitamins', price: 120, mrp: 160, discount: 25, image: '🍊', dosage: '1000mg', description: 'High-dose Vitamin C for immune system support and antioxidant protection.', requiresPrescription: false, inStock: true, rating: 4.8, reviews: 3210, deliveryTime: '2-4 hrs' },
    { id: 'm5', name: 'Vitamin D3 2000IU', brand: 'Sun-D3', category: 'Vitamins', price: 185, mrp: 240, discount: 23, image: '☀️', dosage: '2000 IU', description: 'Essential Vitamin D3 for bone health, immunity, and mood regulation.', requiresPrescription: false, inStock: true, rating: 4.6, reviews: 1543, deliveryTime: '2-4 hrs' },
    { id: 'm6', name: 'Omega-3 Fish Oil', brand: 'Himalaya', category: 'Vitamins', price: 299, mrp: 380, discount: 21, image: '🐟', dosage: '1000mg', description: 'Omega-3 fatty acids for heart health, brain function, and joint mobility.', requiresPrescription: false, inStock: true, rating: 4.5, reviews: 2104, deliveryTime: '2-4 hrs' },
    { id: 'm7', name: 'Multivitamin Daily', brand: 'Revital H', category: 'Vitamins', price: 350, mrp: 450, discount: 22, image: '💪', dosage: 'One daily', description: 'Complete multivitamin formula with 23 vitamins and minerals for daily wellness.', requiresPrescription: false, inStock: true, rating: 4.7, reviews: 4120, deliveryTime: '2-4 hrs' },

    // Antibiotics (Rx)
    { id: 'm8', name: 'Amoxicillin 500mg', brand: 'Mox', category: 'Antibiotics', price: 95, mrp: 120, discount: 21, image: '💉', dosage: '500mg', description: 'Broad-spectrum antibiotic for bacterial infections. Prescription required.', requiresPrescription: true, inStock: true, rating: 4.3, reviews: 876, deliveryTime: '4-6 hrs' },
    { id: 'm9', name: 'Azithromycin 250mg', brand: 'Azee', category: 'Antibiotics', price: 78, mrp: 100, discount: 22, image: '💉', dosage: '250mg', description: 'Antibiotic for respiratory and skin infections. 5-day course.', requiresPrescription: true, inStock: true, rating: 4.5, reviews: 1231, deliveryTime: '4-6 hrs' },

    // Digestive Health
    { id: 'm10', name: 'Pantoprazole 40mg', brand: 'Pantop', category: 'Digestive', price: 65, mrp: 85, discount: 24, image: '🫃', dosage: '40mg', description: 'Proton pump inhibitor for acidity, GERD, and stomach ulcers.', requiresPrescription: false, inStock: true, rating: 4.6, reviews: 2087, deliveryTime: '2-4 hrs' },
    { id: 'm11', name: 'Probiotic 5B CFU', brand: 'Sporlac', category: 'Digestive', price: 145, mrp: 185, discount: 22, image: '🦠', dosage: '5 Billion CFU', description: 'Multi-strain probiotic for gut health, digestion, and immunity.', requiresPrescription: false, inStock: true, rating: 4.4, reviews: 1342, deliveryTime: '2-4 hrs' },
    { id: 'm12', name: 'Antacid Gel', brand: 'Gelusil', category: 'Digestive', price: 42, mrp: 55, discount: 24, image: '🫧', dosage: '10ml/dose', description: 'Fast-acting antacid for heartburn and indigestion relief.', requiresPrescription: false, inStock: true, rating: 4.3, reviews: 876, deliveryTime: '2-4 hrs' },

    // Diabetes
    { id: 'm13', name: 'Metformin 500mg', brand: 'Glucophage', category: 'Diabetes', price: 55, mrp: 70, discount: 21, image: '🩸', dosage: '500mg', description: 'First-line diabetes medication for blood sugar control. Prescription required.', requiresPrescription: true, inStock: true, rating: 4.5, reviews: 1654, deliveryTime: '4-6 hrs' },
    { id: 'm14', name: 'Glucometer Strips', brand: 'Accu-Chek', category: 'Diabetes', price: 420, mrp: 550, discount: 24, image: '📏', dosage: '50 strips', description: 'Blood glucose test strips compatible with Accu-Chek glucometers.', requiresPrescription: false, inStock: true, rating: 4.7, reviews: 2340, deliveryTime: '2-4 hrs' },

    // Skin Care
    { id: 'm15', name: 'Moisturizing Cream', brand: 'Cetaphil', category: 'Skin Care', price: 280, mrp: 350, discount: 20, image: '🧴', dosage: 'As directed', description: 'Gentle moisturizing cream for dry and sensitive skin. Dermatologist recommended.', requiresPrescription: false, inStock: true, rating: 4.8, reviews: 5231, deliveryTime: '2-4 hrs' },
    { id: 'm16', name: 'Sunscreen SPF 50+', brand: 'Lotus Herbals', category: 'Skin Care', price: 245, mrp: 320, discount: 23, image: '🌞', dosage: 'SPF 50+', description: 'Broad spectrum UVA/UVB protection sunscreen. Water resistant formula.', requiresPrescription: false, inStock: true, rating: 4.6, reviews: 3120, deliveryTime: '2-4 hrs' },

    // Cold & Flu
    { id: 'm17', name: 'Cetirizine 10mg', brand: 'Zyrtec', category: 'Cold & Flu', price: 32, mrp: 42, discount: 24, image: '🤧', dosage: '10mg', description: 'Non-drowsy antihistamine for allergies, runny nose, and hay fever.', requiresPrescription: false, inStock: true, rating: 4.5, reviews: 2109, deliveryTime: '2-4 hrs' },
    { id: 'm18', name: 'Cough Syrup 100ml', brand: 'Benadryl', category: 'Cold & Flu', price: 85, mrp: 110, discount: 23, image: '🍯', dosage: '10ml/dose', description: 'Effective cough suppressant and expectorant for dry and productive cough.', requiresPrescription: false, inStock: false, rating: 4.3, reviews: 1876, deliveryTime: 'Out of stock' },

    // Heart Health
    { id: 'm19', name: 'Atorvastatin 10mg', brand: 'Lipitor', category: 'Heart', price: 89, mrp: 115, discount: 23, image: '❤️', dosage: '10mg', description: 'Statin medication for lowering cholesterol and reducing cardiovascular risk.', requiresPrescription: true, inStock: true, rating: 4.6, reviews: 1320, deliveryTime: '4-6 hrs' },
    { id: 'm20', name: 'Amlodipine 5mg', brand: 'Norvasc', category: 'Heart', price: 62, mrp: 80, discount: 23, image: '💓', dosage: '5mg', description: 'Calcium channel blocker for hypertension and angina. Prescription required.', requiresPrescription: true, inStock: true, rating: 4.4, reviews: 987, deliveryTime: '4-6 hrs' },
];

export const categories = ['All', 'Pain Relief', 'Vitamins', 'Antibiotics', 'Digestive', 'Diabetes', 'Skin Care', 'Cold & Flu', 'Heart'];

export const featuredStores = [
    { id: 1, name: 'MedPlus Pharmacy', rating: 4.8, distance: '0.8 km', deliveryTime: '25-35 min', open: true, badge: '🏆 Top Rated' },
    { id: 2, name: 'Apollo Pharmacy', rating: 4.7, distance: '1.2 km', deliveryTime: '30-45 min', open: true, badge: '⚡ Fast Delivery' },
    { id: 3, name: 'Netmeds Delivery', rating: 4.6, distance: 'Online', deliveryTime: '45-60 min', open: true, badge: '🛡️ Verified' },
    { id: 4, name: 'PharmEasy', rating: 4.5, distance: 'Online', deliveryTime: '60-90 min', open: false, badge: '📦 Wide Range' },
];
