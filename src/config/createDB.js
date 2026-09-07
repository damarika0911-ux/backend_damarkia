const createTables = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        phoneNumber BIGINT NOT NULL,
        role VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(255) NOT NULL,
        category_id INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        createdBy INT NOT NULL,
        FOREIGN KEY (createdBy) REFERENCES users(id),
        updatedBy INT NOT NULL,
        FOREIGN KEY (updateBy) REFERENCES users(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES product_categories(id)
    );

    CREATE TABLE IF NOT EXISTS product_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        createdBy INT NOT NULL,
        FOREIGN KEY (createdBy) REFERENCES users(id),
        updatedBy INT NOT NULL,
        FOREIGN KEY (updateBy) REFERENCES users(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        tableName VARCHAR(255) NOT NULL,
        changedBy INT NOT NULL,
        FOREIGN KEY (changedBy) REFERENCES users(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    INSERT INTO users (name, email, password, phoneNumber, role, status) VALUES ("supera", "supera@his.com", "Samdin", 1234567890, "superadmin", "active");    
`;