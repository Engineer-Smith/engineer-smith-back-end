// seeds/sqlSeeds.js - Comprehensive SQL questions with enhanced validation
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');

// Import enhanced utilities
const QuestionTemplateGenerator = require('../utils/questionTemplate');
const QuestionSeedValidator = require('../utils/seedValidator');
const BatchProcessor = require('../utils/batchProcessor');

// Comprehensive SQL questions data - 70 total questions
const sqlQuestions = {
  // 25 Multiple Choice Questions
  multipleChoice: [
    // Basic SQL Concepts (10 questions)
    {
      title: "SQL SELECT Statement",
      description: "Which keyword is used to retrieve data from a database?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "select-statements"],
      options: ["GET", "SELECT", "FETCH", "RETRIEVE"],
      correctAnswer: 1
    },
    {
      title: "SQL WHERE Clause",
      description: "Which clause filters records in a SQL query?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "where-clauses"],
      options: ["FROM", "WHERE", "HAVING", "FILTER"],
      correctAnswer: 1
    },
    {
      title: "SQL PRIMARY KEY Purpose",
      description: "What is the main purpose of a primary key?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["sql", "primary-keys", "constraints"],
      options: ["Sort data", "Uniquely identify records", "Store data", "Index data"],
      correctAnswer: 1
    },
    {
      title: "SQL NULL Operator",
      description: "Which operator checks for NULL values in SQL?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "where-clauses"],
      options: ["=", "IS", "!=", "<>"],
      correctAnswer: 1
    },
    {
      title: "SQL Aggregate AVG Function",
      description: "Which function calculates the average of a column?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "aggregates"],
      options: ["SUM()", "AVG()", "COUNT()", "MAX()"],
      correctAnswer: 1
    },
    {
      title: "SQL ORDER BY Clause",
      description: "Which keyword sorts query results?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "order-by"],
      options: ["GROUP BY", "ORDER BY", "SORT BY", "ARRANGE BY"],
      correctAnswer: 1
    },
    {
      title: "SQL GROUP BY Clause",
      description: "Which clause groups rows with the same values in SQL?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "group-by"],
      options: ["HAVING", "GROUP BY", "WHERE", "CLUSTER BY"],
      correctAnswer: 1
    },
    {
      title: "SQL Transaction COMMIT",
      description: "Which command commits a transaction in SQL?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "transactions"],
      options: ["SAVE", "COMMIT", "END", "APPLY"],
      correctAnswer: 1
    },
    {
      title: "SQL CASE Statement",
      description: "Which statement provides conditional logic in SQL?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "queries"],
      options: ["IF", "CASE", "SWITCH", "WHEN"],
      correctAnswer: 1
    },
    {
      title: "SQL Index Benefits",
      description: "What is the primary benefit of an index in SQL?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "indexes"],
      options: ["Data storage", "Query performance", "Data validation", "Data encryption"],
      correctAnswer: 1
    },

    // Advanced SQL Concepts (8 questions)
    {
      title: "SQL UNIQUE Constraint",
      description: "Which constraint ensures unique values in a column?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "constraints"],
      options: ["PRIMARY KEY", "FOREIGN KEY", "UNIQUE", "CHECK"],
      correctAnswer: 2
    },
    {
      title: "SQL Subquery Usage",
      description: "Where can a subquery be used in a SQL statement?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "subqueries"],
      options: ["SELECT only", "WHERE only", "FROM only", "Multiple clauses"],
      correctAnswer: 3
    },
    {
      title: "SQL HAVING Clause",
      description: "Which clause filters grouped results in SQL?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "having"],
      options: ["WHERE", "GROUP BY", "HAVING", "FILTER"],
      correctAnswer: 2
    },
    {
      title: "SQL Foreign Key Purpose",
      description: "What does a foreign key enforce?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "foreign-keys", "constraints"],
      options: ["Unique values", "Referential integrity", "Data sorting", "Data encryption"],
      correctAnswer: 1
    },
    {
      title: "SQL View Characteristics",
      description: "What is a view in SQL?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "database-design"],
      options: ["Physical table", "Virtual table", "Index", "Constraint"],
      correctAnswer: 1
    },

    // SQL JOIN Types (7 questions)
    {
      title: "SQL INNER JOIN",
      description: "What does an INNER JOIN return?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "joins", "inner-join"],
      options: ["All records from left table", "All records from right table", "Only matching records", "All records from both tables"],
      correctAnswer: 2
    },
    {
      title: "SQL LEFT JOIN",
      description: "What does a LEFT JOIN return?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "joins", "left-join"],
      options: ["Only matching records", "All records from left table", "All records from right table", "No records"],
      correctAnswer: 1
    },
    {
      title: "SQL FULL OUTER JOIN",
      description: "Which JOIN returns all records when there is a match in either table?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "joins", "outer-join"],
      options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
      correctAnswer: 3
    },
    {
      title: "SQL RIGHT JOIN",
      description: "What does a RIGHT JOIN return?",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "joins", "right-join"],
      options: ["All records from left table", "All records from right table", "Only matching records", "No records"],
      correctAnswer: 1
    },
    {
      title: "SQL CROSS JOIN",
      description: "What does a CROSS JOIN produce?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "joins", "cross-join"],
      options: ["Inner join", "Outer join", "Cartesian product", "No result"],
      correctAnswer: 2
    },
    {
      title: "SQL JOIN Condition",
      description: "Which keyword specifies the join condition?",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["sql", "joins"],
      options: ["WHERE", "ON", "USING", "BY"],
      correctAnswer: 1
    },
    {
      title: "SQL Self JOIN",
      description: "What is a self join in SQL?",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "joins"],
      options: ["Joining two different tables", "Joining a table with itself", "Creating a new table", "Copying a table"],
      correctAnswer: 1
    }
  ],

  // 20 True/False Questions
  trueFalse: [
    // Basic SQL Concepts (8 questions)
    {
      title: "SQL Primary Key NULL",
      description: "A primary key can contain NULL values.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["sql", "primary-keys", "constraints"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },
    {
      title: "SQL NULL Equality",
      description: "NULL equals NULL in SQL comparisons.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "queries"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },
    {
      title: "SQL Aggregate Functions Without GROUP BY",
      description: "Aggregate functions can be used without GROUP BY.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "aggregates"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "SQL Transaction ROLLBACK",
      description: "A ROLLBACK undoes changes in a transaction.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["sql", "transactions"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "SQL ORDER BY Multiple Columns",
      description: "ORDER BY can sort by multiple columns.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "order-by"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "SQL Index Performance",
      description: "Indexes always improve query performance.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "indexes"],
      options: ["true", "false"],
      correctAnswer: 1 // false - can slow down inserts/updates
    },
    {
      title: "SQL CASE Statement Usage",
      description: "The CASE statement can be used in SELECT clauses only.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "queries"],
      options: ["true", "false"],
      correctAnswer: 1 // false - can be used in WHERE, ORDER BY, etc.
    },
    {
      title: "SQL Views Physical Storage",
      description: "Views store data physically in the database.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "database-design"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },

    // JOIN Operations (6 questions)
    {
      title: "SQL INNER JOIN Matching",
      description: "An INNER JOIN returns only matching records from both tables.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["sql", "joins", "inner-join"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "SQL LEFT JOIN All Records",
      description: "A LEFT JOIN includes all rows from the left table.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "joins", "left-join"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "SQL JOIN Without Condition",
      description: "A JOIN without an ON clause produces a Cartesian product.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "joins", "cross-join"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "SQL Self JOIN Possibility",
      description: "A table can be joined with itself in SQL.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "joins"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "SQL FULL OUTER JOIN Support",
      description: "All database systems support FULL OUTER JOIN.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "joins", "outer-join"],
      options: ["true", "false"],
      correctAnswer: 1 // false - MySQL doesn't support it directly
    },
    {
      title: "SQL JOIN Performance",
      description: "JOINs are always faster than subqueries.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "joins", "subqueries"],
      options: ["true", "false"],
      correctAnswer: 1 // false - depends on the query and indexes
    },

    // Advanced Concepts (6 questions)
    {
      title: "SQL Subquery Multiple Rows",
      description: "Subqueries can return multiple rows when used in a WHERE clause.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "subqueries"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "SQL Foreign Key Reference",
      description: "A foreign key must reference a primary key.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "foreign-keys", "constraints"],
      options: ["true", "false"],
      correctAnswer: 1 // false - can reference any unique key
    },
    {
      title: "SQL GROUP BY Aggregate Requirement",
      description: "GROUP BY can only be used with aggregate functions.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "group-by"],
      options: ["true", "false"],
      correctAnswer: 1 // false
    },
    {
      title: "SQL Transaction Atomicity",
      description: "Transactions ensure atomicity in database operations.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "transactions", "acid-properties"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "SQL HAVING Aggregate Filter",
      description: "The HAVING clause can filter based on aggregate functions.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "having", "aggregates"],
      options: ["true", "false"],
      correctAnswer: 0 // true
    },
    {
      title: "SQL Normalization Benefits",
      description: "Database normalization always improves query performance.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "database-design", "normalization"],
      options: ["true", "false"],
      correctAnswer: 1 // false - can slow down some queries
    }
  ],

  // 15 Fill-in-the-Blank Questions (Syntax Category)
  fillInTheBlank: [
    // Basic Query Structure (5 questions)
    {
      title: "Complete Basic SELECT Query",
      description: "Complete the basic SQL SELECT statement",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "select-statements"],
      codeTemplate: `___blank1___ * ___blank2___ users ___blank3___ age > 25 ___blank4___ age;`,
      blanks: [
        { id: 'blank1', correctAnswers: ['SELECT'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['FROM'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['WHERE'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['ORDER BY'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete JOIN Query",
      description: "Complete the SQL JOIN statement",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "joins", "inner-join"],
      codeTemplate: `SELECT u.name, o.total
___blank1___ users u
___blank2___ orders o ___blank3___ u.id = o.user_id
WHERE o.total > 100;`,
      blanks: [
        { id: 'blank1', correctAnswers: ['FROM'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['INNER JOIN', 'JOIN'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['ON'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete Aggregate Query",
      description: "Complete the SQL aggregate query with GROUP BY",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "aggregates", "group-by"],
      codeTemplate: `SELECT user_id, ___blank1___(*)
FROM orders
___blank2___ user_id
___blank3___ COUNT(*) > 5;`,
      blanks: [
        { id: 'blank1', correctAnswers: ['COUNT'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['GROUP BY'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['HAVING'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete Subquery",
      description: "Complete the SQL subquery statement",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "queries", "subqueries"],
      codeTemplate: `SELECT name
FROM users
WHERE id ___blank1___ (
  SELECT user_id
  FROM orders
  WHERE total ___blank2___ (
    ___blank3___ AVG(total)
    ___blank4___ orders
  )
);`,
      blanks: [
        { id: 'blank1', correctAnswers: ['IN'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['>', 'ABOVE'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['SELECT'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['FROM'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete UPDATE Statement",
      description: "Complete the SQL UPDATE statement with WHERE clause",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "queries"],
      codeTemplate: `___blank1___ products
___blank2___ price = price * 1.1
___blank3___ category = 'electronics'
___blank4___ price > 0;`,
      blanks: [
        { id: 'blank1', correctAnswers: ['UPDATE'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['SET'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['WHERE'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['AND'], caseSensitive: false, points: 1 }
      ]
    },

    // Table Operations (5 questions)
    {
      title: "Complete CREATE TABLE",
      description: "Complete the CREATE TABLE statement with constraints",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "database-design"],
      codeTemplate: `___blank1___ ___blank2___ users (
  id INTEGER ___blank3___ ___blank4___,
  name VARCHAR(100) ___blank5___ NULL,
  email VARCHAR(255) ___blank6___,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
      blanks: [
        { id: 'blank1', correctAnswers: ['CREATE'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['TABLE'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['PRIMARY'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['KEY'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['NOT'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['UNIQUE'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete ALTER TABLE",
      description: "Complete the ALTER TABLE statement to add foreign key",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "foreign-keys", "constraints"],
      codeTemplate: `___blank1___ TABLE orders
___blank2___ ___blank3___ fk_user_id
___blank4___ ___blank5___ (user_id)
___blank6___ users(id);`,
      blanks: [
        { id: 'blank1', correctAnswers: ['ALTER'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['ADD'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['CONSTRAINT'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['FOREIGN'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['KEY'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['REFERENCES'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete CREATE INDEX",
      description: "Complete the CREATE INDEX statement",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["sql", "indexes"],
      codeTemplate: `___blank1___ ___blank2___ idx_user_email
___blank3___ users (___blank4___);`,
      blanks: [
        { id: 'blank1', correctAnswers: ['CREATE'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['INDEX'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['ON'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['email'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Complete Transaction Block",
      description: "Complete the SQL transaction statement",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "transactions"],
      codeTemplate: `___blank1___ TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

___blank2___ (
  ___blank3___;
)
ELSE (
  ___blank4___;
)`,
      blanks: [
        { id: 'blank1', correctAnswers: ['BEGIN', 'START'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['IF'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['COMMIT'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['ROLLBACK'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: "Complete View Creation",
      description: "Complete the CREATE VIEW statement",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["sql", "database-design"],
      codeTemplate: `___blank1___ ___blank2___ active_users ___blank3___ (
  SELECT id, name, email
  FROM users
  WHERE status = 'active'
  AND last_login > NOW() - INTERVAL 30 DAY
);`,
      blanks: [
        { id: 'blank1', correctAnswers: ['CREATE'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['VIEW'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['AS'], caseSensitive: false, points: 2 }
      ]
    }
  ],

  // 10 Code Challenge Questions (Logic Category)
  // 10 Code Challenge Questions (Logic Category) - WITH codeTemplate added
  codeChallenge: [
    {
      title: "Write Basic SELECT Query",
      description: "Write a SQL query to select all users from the 'users' table.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["sql", "queries", "select-statements"],
      codeTemplate: `-- Write your SQL query here
SELECT 
FROM `,
      codeConfig: {
        runtime: 'sql',
        timeoutMs: 3000,
        allowPreview: true
      },
      testCases: [
        {
          name: 'Select all users',
          args: [],
          expected: [
            { id: 1, name: 'Alice', age: 30 },
            { id: 2, name: 'Bob', age: 25 },
            { id: 3, name: 'Charlie', age: 35 }
          ],
          schemaSql: `
          CREATE TABLE users (id INTEGER, name TEXT, age INTEGER);
          INSERT INTO users VALUES (1, 'Alice', 30);
          INSERT INTO users VALUES (2, 'Bob', 25);
          INSERT INTO users VALUES (3, 'Charlie', 35);
        `,
          expectedRows: [
            { id: 1, name: 'Alice', age: 30 },
            { id: 2, name: 'Bob', age: 25 },
            { id: 3, name: 'Charlie', age: 35 }
          ],
          hidden: false,
          orderMatters: false
        }
      ]
    },
    {
      title: "Filter Users by Age",
      description: "Write a SQL query to select users older than 25 from the 'users' table.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["sql", "queries", "where-clauses"],
      codeTemplate: `-- Write your SQL query here
-- Remember to filter users older than 25
SELECT 
FROM 
WHERE `,
      codeConfig: {
        runtime: 'sql',
        timeoutMs: 3000,
        allowPreview: true
      },
      testCases: [
        {
          name: 'Users older than 25',
          args: [],
          expected: [
            { id: 1, name: 'Alice', age: 30 },
            { id: 3, name: 'Charlie', age: 28 },
            { id: 4, name: 'Diana', age: 35 }
          ],
          schemaSql: `
          CREATE TABLE users (id INTEGER, name TEXT, age INTEGER);
          INSERT INTO users VALUES (1, 'Alice', 30);
          INSERT INTO users VALUES (2, 'Bob', 22);
          INSERT INTO users VALUES (3, 'Charlie', 28);
          INSERT INTO users VALUES (4, 'Diana', 35);
        `,
          expectedRows: [
            { id: 1, name: 'Alice', age: 30 },
            { id: 3, name: 'Charlie', age: 28 },
            { id: 4, name: 'Diana', age: 35 }
          ],
          hidden: false,
          orderMatters: false
        }
      ]
    },
    {
      title: "Join Users and Orders",
      description: "Write a SQL query to join 'users' and 'orders' tables showing user names and order totals.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["sql", "joins", "inner-join"],
      codeTemplate: `-- Write your SQL query here
-- Join users and orders tables
SELECT 
FROM 
JOIN  ON `,
      codeConfig: {
        runtime: 'sql',
        timeoutMs: 3000,
        allowPreview: true
      },
      testCases: [
        {
          name: 'Join users and orders',
          args: [],
          expected: [
            { name: 'Alice', total: 100.50 },
            { name: 'Alice', total: 75.25 },
            { name: 'Bob', total: 200.00 }
          ],
          schemaSql: `
          CREATE TABLE users (id INTEGER, name TEXT);
          CREATE TABLE orders (id INTEGER, user_id INTEGER, total DECIMAL);
          INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie');
          INSERT INTO orders VALUES (1, 1, 100.50), (2, 1, 75.25), (3, 2, 200.00);
        `,
          expectedRows: [
            { name: 'Alice', total: 100.50 },
            { name: 'Alice', total: 75.25 },
            { name: 'Bob', total: 200.00 }
          ],
          hidden: false,
          orderMatters: false
        }
      ]
    },
    {
      title: "Count Orders per User",
      description: "Write a SQL query to count the number of orders for each user.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["sql", "queries", "aggregates", "group-by"],
      codeTemplate: `-- Write your SQL query here
-- Count orders for each user
SELECT 
FROM 
JOIN  ON 
GROUP BY `,
      codeConfig: {
        runtime: 'sql',
        timeoutMs: 3000,
        allowPreview: true
      },
      testCases: [
        {
          name: 'Count orders per user',
          args: [],
          expected: [
            { name: 'Alice', order_count: 3 },
            { name: 'Bob', order_count: 1 },
            { name: 'Charlie', order_count: 0 }
          ],
          schemaSql: `
          CREATE TABLE users (id INTEGER, name TEXT);
          CREATE TABLE orders (id INTEGER, user_id INTEGER, total DECIMAL);
          INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie');
          INSERT INTO orders VALUES (1, 1, 100), (2, 1, 75), (3, 2, 200), (4, 1, 50);
        `,
          expectedRows: [
            { name: 'Alice', order_count: 3 },
            { name: 'Bob', order_count: 1 },
            { name: 'Charlie', order_count: 0 }
          ],
          hidden: false,
          orderMatters: false
        }
      ]
    },
    {
      title: "Find High-Value Customers",
      description: "Write a SQL query to find users with total orders greater than $150.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["sql", "queries", "aggregates", "having"],
      codeTemplate: `-- Write your SQL query here
-- Find users with total orders > $150
SELECT 
FROM 
JOIN  ON 
GROUP BY 
HAVING `,
      codeConfig: {
        runtime: 'sql',
        timeoutMs: 3000,
        allowPreview: true
      },
      testCases: [
        {
          name: 'High-value customers',
          args: [],
          expected: [
            { name: 'Alice', total_spent: 175 },
            { name: 'Bob', total_spent: 200 }
          ],
          schemaSql: `
          CREATE TABLE users (id INTEGER, name TEXT);
          CREATE TABLE orders (id INTEGER, user_id INTEGER, total DECIMAL);
          INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie');
          INSERT INTO orders VALUES (1, 1, 100), (2, 1, 75), (3, 2, 200), (4, 3, 50);
        `,
          expectedRows: [
            { name: 'Alice', total_spent: 175 },
            { name: 'Bob', total_spent: 200 }
          ],
          hidden: false,
          orderMatters: false
        }
      ]
    },
    {
      title: "Subquery for Active Users",
      description: "Write a SQL query using a subquery to find users who have placed orders.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["sql", "queries", "subqueries"],
      codeTemplate: `-- Write your SQL query here
-- Use a subquery to find users with orders
SELECT 
FROM 
WHERE  IN (
  SELECT 
  FROM 
)`,
      codeConfig: {
        runtime: 'sql',
        timeoutMs: 3000,
        allowPreview: true
      },
      testCases: [
        {
          name: 'Users with orders using subquery',
          args: [],
          expected: [
            { id: 1, name: 'Alice', email: 'alice@email.com' },
            { id: 3, name: 'Charlie', email: 'charlie@email.com' }
          ],
          schemaSql: `
          CREATE TABLE users (id INTEGER, name TEXT, email TEXT);
          CREATE TABLE orders (id INTEGER, user_id INTEGER, total DECIMAL);
          INSERT INTO users VALUES (1, 'Alice', 'alice@email.com'), (2, 'Bob', 'bob@email.com'), (3, 'Charlie', 'charlie@email.com');
          INSERT INTO orders VALUES (1, 1, 100), (2, 3, 200);
        `,
          expectedRows: [
            { id: 1, name: 'Alice', email: 'alice@email.com' },
            { id: 3, name: 'Charlie', email: 'charlie@email.com' }
          ],
          hidden: false,
          orderMatters: false
        }
      ]
    },
    {
      title: "Create Products Table",
      description: "Write a CREATE TABLE statement for a 'products' table with id, name, price, and category columns.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["sql", "database-design"],
      codeTemplate: `-- Write your CREATE TABLE statement here
CREATE TABLE products (
  
);`,
      codeConfig: {
        runtime: 'sql',
        timeoutMs: 3000,
        allowPreview: true
      },
      testCases: [
        {
          name: 'Create products table',
          args: [],
          expected: [],
          schemaSql: '',
          seedSql: '',
          expectedRows: [],
          hidden: false,
          orderMatters: false
        }
      ]
    },
    {
      title: "Update Product Prices",
      description: "Write an UPDATE statement to increase all product prices by 10% for products in the 'electronics' category.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["sql", "queries"],
      codeTemplate: `-- Write your UPDATE statement here
UPDATE 
SET 
WHERE `,
      codeConfig: {
        runtime: 'sql',
        timeoutMs: 3000,
        allowPreview: true
      },
      testCases: [
        {
          name: 'Update electronics prices',
          args: [],
          expected: [],
          schemaSql: `
          CREATE TABLE products (id INTEGER, name TEXT, price DECIMAL, category TEXT);
          INSERT INTO products VALUES (1, 'Laptop', 1000.00, 'electronics');
          INSERT INTO products VALUES (2, 'Book', 20.00, 'books');
          INSERT INTO products VALUES (3, 'Phone', 500.00, 'electronics');
        `,
          expectedRows: [],
          hidden: false,
          orderMatters: false
        }
      ]
    },
    {
      title: "Complex JOIN with Aggregation",
      description: "Write a query to show each user's name, total number of orders, and average order value.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["sql", "joins", "aggregates", "group-by"],
      codeTemplate: `-- Write your SQL query here
-- Show user stats: name, order count, average order value
SELECT 
FROM 
JOIN  ON 
GROUP BY `,
      codeConfig: {
        runtime: 'sql',
        timeoutMs: 3000,
        allowPreview: true
      },
      testCases: [
        {
          name: 'User order statistics',
          args: [],
          expected: [
            { name: 'Alice', order_count: 3, avg_order_value: 200.00 },
            { name: 'Bob', order_count: 1, avg_order_value: 150.00 }
          ],
          schemaSql: `
          CREATE TABLE users (id INTEGER, name TEXT);
          CREATE TABLE orders (id INTEGER, user_id INTEGER, total DECIMAL);
          INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie');
          INSERT INTO orders VALUES (1, 1, 100), (2, 1, 200), (3, 2, 150), (4, 1, 300);
        `,
          expectedRows: [
            { name: 'Alice', order_count: 3, avg_order_value: 200.00 },
            { name: 'Bob', order_count: 1, avg_order_value: 150.00 }
          ],
          hidden: false,
          orderMatters: false
        }
      ]
    },
    {
      title: "Window Function Query",
      description: "Write a query using ROW_NUMBER() to rank users by their total spending.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["sql", "queries", "aggregates"],
      codeTemplate: `-- Write your SQL query here
-- Use window functions to rank users by spending
SELECT 
FROM (
  SELECT 
  FROM 
  JOIN  ON 
  GROUP BY 
) AS user_totals
ORDER BY `,
      codeConfig: {
        runtime: 'sql',
        timeoutMs: 3000,
        allowPreview: true
      },
      testCases: [
        {
          name: 'Rank users by spending',
          args: [],
          expected: [
            { name: 'Bob', total_spent: 500, rank: 1 },
            { name: 'Alice', total_spent: 300, rank: 2 },
            { name: 'Charlie', total_spent: 150, rank: 3 }
          ],
          schemaSql: `
          CREATE TABLE users (id INTEGER, name TEXT);
          CREATE TABLE orders (id INTEGER, user_id INTEGER, total DECIMAL);
          INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie');
          INSERT INTO orders VALUES (1, 1, 100), (2, 1, 200), (3, 2, 500), (4, 3, 150);
        `,
          expectedRows: [
            { name: 'Bob', total_spent: 500, rank: 1 },
            { name: 'Alice', total_spent: 300, rank: 2 },
            { name: 'Charlie', total_spent: 150, rank: 3 }
          ],
          hidden: false,
          orderMatters: true
        }
      ]
    }
  ]
};

async function seedSqlQuestions() {
  const startTime = Date.now();
  const validator = new QuestionSeedValidator();
  const processor = new BatchProcessor({ logProgress: true, batchSize: 15 });

  try {
    console.log('🚀 Starting COMPREHENSIVE SQL question seeding with enhanced validation...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Get super organization and user
    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    console.log(`🏢 Using organization: ${superOrg.name}`);
    console.log(`👤 Using user: ${superUser.name || 'Admin User'}\n`);

    // Count questions by type with enhanced stats
    const questionCounts = Object.entries(sqlQuestions).map(([type, questions]) =>
      `${type}: ${questions.length}`
    ).join(', ');
    const totalQuestions = Object.values(sqlQuestions).reduce((sum, arr) => sum + arr.length, 0);
    const fillInBlankCount = sqlQuestions.fillInTheBlank.length;
    const totalBlanks = sqlQuestions.fillInTheBlank.reduce((sum, q) => sum + q.blanks.length, 0);
    const codeQuestionCount = sqlQuestions.codeChallenge.length;

    console.log(`📊 COMPREHENSIVE Question breakdown: ${questionCounts}`);
    console.log(`📈 Total questions to seed: ${totalQuestions}`);
    console.log(`🔥 Fill-in-blank questions: ${fillInBlankCount} with ${totalBlanks} total blanks`);
    console.log(`💻 Executable code questions: ${codeQuestionCount} with SQL runner integration`);
    console.log(`🎯 Difficulty distribution: Easy, Medium, Hard across all types\n`);

    // Create backup of existing questions
    const backup = await processor.createBackup('sql');

    // Delete existing SQL questions
    await processor.deleteByLanguage('sql');

    // Prepare all questions with proper templates
    console.log('🔧 Preparing questions with templates...');
    const allQuestions = [];

    for (const [type, questions] of Object.entries(sqlQuestions)) {
      console.log(`  Processing ${questions.length} ${type} questions...`);

      for (const questionData of questions) {
        try {
          const templated = QuestionTemplateGenerator.createQuestionTemplate(
            { ...questionData, type, language: 'sql', status: 'active' },
            superOrg._id,
            superUser._id
          );
          allQuestions.push(templated);
        } catch (error) {
          console.error(`  ❌ Template generation failed for "${questionData.title}": ${error.message}`);
        }
      }
    }

    console.log(`📊 Generated ${allQuestions.length} templated questions\n`);

    // Enhanced validation with comprehensive testing
    console.log('🔍 Running COMPREHENSIVE validation with SQL runner testing...');
    const validationResults = await validator.validateBatch(allQuestions, {
      testAutoGrading: true // Includes SQL runner validation for logic questions
    });

    console.log('');
    validator.printValidationSummary();
    console.log('');

    // Insert valid questions
    if (validationResults.validQuestions.length > 0) {
      console.log(`📦 Inserting ${validationResults.validQuestions.length} valid questions...`);
      const insertResults = await processor.insertBatch(validationResults.validQuestions);

      processor.printProcessingSummary(insertResults, 'SQL');

      // Verify insertions
      if (insertResults.insertedIds.length > 0) {
        const verification = await processor.verifyInsertedQuestions(insertResults.insertedIds);
        console.log(`\n🔍 Verification: ${verification.found}/${insertResults.insertedIds.length} questions found in database`);
      }

      // Comprehensive success reporting
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n🎉 COMPREHENSIVE SQL question seeding completed successfully!');
      console.log(`📈 Final count: ${insertResults.success} questions inserted`);
      console.log(`⏱️  Total time: ${duration} seconds`);
      console.log(`🚀 Performance: ${(insertResults.success / parseFloat(duration)).toFixed(1)} questions/second`);

      // Enhanced validation breakdown
      if (validationResults.summary) {
        console.log(`\n📊 Validation Results:`);
        console.log(`   ✅ Valid: ${validationResults.summary.valid}/${validationResults.summary.total} (${((validationResults.summary.valid / validationResults.summary.total) * 100).toFixed(1)}%)`);
        console.log(`   ❌ Invalid: ${validationResults.summary.invalid}/${validationResults.summary.total}`);
        console.log(`   ⚠️  With Warnings: ${validationResults.summary.warnings}`);
      }

      // Show detailed question type breakdown
      const insertedByType = {};
      allQuestions.forEach(q => {
        insertedByType[q.type] = (insertedByType[q.type] || 0) + 1;
      });

      console.log(`\n🎯 Question Type Breakdown:`);
      Object.entries(insertedByType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} questions`);
      });

      // Show invalid questions if any
      if (validationResults.invalidQuestions.length > 0) {
        console.log(`\n❌ ${validationResults.invalidQuestions.length} questions failed validation:`);
        validationResults.invalidQuestions.forEach(({ question, result }) => {
          console.log(`   - ${question.title}: ${result.errors.join(', ')}`);
        });
      }

      // Return the inserted questions for the master script
      return await Question.find({ language: 'sql' }).select('_id title type');

    } else {
      console.log('❌ No valid questions to insert');

      // Restore backup if available
      if (backup) {
        console.log('🔄 Restoring from backup...');
        await processor.restoreFromBackup(backup);
      }

      return [];
    }

  } catch (error) {
    console.error('💥 SQL seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedSqlQuestions()
    .then((questions) => {
      console.log(`\n🎉 SUCCESS! Seeded ${questions.length} comprehensive SQL questions with enhanced validation!`);
      console.log(`🔥 Ready for production use with robust SQL runner integration!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed SQL questions:', error);
      process.exit(1);
    });
}

module.exports = { seedSqlQuestions, sqlQuestions };