import csv
import random
from pbkdf2 import PBKDF2
from generators import (
    Generator, WordGenerator, AddressGenerator, RealGenerator, IntGenerator, SequentialIntGenerator,
    VarcharGenerator, SampleGenerator, DateGenerator, BoolGenerator, Concat,
)

class RandomTable:
    def __init__(self, num_lines: int, **generators: Generator) -> None:
        self.values = [
            { key: generator.generate() for key, generator in generators.items() }
            for _ in range(num_lines)
        ]

    def get_column_data(self, column_name: str) -> list:
        return [value[column_name] for value in self.values]

    def add_column_data(self, column_name: str, data: list) -> None:
        if len(data) != len(self.values):
            raise ValueError('data should have the same length of the number of rows!')
        for value, d in zip(self.values, data):
            value[column_name] = d

    def write_to_csv(self, csv_filepath: str) -> None:
        with open(csv_filepath, mode='w', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=self.values[0].keys())
            writer.writeheader()
            writer.writerows(self.values)

if __name__ == '__main__':
    # Requires `breed.csv`, which contains all the breeds obtained from other databases.
    with open('breed.csv', mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        breed_names = [row['name'] for row in reader]

    random.seed(123456)

    pet_shop = RandomTable(
        num_lines=1000,
        name=Concat(WordGenerator(5, 10, capitalize=True), ' Pet Shop'),
        location=AddressGenerator(),
    )

    pet = RandomTable(
        num_lines=10000,  # On average, there would be 10 pets in each shop available.
        pet_id=SequentialIntGenerator(),
        name=WordGenerator(5, 50, capitalize=True),
        sex=SampleGenerator(['male', 'female']),
        height=RealGenerator(0.1, 2, ndigits=2),
        weight=RealGenerator(0.1, 5, ndigits=1),
        date_of_birth=DateGenerator('2015-01-01', '2022-10-01'),
        color=SampleGenerator(['Black', 'White','Gold','Yellow','Cream','Blue']),
        favorite_food=SampleGenerator(['Carrots', 'Pumpkin','Apples','Frozen Sardines','Frozen Yogurt','Salmon','Peanut Butter']),
        description=VarcharGenerator(0, 1000, includes_numbers=True, includes_spaces=True),
        price=RealGenerator(0, 100, ndigits=2),
        image_url=Concat(
            'https://www.dummyimage.com/',
            VarcharGenerator(10, 10, includes_numbers=True),
        ),
        pet_shop_name=SampleGenerator(pet_shop.get_column_data('name')),
        breed_name=SampleGenerator(breed_names),
    )

    customer = RandomTable(
        10000,  # On average, every customer rates 2 pet shops.
        email=Concat(
            WordGenerator(2, 20),
            '@',
            WordGenerator(3, 6),
            SampleGenerator(['.com', '.edu']),
        ),
        username=VarcharGenerator(min_length=5, max_length=20),
        salt=VarcharGenerator(min_length=16, max_length=16, includes_numbers=True),
    )

    # Add encoded password.
    password_generator = VarcharGenerator(
        min_length=8, max_length=16,
        includes_numbers=True, includes_special_characters=True,
    )
    salts = customer.get_column_data('salt')
    passwords = [password_generator.generate() for _ in range(len(salts))]
    encrypted_passwords = [PBKDF2(password, salt).hexread(64) for password, salt in zip(passwords, salts)]
    customer.add_column_data('encrypted_password', encrypted_passwords)

    review = RandomTable(
        20000,  # On average, there would be 20 reviews for each pet shop.
        review_id=SequentialIntGenerator(),
        rating=IntGenerator(1, 5),
        review_date=DateGenerator('2018-01-01', '2022-11-01'),
        content=VarcharGenerator(10, 1000, includes_spaces=True),
        customer_email=SampleGenerator(customer.get_column_data('email')),
        pet_shop_name=SampleGenerator(pet_shop.get_column_data('name')),
    )

    pet_shop.write_to_csv('pet_shop.csv')
    pet.write_to_csv('pet.csv')
    customer.write_to_csv('customer.csv')
    review.write_to_csv('review.csv')
    with open('user_passwords.txt', mode='w', encoding='utf-8') as f:
        for email, password in zip(customer.get_column_data('email'), passwords):
            f.write(f'{email} {password}\n')
