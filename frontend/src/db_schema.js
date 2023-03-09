const tableColumns = {
    PetShop: {
        name: 'string',
        location: 'string',
    },
    Breed: {
        name: "string",
        typical_height: "number",
        typical_weight: "number",
        typical_age: "number",
        description: "string",
        image_url: "string",
        type_name: "string",
    },
    Pet: {
        pet_id: "number",
        name: "string",
        sex: "string",
        height: "number",
        weight: "number",
        date_of_birth: "date",
        color: "string",
        favorite_food: "string",
        description: "string",
        price: "number",
        image_url: "string",
        pet_shop_name: "string",
        breed_name: "string",
    },
    Review: {
        review_id: "number",
        rating: "number",
        review_date: "date",
        content: "string",
        customer_email: "string",
        pet_shop_name: "string",
    },
    Customer: {
        email: "string",
        username: "string",
        salt: "string",
        encrypted_password: "binary",
    },
    Reservation: {
        pet_id: "number",
        reserve_date: "date",
        expire_date: "date",
        customer_email: "string",
    },
};

// All the tables & columns that can be searched.
const searchColumns = {
    PetShop: ['name', 'location'],
    Pet: [
        'name', 'sex', 'height', 'color', 'favorite_food', 'description',
        'pet_shop_name', 'breed_name',
    ],
    Review: ['content', 'pet_shop_name'],
};

export { tableColumns, searchColumns };
