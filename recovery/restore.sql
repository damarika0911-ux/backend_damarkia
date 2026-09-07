-- Damarika recovery from the April 5, 2026 backup. PRIVATE: contains user records.

-- Import ONLY into a NEW EMPTY database selected in phpMyAdmin.

-- Stop on any SQL error. Do not use --force. No DROP/TRUNCATE statements are included.

SET NAMES utf8mb4;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255) UNIQUE NOT NULL,
    view_access BOOLEAN DEFAULT false,
    edit_access BOOLEAN DEFAULT false,
    delete_access BOOLEAN DEFAULT false,
    create_access BOOLEAN DEFAULT false,
    status BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_user_id INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(255),
    image VARCHAR(255),
    role_id INT DEFAULT 2,
    role INT,
    status BOOLEAN DEFAULT true,
    user_verify ENUM('not verified','verified') DEFAULT 'not verified',
    last_token VARCHAR(255),
    created_by INT,
    updated_by INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    status BOOLEAN DEFAULT true,
    created_by INT,
    updated_by INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image VARCHAR(255),
    badge VARCHAR(255),
    link VARCHAR(255),
    categoryId INT,
    status BOOLEAN DEFAULT true,
    created_by INT,
    updated_by INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE program (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATETIME,
    location VARCHAR(255),
    link VARCHAR(255),
    image VARCHAR(255),
    isFeatured BOOLEAN DEFAULT false,
    isUpcoming BOOLEAN DEFAULT false,
    availableDates VARCHAR(255),
    sessions VARCHAR(255),
    duration VARCHAR(255),
    participants VARCHAR(255),
    modules VARCHAR(255),
    status BOOLEAN DEFAULT true,
    createdBy INT,
    updatedBy INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE peoples (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    mobile VARCHAR(50),
    email VARCHAR(255),
    social_links TEXT,
    image VARCHAR(255),
    role_id INT,
    status BOOLEAN DEFAULT true,
    created_by INT,
    updated_by INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE district (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path TEXT,
    centerX FLOAT,
    centerY FLOAT,
    description TEXT,
    images TEXT,
    notablePlaces TEXT,
    status BOOLEAN DEFAULT true,
    created_by INT,
    updated_by INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE archaeological_sites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('cultural','natural','mixed') DEFAULT 'cultural',
    description TEXT,
    period VARCHAR(255),
    image VARCHAR(255),
    images TEXT,
    districtId INT,
    status BOOLEAN DEFAULT true,
    created_by INT,
    updated_by INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contact_form (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    reciever_email VARCHAR(255),
    sender_email VARCHAR(255),
    subject VARCHAR(255),
    message TEXT,
    isReplied BOOLEAN DEFAULT false,
    repliedMessage TEXT,
    replyDate DATETIME,
    status BOOLEAN DEFAULT true,
    created_by INT,
    updated_by INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE email_template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    subject VARCHAR(255),
    body TEXT,
    status BOOLEAN DEFAULT true,
    created_by INT,
    updated_by INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

START TRANSACTION;

INSERT INTO `archaeological_sites` (`id`, `name`, `type`, `description`, `period`, `image`, `districtId`, `created_by`, `updated_by`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Keeladi', 'cultural', 'An urban settlement of Sangam period on the banks of the Vaigai River. Recent excavations have revealed artifacts dating back to 6th century BCE, suggesting it was part of the ancient Tamil civilization.', '6th century BCE - 1st century CE', 'https://images.damarika.in/uploads/62551dfbf5b923af4d78.jpg', 19, 1, 1, 1, NULL, '2025-04-13 19:41:27'),
(2, 'Mamallapuram', 'cultural', 'A UNESCO World Heritage Site known for its 7th and 8th century rock-cut monuments and temples built by the Pallava dynasty. Famous for the Shore Temple and Arjuna\'s Penance.', '7th - 8th century CE', 'https://images.damarika.in/uploads/a5a63d3ac902f2609a1f.jpg', 2, 1, 1, 1, NULL, '2025-04-13 19:42:40'),
(3, 'Gangaikonda Cholapuram', 'cultural', 'Built by Rajendra Chola I, this was the capital of the Chola dynasty in the 11th century. The Brihadeeswarar Temple here is a UNESCO World Heritage Site known for its architectural grandeur.', '11th century CE', 'https://images.damarika.in/uploads/f3d10aa5579b8f7ff045.jpg', 30, 1, 1, 1, NULL, '2025-04-13 19:53:43'),
(4, 'Adichanallur', 'cultural', 'One of the most important Iron Age burial sites in South India. Archaeological excavations have unearthed burial urns, iron weapons, and bronze figurines dating back to 1000 BCE.', '1000 BCE - 600 BCE', 'https://images.damarika.in/uploads/d351b71d0bdfe79c7bcc.jpg', 22, 1, 1, 1, NULL, '2025-04-13 19:55:00'),
(5, 'Thanjavur', 'cultural', 'Home to the Brihadeeswarar Temple built by Raja Raja Chola I. This UNESCO World Heritage Site is known for its architectural magnificence and the massive Nandi statue.', '10th - 11th century CE', 'https://images.damarika.in/uploads/c624c006fa190ae36e57.jpg', 26, 1, 1, 1, NULL, '2025-04-13 19:55:39'),
(6, 'Poompuhar', 'mixed', 'An ancient port city mentioned in Tamil Sangam literature. It was the capital of the early Chola kings and a center for trade with Rome, Greece, and Egypt.', '300 BCE - 300 CE', 'https://images.damarika.in/uploads/be29d6d9c2290456fae9.jpg', 28, 1, 1, 1, NULL, '2025-04-13 20:04:07'),
(7, 'Madurai', 'cultural', 'One of the oldest continuously inhabited cities in the world. Home to the magnificent Meenakshi Amman Temple with its towering gopurams (gateway towers).', '3rd century BCE - present', 'https://images.damarika.in/uploads/d12f582a380eb3131439.jpg', 18, 1, 1, 1, NULL, '2025-04-13 19:58:57'),
(8, 'Kanchipuram', 'cultural', 'Known as the \'City of Thousand Temples\', it was the capital of the Pallava dynasty. Famous for its ancient temples including Kailasanathar Temple and Vaikunta Perumal Temple.', '4th - 9th century CE', 'https://images.damarika.in/uploads/e7b13d35e0a9a58aa481.jpg', 2, 1, 1, 1, NULL, '2025-04-13 20:03:47'),
(9, 'Kodumanal', 'cultural', 'An ancient trade center and industrial site known for gem cutting, bead making, and iron smelting. Excavations have revealed Roman coins and artifacts.', '5th century BCE - 1st century CE', 'https://images.damarika.in/uploads/e7750dac0058544d5de6.jpg', 10, 1, 1, 1, NULL, '2025-04-13 20:03:17'),
(10, 'Gulf of Mannar', 'natural', 'A marine biosphere reserve with rich biodiversity. Archaeological evidence suggests it was part of ancient maritime trade routes connecting Tamil Nadu with Sri Lanka and beyond.', 'Various periods', 'https://images.damarika.in/uploads/2607082217b41059d565.jpg', 21, 1, 1, 1, NULL, '2025-04-13 20:01:46');

INSERT INTO `contact_form` (`id`, `name`, `reciever_email`, `sender_email`, `status`, `message`, `subject`, `isReplied`, `replyDate`, `repliedMessage`, `created_by`, `updated_by`, `createdAt`, `updatedAt`) VALUES
(1, 'Surya ', 'vkassurya@gmail.com', 'support@damarika.in', 1, 'Sample Test', '', 1, '2025-04-13 16:04:21', 'Hi da Surya', NULL, 1, '2025-04-13 12:22:41', '2025-04-13 16:04:21'),
(2, 'Surya A', 'vkassurya@gmail.com', 'support@damarika.in', 1, 'Hi,Please reach out to me!!', 'For enquire about programs', 1, '2025-04-13 19:45:12', 'amadsffdsf', NULL, 1, '2025-04-13 14:02:37', '2025-04-13 19:45:12'),
(3, 'Surya ', 'vkassurya@gmail.com', 'support@damarika.in', 1, 'Sample Test', '', 1, '2025-04-20 07:36:59', 'ok', NULL, 1, '2025-04-13 14:56:09', '2025-04-20 07:36:59'),
(4, 'Vijay Amarnath', 'support@damarika.in', 'vijayamarnath.mv@gmail.com', 1, 'Just For Check', 'I cannot install npm in project', 1, '2025-04-13 19:25:43', 'Testing Completed', NULL, 1, '2025-04-13 19:25:21', '2025-04-13 19:25:43'),
(5, 'Vijay M V', 'support@damarika.in', 'vijayamarnath.mv@gmail.com', 1, 'Just For Check', 'I cannot install npm in project', 1, '2025-04-13 19:45:37', 'Test', NULL, 1, '2025-04-13 19:44:34', '2025-04-13 19:45:37'),
(6, 'Vijay M V', 'support@damarika.in', 'vijayamarnathmv@gmail.com', 1, 'Just For Check', 'I cannot install npm in project', 1, '2025-04-13 19:48:05', 'Hi Vijay', NULL, 1, '2025-04-13 19:47:50', '2025-04-13 19:48:05'),
(7, 'Vijay M V', 'support@damarika.in', 'vijayamarnathmv@gmail.com', 1, 'Just For Check', 'I cannot install npm in project', 0, NULL, NULL, NULL, NULL, '2025-04-13 19:55:19', '2025-04-13 19:55:19'),
(8, 'Vijay M V', 'support@damarika.in', 'vijayamarnathmv@gmail.com', 1, 'Just For Check', 'I cannot install npm in project', 0, NULL, NULL, NULL, NULL, '2025-04-13 19:58:57', '2025-04-13 19:58:57'),
(9, 'Vijay M V', 'support@damarika.in', 'vijayama002@gmail.com', 1, 'Just For Check', 'I cannot install npm in project', 0, NULL, NULL, NULL, NULL, '2025-04-13 19:59:37', '2025-04-13 19:59:37'),
(10, 'Vijay M V', 'vijayamarnathmv@gmail.com', 'support@damarika.in', 1, 'Just For Check', 'I cannot install npm in project', 1, '2025-04-13 20:09:07', 'Hi i am vijay', NULL, 1, '2025-04-13 20:08:48', '2025-04-13 20:09:07'),
(11, 'Vijay M V', 'vijayamarnath2002@gmail.com', 'support@damarika.in', 1, 'Just For Check', 'I cannot install npm in project', 1, '2025-04-14 12:43:02', 'test', NULL, 1, '2025-04-14 12:42:23', '2025-04-14 12:43:02'),
(12, 'Vijay M V', 'vijayamarnath2002@gmail.com', 'support@damarika.in', 1, 'Just For Check', 'I cannot install npm in project', 0, NULL, NULL, NULL, NULL, '2025-04-14 12:58:55', '2025-04-14 12:58:55'),
(13, 'test Vijay', 'vijayamarnath.mv@purpleslate.in', 'support@damarika.in', 1, 'Just For Check', 'I cannot install npm in project', 0, NULL, NULL, NULL, NULL, '2025-04-14 12:59:41', '2025-04-14 12:59:41'),
(14, 'Vijay M V', 'vijayamarnath.mv@purpleslate.in', 'support@damarika.in', 1, 'Just For Check', 'I cannot install npm in project', 0, NULL, NULL, NULL, NULL, '2025-04-14 13:00:00', '2025-04-14 13:00:00'),
(15, 'dassdasd asdasda', 'vijayamarnath.mv@purpleslate.in', 'support@damarika.in', 1, 'Just For Check', 'I cannot install npm in project', 0, NULL, NULL, NULL, NULL, '2025-04-14 17:13:36', '2025-04-14 17:13:36'),
(16, 'Kumar Kumar', 'test@123gmail.com', 'support@damarika.in', 1, 'Test', 'Test', 0, NULL, NULL, NULL, NULL, '2025-04-14 19:14:12', '2025-04-14 19:14:12'),
(17, 'Sunil Baboo', 'sunil.baboo@gmail.com', 'support@damarika.in', 1, 'Hi,\n\nAs a collector, re-organising my collection, have this set on Archeological findings published in 1825 and 1828:\n\nhttps://photos.app.goo.gl/kFR5EpGTHj2GYaU28\n\nKnow of anyone interested?\n\nBest, \n\nSunil Baboo \nBangalore.', '1825 Set on Archeological Findings', 0, NULL, NULL, NULL, NULL, '2025-06-15 08:56:53', '2025-06-15 08:56:53');

INSERT INTO `district` (`id`, `name`, `path`, `centerX`, `centerY`, `status`, `created_by`, `updated_by`, `createdAt`, `updatedAt`) VALUES
(1, 'Chennai', 'M78,28 L82,28 L84,32 L82,36 L78,36 L76,32 Z', 80, 32, 1, 1, 1, NULL, NULL),
(2, 'Kancheepuram', 'M70,32 L78,28 L76,32 L78,36 L76,40 L70,38 Z', 74, 34, 1, 1, 1, NULL, NULL),
(3, 'Tiruvallur', 'M64,26 L70,24 L78,28 L70,32 L64,32 Z', 70, 28, 1, 1, 1, NULL, NULL),
(4, 'Vellore', 'M58,32 L64,26 L64,32 L70,32 L70,38 L64,42 L58,38 Z', 64, 34, 1, 0, 0, NULL, NULL),
(5, 'Tiruvannamalai', 'M58,38 L64,42 L70,38 L76,40 L74,48 L66,50 L60,46 Z', 66, 44, 1, 0, 0, NULL, NULL),
(6, 'Viluppuram', 'M66,50 L74,48 L78,52 L76,58 L70,60 L64,56 Z', 70, 54, 1, 0, 0, NULL, NULL),
(7, 'Salem', 'M48,38 L58,32 L58,38 L60,46 L56,50 L48,46 Z', 54, 42, 1, 0, 0, NULL, NULL),
(8, 'Dharmapuri', 'M40,32 L48,30 L58,32 L48,38 L42,38 Z', 48, 34, 1, 0, 0, NULL, NULL),
(9, 'Krishnagiri', 'M40,24 L48,22 L54,24 L48,30 L40,32 Z', 46, 26, 1, 0, 0, NULL, NULL),
(10, 'Erode', 'M36,38 L42,38 L48,38 L48,46 L42,50 L36,46 Z', 42, 44, 1, 0, 0, NULL, NULL),
(11, 'Nilgiris', 'M28,42 L36,38 L36,46 L32,50 L26,48 Z', 32, 44, 1, 0, 0, NULL, NULL),
(12, 'Coimbatore', 'M26,48 L32,50 L36,46 L42,50 L40,56 L34,58 L28,54 Z', 34, 52, 1, 0, 0, NULL, NULL),
(13, 'Tiruppur', 'M42,50 L48,46 L56,50 L52,56 L46,58 L40,56 Z', 48, 52, 1, 0, 0, NULL, NULL),
(14, 'Karur', 'M46,58 L52,56 L56,50 L60,46 L64,56 L60,60 L54,62 Z', 56, 56, 1, 0, 0, NULL, NULL),
(15, 'Namakkal', 'M46,58 L54,62 L52,68 L44,66 L42,62 Z', 48, 62, 1, 0, 0, NULL, NULL),
(16, 'Dindigul', 'M40,56 L46,58 L42,62 L44,66 L40,70 L34,68 Z', 42, 64, 1, 0, 0, NULL, NULL),
(17, 'Theni', 'M34,68 L40,70 L38,76 L32,78 L28,74 Z', 34, 72, 1, 0, 0, NULL, NULL),
(18, 'Madurai', 'M40,70 L44,66 L52,68 L50,74 L44,78 L38,76 Z', 44, 72, 1, 0, 0, NULL, NULL),
(19, 'Sivaganga', 'M50,74 L52,68 L60,70 L58,76 L52,78 Z', 54, 74, 1, 0, 0, NULL, NULL),
(20, 'Virudhunagar', 'M38,76 L44,78 L42,84 L36,86 L32,82 Z', 38, 80, 1, 0, 0, NULL, NULL),
(21, 'Ramanathapuram', 'M44,78 L52,78 L58,76 L62,80 L58,86 L50,88 L42,84 Z', 52, 82, 1, 0, 0, NULL, NULL),
(22, 'Thoothukudi', 'M36,86 L42,84 L50,88 L48,94 L42,96 L36,92 Z', 42, 90, 1, 0, 0, NULL, NULL),
(23, 'Tirunelveli', 'M32,82 L36,86 L36,92 L30,94 L26,90 L28,86 Z', 32, 88, 1, 0, 0, NULL, NULL),
(24, 'Kanniyakumari', 'M26,90 L30,94 L28,98 L22,98 L20,94 Z', 26, 94, 1, 0, 0, NULL, NULL),
(25, 'Pudukkottai', 'M60,70 L66,68 L70,72 L68,78 L62,80 L58,76 Z', 64, 74, 1, 0, 0, NULL, NULL),
(26, 'Thanjavur', 'M66,68 L72,66 L76,70 L74,76 L70,72 Z', 72, 70, 1, 0, 0, NULL, NULL),
(27, 'Tiruvarur', 'M76,70 L80,68 L84,72 L82,78 L78,76 L74,76 Z', 78, 72, 1, 0, 0, NULL, NULL),
(28, 'Nagapattinam', 'M74,76 L78,76 L82,78 L80,84 L76,86 L72,82 Z', 78, 80, 1, 0, 0, NULL, NULL),
(29, 'Cuddalore', 'M70,60 L76,58 L80,62 L78,68 L72,66 L66,68 L60,70 L60,60 Z', 70, 64, 1, 0, 0, NULL, NULL),
(30, 'Ariyalur', 'M60,60 L64,56 L70,60 L66,68 Z', 64, 62, 1, 0, 0, NULL, NULL),
(31, 'Perambalur', 'M54,62 L60,60 L60,70 L52,68 Z', 56, 64, 1, 0, 0, NULL, NULL),
(32, 'Tiruchirapalli', 'M60,70 L60,60 L66,68 Z', 62, 66, 1, 0, 0, NULL, NULL),
(33, 'Theni', '', 168.53, 423.66, 1, 14, 14, '2026-04-05 09:28:01', '2026-04-05 09:28:01');

INSERT INTO `email_template` (`id`, `body`, `subject`, `createdAt`, `updatedAt`) VALUES
(1, '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Damarika - Response to Your Inquiry</title>\n</head>\n<body style=\"margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8f2ed; color: #333333;\">\n    <!-- Email Container -->\n    <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"max-width: 650px; margin: 0 auto; background-color: #f8f2ed;\">\n        <tr>\n            <!-- Header -->\n            <td style=\"padding: 20px; text-align: center; background-color: #ffffff; border-bottom: 2px solid #9e5c28;\">\n                <!-- Logo -->\n                <img src=\"https://via.placeholder.com/200x60/9e5c28/ffffff?text=Damarika\" alt=\"Damarika Logo\" style=\"max-width: 200px; height: auto;\">\n            </td>\n        </tr>\n        \n        <!-- Banner -->\n        <tr>\n            <td style=\"background-color: #9e5c28; padding: 10px 20px; text-align: center; color: #ffffff;\">\n                <h2 style=\"margin: 0; font-weight: normal;\">Thank You For Contacting Us</h2>\n            </td>\n        </tr>\n        \n        <!-- Email Content -->\n        <tr>\n            <td style=\"padding: 30px 20px; background-color: #ffffff;\">\n                <!-- Greeting -->\n                <p style=\"margin-top: 0; margin-bottom: 15px; color: #333333;\">Dear <span style=\"font-weight: bold;\">{{name}}</span>,</p>\n                \n                <!-- Message -->\n                <p style=\"margin-top: 0; margin-bottom: 15px; color: #333333; line-height: 1.5;\">\n                    Thank you for reaching out to Damarika. We appreciate your interest in our archaeological programs and services.\n                </p>\n                \n                <p style=\"margin-top: 0; margin-bottom: 15px; color: #333333; line-height: 1.5;\">\n                    {{message}}\n                </p>\n                \n                <p style=\"margin-top: 0; margin-bottom: 15px; color: #333333; line-height: 1.5;\">\n                    At Damarika, we are committed to creating a positive society, sensitive to history and heritage. We strive to provide exceptional services and meaningful experiences that connect people with the rich tapestry of human history.\n                </p>\n                \n                <p style=\"margin-top: 0; margin-bottom: 15px; color: #333333; line-height: 1.5;\">\n                    If you have any additional questions or require further information, please do not hesitate to contact us.\n                </p>\n                \n                <!-- Closing -->\n                <p style=\"margin-top: 30px; margin-bottom: 5px; color: #333333;\">\n                    Best regards,\n                </p>\n                <p style=\"margin-top: 0; margin-bottom: 0; color: #333333; font-weight: bold;\">\n                    The Damarika Team\n                </p>\n                <p style=\"margin-top: 0; margin-bottom: 0; color: #333333;\">\n                    Damarika - Your Gateway to the World of Archaeology\n                </p>\n            </td>\n        </tr>\n        \n        <!-- Call to Action -->\n        <tr>\n            <td style=\"padding: 20px; background-color: #f8f2ed; text-align: center;\">\n                <a href=\"#\" style=\"display: inline-block; padding: 12px 25px; background-color: #9e5c28; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 4px;\">Discover Our Programs</a>\n            </td>\n        </tr>\n        \n        <!-- Footer -->\n        <tr>\n            <td style=\"padding: 20px; background-color: #9e5c28; text-align: center; color: #ffffff;\">\n                <p style=\"margin: 0; margin-bottom: 10px; font-size: 14px;\">\n                    Connect with Damarika\n                </p>\n                \n                <!-- Social Media Icons -->\n                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin: 0 auto; margin-bottom: 15px;\">\n                    <tr>\n                        <td style=\"padding: 0 10px;\">\n                            <a href=\"#\" style=\"color: #ffffff; text-decoration: none;\">Facebook</a>\n                        </td>\n                        <td style=\"padding: 0 10px;\">\n                            <a href=\"#\" style=\"color: #ffffff; text-decoration: none;\">Twitter</a>\n                        </td>\n                        <td style=\"padding: 0 10px;\">\n                            <a href=\"#\" style=\"color: #ffffff; text-decoration: none;\">Instagram</a>\n                        </td>\n                    </tr>\n                </table>\n                \n                <p style=\"margin: 0; font-size: 12px; margin-bottom: 5px;\">\n                    ©? 2025 Damarika. All rights reserved.\n                </p>\n                <p style=\"margin: 0; font-size: 12px;\">\n                    123 Archaeology Street, Ancient City, AC 12345\n                </p>\n            </td>\n        </tr>\n    </table>\n</body>\n</html>', 'Thank you for reaching out. We received your message.', NULL, NULL);

INSERT INTO `peoples` (`id`, `name`, `image`, `role_id`, `status`, `description`, `title`, `created_by`, `updated_by`, `createdAt`, `updatedAt`) VALUES
(1, 'Aakash A', 'https://images.damarika.in/uploads/e79ae2d7a05c224edb30.jpeg', 1, 1, 'A dynamic leader who blends strategic foresight with practical expertise. Specialised with AI techniques in archaeology.', 'Chief Executive Officer', 1, 13, '2025-04-10 19:08:13', '2025-08-16 07:23:51'),
(2, 'Vijay Bharath S', 'https://images.damarika.in/uploads/cc51438eee9c11ccb88c.jpeg', 1, 1, 'Seasoned CFO with expertise in financial planning, analysis and reporting who is also specialized in palm leaf manuscriptology. Specialized in Lithic Tool Technologies and Knapping Techniques.', 'Chief Financial Officer', 1, 13, '2025-04-10 19:08:13', '2025-08-16 07:24:04'),
(3, 'Gayathrre V S', 'https://images.damarika.in/uploads/aa04b0afe8d2f2be4f6b.jpeg', 1, 1, 'Maintains the company and organizes the programs. Specialized in gemstone trade and technology.', 'Managing Director', 1, 13, '2025-04-10 19:08:13', '2025-08-16 07:24:16');

INSERT INTO `products` (`id`, `title`, `description`, `price`, `image`, `badge`, `status`, `created_by`, `updated_by`, `createdAt`, `updatedAt`, `categoryId`, `link`) VALUES
(1, 'Professional Archaeology Trowel', 'High-quality stainless steel trowel with wooden handle', 1200.00, 'https://m.media-amazon.com/images/I/6157A3j2jJL._SX679_.jpg', 'Best Seller', 1, 1, 1, '2025-04-12 22:44:06', '2025-04-17 09:25:32', 4, 'https://wa.me/917418859886'),
(2, 'Precision Brush Set', 'Set of 5 brushes in various sizes for detailed excavation work', 850.00, 'https://m.media-amazon.com/images/S/al-eu-726f4d26-7fdb/a326a84e-8f43-45cf-b73f-433be835f42f._CR0,48,1940,1016_SX507_CB1169409_QL70_.jpg', NULL, 1, 1, 1, '2025-04-12 22:44:06', '2025-04-17 09:25:40', 1, 'https://wa.me/917418859886'),
(3, 'Digital Caliper', 'Waterproof digital caliper for precise measurements in the field', 1500.00, 'https://m.media-amazon.com/images/I/614gKlEGiwL._SX679_.jpg', 'New', 1, 1, 1, '2025-04-12 22:44:06', '2025-04-17 09:25:46', 6, 'https://wa.me/917418859886'),
(4, 'Field Notebook Kit', 'Waterproof notebook with grid pages and documentation templates', 650.00, 'https://m.media-amazon.com/images/I/71Q2YAWCtdL._SL1500_.jpg', NULL, 1, 1, 1, '2025-04-12 22:44:06', '2025-04-17 09:25:53', 3, 'https://wa.me/917418859886'),
(5, 'Artifact Storage Kit', 'Acid-free containers and materials for safe artifact storage', 1800.00, 'https://cdn11.bigcommerce.com/s-uz4521xzld/images/stencil/608x608/products/2386/4572/apidt1nup__93100.1643447302.jpg?c=1', NULL, 1, 1, 1, '2025-04-12 22:44:06', '2025-04-17 09:26:36', 1, 'https://wa.me/917418859886'),
(6, 'Student Excavation Kit', 'Complete starter kit for archaeology students', 2500.00, '//historystuff.com.au/cdn/shop/products/digboxmini_1024x1024@2x.jpg?v=1598173744', 'Popular', 1, 1, 1, '2025-04-12 22:44:06', '2025-04-12 22:44:06', NULL, 'https://wa.me/9174185986'),
(7, 'Soil Sieve Set', 'Set of 3 stackable sieves with different mesh sizes', 1350.00, 'https://m.media-amazon.com/images/I/510pY1yoZKL.jpg', NULL, 1, 1, 1, '2025-04-12 22:44:06', '2025-04-17 09:26:55', 2, 'https://wa.me/917418859886');

INSERT INTO `product_categories` (`id`, `title`, `description`, `image`, `status`, `created_by`, `updated_by`, `createdAt`, `updatedAt`) VALUES
(1, 'Excavation Tools', 'Professional-grade trowels, brushes, and shovels for archaeological excavations.', 'https://images.damarika.in/uploads/3ec048ae6bdee03d0a0a.jpeg', 1, 1, 1, '2025-04-12 21:55:01', '2025-04-13 18:34:03'),
(2, 'Soil Analysis Kits', 'Tools for analyzing soil composition, pH levels, and organic content at excavation sites.', '', 1, 1, 1, '2025-04-12 21:55:01', '2025-04-12 21:55:01'),
(3, 'Preservation Equipment', 'Specialized tools and materials for preserving and protecting archaeological artifacts.', 'https://images.damarika.in/uploads/3ed1b9968ff4142ed7a8.svg', 1, 1, 13, '2025-04-12 21:55:01', '2025-05-08 16:58:14'),
(4, 'Measurement Tools', 'Precision measuring instruments for accurate documentation of archaeological findings.', '', 0, 1, 1, '2025-04-12 21:55:01', '2025-04-12 21:55:01'),
(5, 'Field Documentation Kits', 'Comprehensive kits for documenting findings in the field, including notebooks and drawing tools.', '', 0, 1, 1, '2025-04-12 21:55:01', '2025-04-12 21:55:01'),
(6, 'Educational Tool Sets', 'Specially designed tool sets for students and beginners in archaeology.', '', 0, 1, 1, '2025-04-12 21:55:01', '2025-04-12 21:55:01');

INSERT INTO `program` (`id`, `title`, `description`, `date`, `location`, `isFeatured`, `link`, `status`, `availableDates`, `duration`, `participants`, `modules`, `isUpcoming`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`, `image`, `sessions`) VALUES
(3, 'Introduction to Epigraphy', 'Introduction to Epigraphy is a beginner-friendly course that teaches you how to read and understand ancient inscriptions, including Tamil-Brahmi script. Learn how inscriptions reveal history, culture, and archaeological insights through simple explanation', '2026-04-07 00:00:00', 'Online', 1, 'https://forms.gle/4my6a9Haz2u1pAXE9', 1, '', '10', '25', 'Introduction to Tamil-Brahmi script and its importance in early history.\nLearn how to identify and read simple ancient inscriptions.\nUnderstanding symbols, scripts, and the basic structure of inscriptions. \n7 Days – 10 Hours structured learning program.', 1, 1, 16, '2025-04-10 19:08:02', '2026-04-04 10:23:14', 'https://images.damarika.in/uploads/f9d7564e1624257e766d.png', '10'),
(4, 'Temple Architecture Workshop', 'Learn about the architectural styles of South Indian temples, focusing on the Chola period monuments.', '2025-07-13 00:00:00', 'Thanjavur', 1, 'https://wa.me/917418859886?text=Hello%2C%20I%20am%20Interested%20in%20Temple%20Architecture%20Workshop', 1, 'Multiple dates available', '12', '100', 'Learn about South Indian (Dravidian), North Indian (Nagara), and Deccan (Vesara) temple designs.\nStudy parts of a temple like the gopuram, mandapa, and sanctum (garbhagriha) using basic plans and models.\nTry drawing, building mini models, or designing tem', 1, 1, 16, '2025-04-10 19:08:02', '2026-04-04 10:50:28', 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png', '7'),
(6, 'Archaeological Excavation Techniques', 'Learn proper excavation methods and documentation techniques at an active archaeological site.', '2025-08-05 00:00:00', 'Keeladi', 0, 'https://wa.me/917418859886?text=Hello%2C%20I%20am%20Interested%20in%Archaeological%20Excavation%20Techniques', 0, '10', '10', '98', 'Archaeologists first study the area and decide where to dig.\nThey dig slowly and gently using tools like trowels, brushes, and shovels.\nEvery object and layer found is carefully recorded, labeled, and photographed.\nObjects are cleaned, studied, and sent.', 0, 1, 16, '2025-04-10 19:08:02', '2026-04-04 10:45:48', 'https://images.damarika.in/uploads/ddb8cb3070f5359f24a1.png', '4'),
(7, 'Heritage Conservation Seminar', 'Discussion on modern conservation techniques for preserving archaeological artifacts and monuments.', '2025-09-12 00:00:00', 'Chennai', NULL, '', 1, '', '', '', '', 0, 1, 1, '2025-04-10 19:08:02', '2025-04-10 19:08:02', 'https://images.damarika.in/uploads/b0a9d32171716dda8fc0.jpeg', ''),
(19, 'Introduction to Archaeology', 'Introduction to Archaeology is a beginner-friendly course that helps you understand how we study the past through material remains. It introduces the basic concepts of archaeology, excavation methods, and how ancient objects reveal human history and cultu', '2026-04-15 00:00:00', 'online', 1, 'https://forms.gle/Rf3iEhb3Jv5Ahohx5', 1, '', '9', '25', '7 Days – 7 Hours structured learning program. online e-certificate Course has been initiated by our Damarika Archeological Training Agency Pvt. Ltd\n\nTo call/WhatsApp: 74188 59886 , 96882 37286', 1, 13, 16, '2025-05-07 17:01:41', '2026-04-04 10:41:27', 'https://images.damarika.in/uploads/4195a54dbde55af99a56.png', '7'),
(20, 'Paper Presentation', 'On behalf of Damarika\'s 1st year anniversary we conduct Paper presentation on topic \"Recent trends in the study of the past- perspectives from Archaeology, History and Ethnography\"', '2025-09-06 00:00:00', ' Online', 0, 'https://docs.google.com/forms/d/e/1FAIpQLSflUYZX4KdVal0vCyrn8HY_4fI3hwapBBryoVXNpTgt5iurCg/viewform?usp=sharing&ouid=103373042823823729205', 0, '', '15', '20', '', 0, 13, 16, '2025-08-27 01:57:51', '2026-04-04 10:49:03', 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png', '2');

INSERT INTO `roles` (`id`, `role_name`, `view_access`, `edit_access`, `delete_access`, `create_access`, `created_by`, `updated_by`, `created_user_id`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', 1, 1, 1, 1, NULL, '', NULL, 1, '2025-04-10 19:04:35', '2025-04-10 19:04:35'),
(2, 'modurator', 1, 1, 0, 1, NULL, '', NULL, 1, '2025-04-10 19:04:35', '2025-04-10 19:04:35');

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phoneNumber`, `image`, `role_id`, `status`, `user_verify`, `last_token`, `created_by`, `updated_by`, `createdAt`, `updatedAt`, `role`) VALUES
(1, 'GAYATHRRE', 'vsgayathrre@gmail.com', '$2a$10$11wm9UnvbltEypg/nyiWmuzsC.6YI1shVaOyzIpuT7.EgkMJ0fY0G', '7397083044', 'https://images.damarika.in/uploads/aa1e97eedae44fdbf8c1.jpeg', 1, 1, 'verified', NULL, NULL, NULL, '2025-04-10 19:05:52', '2025-08-16 07:18:28', 1),
(13, 'Damarika', 'vsgayathrre@gmail.com', '$2b$10$GgDE0ThGxd/n3T3JAsS/O.4YAVHdKXj5HYink8qTZCtsiBFELWhr2', '7397083044', 'https://images.damarika.in/uploads/e4c6159136b669f3b25f.jpeg', 1, 1, 'verified', NULL, NULL, 1, '2025-04-20 10:17:54', '2025-04-22 18:46:10', NULL),
(14, 'AAKASH', 'aakash0521@gmail.com', '$2b$10$gue.X/.TftXP8DfdZSY0sO0fPZ36hY6hz/SY8S5RLr20Lr2kHTsCq', '7418859886', 'https://images.damarika.in/uploads/cab8db8349ea4522576b.jpeg', 1, 1, 'verified', NULL, NULL, 13, '2025-04-20 10:38:17', '2025-08-16 07:18:49', NULL),
(15, 'VIJAY BHARATH', 'vijaybharathdpi@gmail.com', '$2b$10$nN2e3XLRLRLCE4Yyt0ZMFeNUH8ucZbN8g3qDAkfLuEwHp.AeRhpH6', '9688237286', 'https://images.damarika.in/uploads/5578af73ce9a20e8b057.jpeg', 1, 1, 'verified', NULL, NULL, 13, '2025-04-20 10:40:33', '2025-08-16 07:19:05', NULL),
(16, 'VIGNESH', 'vignesh.m052002@gmail.com', '$2b$10$BIhyIMFjRg4SRYJ28Fj8seQojr8Et6.J5dSqKTvgbNuocoG3UL85m', '8925350607', '', 1, 1, 'verified', NULL, NULL, 13, '2025-04-20 10:44:11', '2025-04-20 10:44:11', NULL),
(17, 'Vignesh', 'vigneshwarrsk@gmail.com', '$2a$10$xVGkQ9MdpY8rgFrU2BTy9.Lf9FZVsezIFLKrF4rIEf/memwtkY3va', NULL, 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png', 1, 1, 'verified', NULL, NULL, NULL, '2025-05-14 08:30:14', '2025-05-14 08:30:14', 1);

COMMIT;

-- Next: npm run migrate, then npm run admin:reset (see RECOVERY.md).