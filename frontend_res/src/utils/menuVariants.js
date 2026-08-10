/**
 * Groups menu items by their base name when they have Half Plate / Full Plate variants
 * 
 * @param {Array} menuItems - Array of menu items from API
 * @returns {Array} Grouped menu items with variants
 */
export function groupMenuItemsByVariant(menuItems) {
  const variantPattern = /^(.+?)\s*-\s*(Half Plate|Full Plate)$/i;
  
  // First pass: identify items with variants
  const baseNameMap = new Map();
  
  menuItems.forEach((item) => {
    const match = item.name.match(variantPattern);
    if (match) {
      const baseName = match[1].trim();
      const variantType = match[2].toLowerCase();
      
      if (!baseNameMap.has(baseName)) {
        baseNameMap.set(baseName, []);
      }
      baseNameMap.get(baseName).push({
        ...item,
        variantType,
        variantName: variantType === 'half plate' ? 'Half Plate' : 'Full Plate',
      });
    }
  });
  
  // Second pass: build grouped items
  const result = [];
  const processedBaseNames = new Set();
  
  menuItems.forEach((item) => {
    const match = item.name.match(variantPattern);
    
    if (match) {
      const baseName = match[1].trim();
      
      // Skip if we've already processed this base name
      if (processedBaseNames.has(baseName)) {
        return;
      }
      
      processedBaseNames.add(baseName);
      const variants = baseNameMap.get(baseName) || [];
      
      // Sort variants: Half Plate first, then Full Plate
      variants.sort((a, b) => {
        if (a.variantType === 'half plate') return -1;
        if (b.variantType === 'half plate') return 1;
        return 0;
      });
      
      // Use the first variant's image as default, or try to find one with an image
      const defaultVariant = variants.find(v => v.image) || variants[0];
      
      result.push({
        id: `variant-${baseName}`, // Virtual ID for the grouped item
        name: baseName,
        description: variants[0]?.description || 'Freshly prepared with care.',
        price: variants[0]?.price || 0, // Default to first variant's price
        image: defaultVariant?.image,
        category_id: variants[0]?.category_id,
        calories: variants[0]?.calories,
        cook_time: variants[0]?.cook_time,
        chef_special: variants[0]?.chef_special,
        best_seller: variants[0]?.best_seller,
        availability: variants.some(v => v.availability),
        hasVariants: true,
        variants: variants.map(v => ({
          id: v.id,
          name: v.variantName,
          price: v.price,
          image: v.image,
          availability: v.availability,
        })),
        selectedVariant: variants[0], // Default selected variant
      });
    } else {
      // Regular item without variants
      result.push({
        ...item,
        hasVariants: false,
        variants: [],
        selectedVariant: null,
      });
    }
  });
  
  return result;
}

/**
 * Get the original menu item ID for a selected variant
 * 
 * @param {Object} groupedItem - The grouped menu item
 * @param {string} variantName - The selected variant name (e.g., "Half Plate")
 * @returns {number|null} The original menu item ID
 */
export function getVariantMenuItemId(groupedItem, variantName) {
  if (!groupedItem.hasVariants || !variantName) {
    return groupedItem.id;
  }
  
  const variant = groupedItem.variants.find(v => v.name === variantName);
  return variant ? variant.id : groupedItem.id;
}

/**
 * Get the price for a selected variant
 * 
 * @param {Object} groupedItem - The grouped menu item
 * @param {string} variantName - The selected variant name
 * @returns {number} The price of the selected variant
 */
export function getVariantPrice(groupedItem, variantName) {
  if (!groupedItem.hasVariants || !variantName) {
    return groupedItem.price;
  }
  
  const variant = groupedItem.variants.find(v => v.name === variantName);
  return variant ? variant.price : groupedItem.price;
}

/**
 * Get the image for a selected variant
 * 
 * @param {Object} groupedItem - The grouped menu item
 * @param {string} variantName - The selected variant name
 * @returns {string|null} The image URL of the selected variant
 */
export function getVariantImage(groupedItem, variantName) {
  if (!groupedItem.hasVariants) {
    return groupedItem.image;
  }
  
  // If a specific variant is selected, use its image
  if (variantName) {
    const variant = groupedItem.variants.find(v => v.name === variantName);
    if (variant && variant.image) {
      return variant.image;
    }
  }
  
  // Fallback to the grouped item's image
  return groupedItem.image;
}