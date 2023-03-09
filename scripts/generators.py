from typing import Protocol
import string
import random
from datetime import date, timedelta

class Generator(Protocol):
    """Template generator class."""
    def generate(self):
        ...

class IntGenerator(Generator):
    def __init__(self, min_value: int, max_value: int) -> None:
        self.min_value = min_value
        self.max_value = max_value

    def generate(self) -> int:
        return random.randint(self.min_value, self.max_value)

class SequentialIntGenerator(Generator):
    def __init__(self, min_value: int = 0) -> None:
        self.min_value = min_value

    def generate(self):
        self.min_value += 1
        return self.min_value - 1

class RealGenerator(Generator):
    def __init__(self, min_value: float, max_value: float, ndigits: int = 8) -> None:
        self.min_value = min_value
        self.max_value = max_value
        self.ndigits = ndigits

    def generate(self) -> float:
        return round(random.uniform(self.min_value, self.max_value), self.ndigits)

class BoolGenerator(Generator):
    def generate(self):
        return random.choice((0, 1))

class VarcharGenerator(Generator):
    """A VARCHAR generator with length limits, plus a predetermined prefix
    and suffix.

    By default, generates a string containing only uppercase and lowercase letters.
    """
    def __init__(
        self, min_length: int, max_length: int,
        includes_uppercase_letters: bool = True,
        includes_lowercase_letters: bool = True,
        includes_numbers: bool = False,
        includes_special_characters: bool = False,
        includes_spaces: bool = False,
    ) -> None:
        self.min_length = min_length
        self.max_length = max_length

        self.charset = ''
        if includes_uppercase_letters:
            self.charset += string.ascii_uppercase
        if includes_lowercase_letters:
            self.charset += string.ascii_lowercase
        if includes_numbers:
            self.charset += string.digits
        if includes_special_characters:
            self.charset += string.punctuation
        if includes_spaces:
            self.charset += ' '

    def generate(self) -> str:
        length = random.randint(self.min_length, self.max_length)
        return ''.join(random.choice(self.charset) for _ in range(length))

class WordGenerator(Generator):
    """Generate a word using random letters."""
    def __init__(self, min_length: int, max_length: int, capitalize: bool = False) -> None:
        self.word_generator = VarcharGenerator(
            min_length, max_length, includes_uppercase_letters=False,
        )
        self.capitalize = capitalize

    def generate(self) -> str:
        word = self.word_generator.generate()
        if self.capitalize:
            return word.capitalize()
        else:
            return word

class DateGenerator(Generator):
    """Generates date in YYYY-MM-DD format."""
    def __init__(self, min_date: str, max_date: str) -> None:
        self.min_date = date.fromisoformat(min_date)
        self.max_date = date.fromisoformat(max_date)
        self.date_diff = (self.max_date - self.min_date).days

    def generate(self) -> str:
        date_offset = random.randint(0, self.date_diff)
        return str(self.min_date + timedelta(days=date_offset))

class SampleGenerator(Generator):
    def __init__(self, elements) -> None:
        self.elements = elements

    def generate(self):
        return random.choice(self.elements)

class AddressGenerator(Generator):
    def __init__(self) -> None:

        self.street_numbers = ['2821','720','901','2017','2500','309','760','310','311','411','413','209']
        self.street_names = ['W Kirby Ave','E Kirby Ave','S Neil St','N Neil St','W College Ct','S College Ct','N Prospect Ave','S Philo Rd']
        self.cities = ['Champaign','Chicago','Urbana','Aurora','Joliet','Naperville','Peoria','Cicero']
        self.states = ['IL']
        self.zip_codes = ['61820','61802','61800','61830','61840','67890','78000','11209']

        self.generator = self.gen_next()

    def gen_next(self):
        while True:
            random.shuffle(self.street_names)
            random.shuffle(self.street_numbers)
            random.shuffle(self.cities)
            random.shuffle(self.zip_codes)

            for street_number in self.street_numbers:
                for street_name in self.street_names:
                    for city in self.cities:
                        for state in self.states:
                            for zip_code in self.zip_codes:
                                yield ' '.join([street_number, street_name, city, state, zip_code])

    def generate(self):
        return next(self.generator)

class Concat(Generator):
    def __init__(self, *generators_or_str) -> None:
        self.generators_or_str = generators_or_str

    def generate(self):
        return ''.join(
            gen if isinstance(gen, str) else gen.generate()
            for gen in self.generators_or_str
        )
