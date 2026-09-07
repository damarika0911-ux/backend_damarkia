import connection from "../phpmyadmindb";

const createRolesTable = `
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL UNIQUE,
    view_access BOOLEAN DEFAULT FALSE,
    edit_access BOOLEAN DEFAULT FALSE,
    delete_access BOOLEAN DEFAULT FALSE,
    create_access BOOLEAN DEFAULT FALSE,
    created_by VARCHAR (250) NULL,
    updated_by VARCHAR (250),
    created_user_id INT NULL,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

const createUserTable = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(250) NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    status TINYINT(1) DEFAULT 1,
    user_verify TINYINT(1) DEFAULT 0,
    last_token VARCHAR(500) NULL,
    created_by VARCHAR (250) NULL,
    updated_by VARCHAR (250),
    created_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL ON UPDATE CASCADE
);
`;
const insertRoles = `
        INSERT INTO roles (role_name, view_access, edit_access, delete_access, create_access) VALUES
        ('admin', TRUE, TRUE, TRUE, TRUE),
        ('moderator', TRUE, TRUE, FALSE, FALSE),
        ('user', TRUE, FALSE, FALSE, FALSE)
        ON DUPLICATE KEY UPDATE role_name=VALUES(role_name);
    `;


// Create tables in sequence
connection.query({ sql: createRolesTable }, (err: Error | null) => {
    if (err) {
        console.error("Error creating roles table:", err);
        return;
    }
    console.log("Roles table created successfully or already exists.");

    connection.query({ sql: createUserTable }, (err: Error | null) => {
        if (err) {
            console.error("Error creating users table:", err);
            return;
        }
        console.log("Users table created successfully or already exists.");
        connection.end();
    });
    connection.query({ sql: insertRoles }, (err: Error | null) => {
        if (err) {
            console.error("Error inserting dummy roles:", err);
            return;
        }
        console.log("Dummy roles inserted successfully.");
    });
});
