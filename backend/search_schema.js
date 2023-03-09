// All the tables & columns that can be searched.
const searchColumns = {
    PetShop: ['name', 'location'],
    Pet: [
        'name', 'sex', 'height', 'color', 'favorite_food', 'description',
        'pet_shop_name', 'breed_name',
    ],
    Review: ['content', 'pet_shop_name'],
};

// The output column of search.
const searchOutputColumns = {
    PetShop: ['name', 'location'],
    Pet: [
        'name', 'sex', 'height', 'weight', 'date_of_birth', 'color',
        'favorite_food', 'description', 'price', 'image_url', 'pet_shop_name',
        'breed_name',
    ],
    Review: [
        'rating', 'review_date', 'content', 'customer_email', 'pet_shop_name'
    ],
};

// These columns require an exact match.
const exactMatchColumns = {
    Pet: ['sex'],
};

module.exports = { searchColumns, searchOutputColumns, exactMatchColumns };
