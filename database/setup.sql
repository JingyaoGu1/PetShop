CREATE DATABASE PetShopDatabase DEFAULT CHARACTER SET 'utf8';

-- Add tables to PetShopDb only.
USE PetShopDatabase;

CREATE TABLE PetShop (
    `name` VARCHAR(50),
    location VARCHAR(100),

    PRIMARY KEY (`name`)
);

CREATE TABLE Breed (
    `name` VARCHAR(50),
    typical_height REAL CHECK (typical_height > 0),
    typical_weight REAL CHECK (typical_weight > 0),
    typical_age REAL CHECK (typical_age > 0),
    description VARCHAR(1000),
    image_url VARCHAR(200),
    type_name VARCHAR(50),

    PRIMARY KEY (`name`)
);

CREATE TABLE Pet (
    pet_id INT,
    `name` VARCHAR(50),
    sex VARCHAR(10) CHECK (sex = 'male' OR sex = 'female'),
    height REAL CHECK (height > 0),
    weight REAL CHECK (weight > 0),
    date_of_birth DATE,
    color VARCHAR(20),
    favorite_food VARCHAR(50),
    description VARCHAR(1000),
    price REAL CHECK (price >= 0),
    image_url VARCHAR(200),
    pet_shop_name VARCHAR(50),
    breed_name VARCHAR(50),

    PRIMARY KEY (pet_id),

    -- ON DELETE CASCADE ensures many-to-one relation.
    -- FOREIGN KEY (pet_shop_name) REFERENCES PetShop(`name`) ON DELETE CASCADE,
    FOREIGN KEY (breed_name) REFERENCES Breed(`name`) ON DELETE CASCADE
);

CREATE TABLE Customer (
    email VARCHAR(100),
    username VARCHAR(20),
    salt CHAR(16),
    encrypted_password BINARY(64),

    PRIMARY KEY (email)
);

CREATE TABLE Review (
    review_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),  -- 1 to 5 rating.
    review_date DATE DEFAULT (CURRENT_DATE),
    content VARCHAR(1000),
    customer_email VARCHAR(100),
    pet_shop_name VARCHAR(50),

    PRIMARY KEY (review_id),
    FOREIGN KEY (customer_email) REFERENCES Customer(email),
    FOREIGN KEY (pet_shop_name) REFERENCES PetShop(`name`) ON DELETE CASCADE
);

CREATE TABLE Reservation (
    pet_id INT,
    reserve_date DATE,
    expire_date DATE,
    customer_email VARCHAR(100),

    PRIMARY KEY (pet_id),
    FOREIGN KEY (customer_email) REFERENCES Customer(email) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES Pet(pet_id) ON DELETE CASCADE
);

-- Reference: https://stackoverflow.com/questions/20744508/best-way-to-manage-row-expiration-in-mysql
-- Clears the expired reservation. Starts just after midnight every day.
CREATE EVENT clearExpiredReservation
ON SCHEDULE EVERY 1 DAY
STARTS (CURRENT_DATE() + INTERVAL 1 DAY + INTERVAL 1 MINUTE)
DO
    DELETE FROM Reservation
    WHERE expire_date < CURRENT_DATE();

DELIMITER |

-- Make sure that the birth date of a incoming pet is vaild. If it is not, set
-- to NULL.
CREATE TRIGGER checkPetDateOfBirth
BEFORE INSERT ON Pet
FOR EACH ROW BEGIN
    IF NEW.date_of_birth > CURRENT_DATE() THEN
        SET NEW.date_of_birth = NULL;
    END IF;
END;|

-- Make sure that the review_date of a incoming review is vaild. If it is not,
-- set to NULL.
CREATE TRIGGER checkReviewDate
BEFORE INSERT ON Review
FOR EACH ROW BEGIN
    IF NEW.review_date > CURRENT_DATE() THEN
        SET NEW.review_date = NULL;
    END IF;
END;|

DELIMITER |
CREATE TRIGGER petshopTrigger
AFTER DELETE ON PetShop
FOR EACH ROW BEGIN
    DELETE FROM Pet
    WHERE pet_shop_name = old.name;
END;|

DELIMITER |
CREATE PROCEDURE discount()
BEGIN

DECLARE end_loop BOOLEAN DEFAULT FALSE;
DECLARE varPetId INT;

DECLARE Cur CURSOR FOR(
	SELECT pet_id 
	FROM Pet NATURAL JOIN(SELECT name AS pet_shop_name, AVG(rating) AS avgRating
	FROM PetShop p JOIN Review r ON (p.name = r.pet_shop_name)
	GROUP BY p.name
	HAVING avgRating < 3.5) AS MYTABLE
);

DECLARE CONTINUE HANDLER FOR NOT FOUND SET end_loop = TRUE; 
    
OPEN Cur;
cloop:LOOP
    FETCH Cur INTO varPetId;
	IF (end_loop) THEN
        LEAVE cloop;
    END IF;
    
    UPDATE Pet
    SET price = price - 10
    WHERE price >= (SELECT AVG(price) FROM Pets);
	
END LOOP cloop;
CLOSE Cur;
END;|