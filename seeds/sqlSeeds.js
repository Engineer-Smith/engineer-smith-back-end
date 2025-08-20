const mongoose = require('mongoose');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
require('dotenv').config();

const sqlQuestions = {
  multipleChoice: [
    {
      title: "SQL SELECT",
      description: "Which keyword is used to retrieve data from a database?",
      options: ["", "GET", "SELECT", "FETCH", "RETRIEVE"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL WHERE Clause",
      description: "Which clause filters records in a SQL query?",
      options: ["", "FROM", "WHERE", "HAVING", "FILTER"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL JOIN Types",
      description: "Which JOIN returns all records when there is a match in either table?",
      options: ["", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
      correctAnswer: 4,
      difficulty: "medium",
      tags: ["sql", "joins"]
    },
    {
      title: "SQL Primary Key",
      description: "What is the main purpose of a primary key?",
      options: ["", "Sort data", "Uniquely identify records", "Store data", "Index data"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["sql"]
    },
    {
      title: "SQL Aggregate Functions",
      description: "Which function calculates the average of a column?",
      options: ["", "SUM()", "AVG()", "COUNT()", "MAX()"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL ORDER BY",
      description: "Which keyword sorts query results?",
      options: ["", "GROUP BY", "ORDER BY", "SORT BY", "ARRANGE BY"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL GROUP BY",
      description: "Which clause groups rows with the same values in SQL?",
      options: ["", "HAVING", "GROUP BY", "WHERE", "CLUSTER BY"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL Constraints",
      description: "Which constraint ensures unique values in a column?",
      options: ["", "PRIMARY KEY", "FOREIGN KEY", "UNIQUE", "CHECK"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "SQL Subqueries",
      description: "Where can a subquery be used in a SQL statement?",
      options: ["", "SELECT only", "WHERE only", "FROM only", "Multiple clauses"],
      correctAnswer: 4,
      difficulty: "medium",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL Indexes",
      description: "What is the primary benefit of an index in SQL?",
      options: ["", "Data storage", "Query performance", "Data validation", "Data encryption"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "SQL NULL",
      description: "Which operator checks for NULL values in SQL?",
      options: ["", "=", "IS", "!=", "<>"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL Transactions",
      description: "Which command commits a transaction in SQL?",
      options: ["", "SAVE", "COMMIT", "END", "APPLY"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "SQL HAVING Clause",
      description: "Which clause filters grouped results in SQL?",
      options: ["", "WHERE", "GROUP BY", "HAVING", "FILTER"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL Foreign Key",
      description: "What does a foreign key enforce?",
      options: ["", "Unique values", "Referential integrity", "Data sorting", "Data encryption"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "SQL CASE Statement",
      description: "Which statement provides conditional logic in SQL?",
      options: ["", "IF", "CASE", "SWITCH", "WHEN"],
      correctAnswer: 2,
      difficulty: "hard",
      tags: ["sql", "queries"]
    }
  ],
  trueFalse: [
    {
      title: "SQL Primary Key",
      description: "A primary key can contain NULL values.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["sql"]
    },
    {
      title: "SQL Joins",
      description: "An INNER JOIN returns only matching records from both tables.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["sql", "joins"]
    },
    {
      title: "SQL NULL",
      description: "NULL equals NULL in SQL comparisons.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL Aggregate Functions",
      description: "Aggregate functions can be used without GROUP BY.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL Indexes",
      description: "Indexes always improve query performance.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "SQL Transactions",
      description: "A ROLLBACK undoes changes in a transaction.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["sql"]
    },
    {
      title: "SQL Subqueries",
      description: "Subqueries can return multiple rows when used in a WHERE clause.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL Constraints",
      description: "A foreign key must reference a primary key.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "SQL GROUP BY",
      description: "GROUP BY can only be used with aggregate functions.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL ORDER BY",
      description: "ORDER BY can sort by multiple columns.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL CASE",
      description: "The CASE statement can be used in SELECT clauses only.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["sql", "queries"]
    },
    {
      title: "SQL Views",
      description: "Views store data physically in the database.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "SQL Joins",
      description: "A LEFT JOIN includes all rows from the left table.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["sql", "joins"]
    },
    {
      title: "SQL Transactions",
      description: "Transactions ensure atomicity in database operations.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "SQL HAVING",
      description: "The HAVING clause can filter based on aggregate functions.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["sql", "queries"]
    }
  ],
  codeChallenge: [
    {
      title: "Write a SELECT Query",
      description: "Write a SQL query to select all columns from a 'users' table.",
      options: ["-- Your code here"],
      testCases: [
        { input: "Table exists", output: "SELECT * FROM users", hidden: false },
        { input: "Correct syntax", output: "Uses SELECT and FROM", hidden: false },
        { input: "All columns", output: "Retrieves all columns", hidden: true }
      ],
      difficulty: "easy",
      tags: ["sql", "queries"]
    },
    {
      title: "Filter with WHERE",
      description: "Write a SQL query to select users older than 25 from a 'users' table.",
      options: ["-- Your code here"],
      testCases: [
        { input: "WHERE clause", output: "Filters age > 25", hidden: false },
        { input: "Table reference", output: "Uses users table", hidden: false },
        { input: "Correct syntax", output: "Valid SQL syntax", hidden: true }
      ],
      difficulty: "easy",
      tags: ["sql", "queries"]
    },
    {
      title: "Join Tables",
      description: "Write a SQL query to join 'users' and 'orders' tables on user_id.",
      options: ["-- Your code here"],
      testCases: [
        { input: "JOIN clause", output: "Uses INNER JOIN", hidden: false },
        { input: "Join condition", output: "Joins on user_id", hidden: false },
        { input: "Correct output", output: "Returns matching records", hidden: true }
      ],
      difficulty: "medium",
      tags: ["sql", "joins"]
    },
    {
      title: "Aggregate Function",
      description: "Write a SQL query to count the number of orders per user.",
      options: ["-- Your code here"],
      testCases: [
        { input: "Aggregate function", output: "Uses COUNT()", hidden: false },
        { input: "GROUP BY", output: "Groups by user_id", hidden: false },
        { input: "Correct count", output: "Returns user counts", hidden: true }
      ],
      difficulty: "medium",
      tags: ["sql", "queries"]
    },
    {
      title: "Create a Table",
      description: "Write a SQL statement to create a 'products' table with id, name, and price.",
      options: ["-- Your code here"],
      testCases: [
        { input: "Table creation", output: "Uses CREATE TABLE", hidden: false },
        { input: "Columns", output: "Defines id, name, price", hidden: false },
        { input: "Data types", output: "Uses appropriate types", hidden: true }
      ],
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "Write a Subquery",
      description: "Write a SQL query to find users with more than 5 orders using a subquery.",
      options: ["-- Your code here"],
      testCases: [
        { input: "Subquery", output: "Uses subquery in WHERE", hidden: false },
        { input: "Counting orders", output: "Counts orders > 5", hidden: false },
        { input: "Correct results", output: "Returns matching users", hidden: true }
      ],
      difficulty: "hard",
      tags: ["sql", "queries"]
    },
    {
      title: "Update Records",
      description: "Write a SQL query to update the price of a product by ID.",
      options: ["-- Your code here"],
      testCases: [
        { input: "UPDATE statement", output: "Uses UPDATE products", hidden: false },
        { input: "WHERE clause", output: "Filters by ID", hidden: false },
        { input: "Price update", output: "Sets new price", hidden: true }
      ],
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "Delete Records",
      description: "Write a SQL query to delete inactive users from a 'users' table.",
      options: ["-- Your code here"],
      testCases: [
        { input: "DELETE statement", output: "Uses DELETE FROM users", hidden: false },
        { input: "WHERE clause", output: "Filters inactive users", hidden: false },
        { input: "Correct deletion", output: "Removes matching records", hidden: true }
      ],
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "Create an Index",
      description: "Write a SQL statement to create an index on the 'email' column of a 'users' table.",
      options: ["-- Your code here"],
      testCases: [
        { input: "Index creation", output: "Uses CREATE INDEX", hidden: false },
        { input: "Column reference", output: "Indexes email column", hidden: false },
        { input: "Correct syntax", output: "Valid index syntax", hidden: true }
      ],
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "Write a Transaction",
      description: "Write a SQL transaction to transfer money between two accounts.",
      options: ["-- Your code here"],
      testCases: [
        { input: "Transaction start", output: "Uses BEGIN TRANSACTION", hidden: false },
        { input: "Updates", output: "Updates both accounts", hidden: false },
        { input: "Commit or rollback", output: "Uses COMMIT or ROLLBACK", hidden: true }
      ],
      difficulty: "hard",
      tags: ["sql"]
    }
  ],
  codeDebugging: [
    {
      title: "Fix SELECT Query",
      description: "This query returns all columns unnecessarily. Optimize it to select specific columns.",
      options: ["SELECT * FROM users WHERE age > 25"],
      testCases: [
        { input: "Column selection", output: "Selects specific columns", hidden: false },
        { input: "WHERE clause", output: "Maintains age filter", hidden: false },
        { input: "Optimized query", output: "Reduces data retrieval", hidden: true }
      ],
      difficulty: "easy",
      tags: ["sql", "queries"]
    },
    {
      title: "Fix JOIN Syntax",
      description: "This JOIN query has incorrect syntax. Fix the join condition.",
      options: ["SELECT * FROM users, orders WHERE users.id = orders.user_id"],
      testCases: [
        { input: "JOIN clause", output: "Uses explicit INNER JOIN", hidden: false },
        { input: "Join condition", output: "Correctly joins on user_id", hidden: false },
        { input: "Correct results", output: "Returns matching records", hidden: true }
      ],
      difficulty: "medium",
      tags: ["sql", "joins"]
    },
    {
      title: "Fix GROUP BY Error",
      description: "This GROUP BY query is incorrect. Fix the aggregation.",
      options: ["SELECT user_id, COUNT(*) FROM orders"],
      testCases: [
        { input: "GROUP BY clause", output: "Adds GROUP BY user_id", hidden: false },
        { input: "Aggregation", output: "Counts orders correctly", hidden: false },
        { input: "Correct results", output: "Groups by user_id", hidden: true }
      ],
      difficulty: "medium",
      tags: ["sql", "queries"]
    },
    {
      title: "Fix WHERE Clause",
      description: "This WHERE clause uses incorrect logic. Fix the condition.",
      options: ["SELECT * FROM products WHERE price = 0"],
      testCases: [
        { input: "Condition fix", output: "Uses price > 0 or similar", hidden: false },
        { input: "Query structure", output: "Maintains SELECT and FROM", hidden: false },
        { input: "Correct filtering", output: "Returns non-zero prices", hidden: true }
      ],
      difficulty: "easy",
      tags: ["sql", "queries"]
    },
    {
      title: "Fix Subquery",
      description: "This subquery returns incorrect results. Fix the subquery logic.",
      options: ["SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE total = 0)"],
      testCases: [
        { input: "Subquery fix", output: "Corrects total > 0", hidden: false },
        { input: "WHERE clause", output: "Maintains IN clause", hidden: false },
        { input: "Correct results", output: "Returns valid users", hidden: true }
      ],
      difficulty: "hard",
      tags: ["sql", "queries"]
    },
    {
      title: "Fix Table Creation",
      description: "This CREATE TABLE statement has invalid syntax. Fix it.",
      options: ["CREATE TABLE products (id, name, price)"],
      testCases: [
        { input: "Column types", output: "Adds data types", hidden: false },
        { input: "Table structure", output: "Defines id, name, price", hidden: false },
        { input: "Valid syntax", output: "Creates table correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "Fix UPDATE Query",
      description: "This UPDATE query lacks a WHERE clause. Fix it to update specific records.",
      options: ["UPDATE users SET active = 1"],
      testCases: [
        { input: "WHERE clause", output: "Adds condition", hidden: false },
        { input: "UPDATE syntax", output: "Maintains SET clause", hidden: false },
        { input: "Specific update", output: "Updates only matching records", hidden: true }
      ],
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "Fix DELETE Query",
      description: "This DELETE query deletes too many records. Fix it with a condition.",
      options: ["DELETE FROM orders"],
      testCases: [
        { input: "WHERE clause", output: "Adds condition", hidden: false },
        { input: "DELETE syntax", output: "Maintains DELETE FROM", hidden: false },
        { input: "Specific deletion", output: "Deletes only matching records", hidden: true }
      ],
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "Fix Index Creation",
      description: "This index creation statement is incorrect. Fix the syntax.",
      options: ["INDEX email_index ON users(email)"],
      testCases: [
        { input: "CREATE INDEX", output: "Uses CREATE INDEX", hidden: false },
        { input: "Column reference", output: "Indexes email column", hidden: false },
        { input: "Valid syntax", output: "Creates index correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["sql"]
    },
    {
      title: "Fix Transaction",
      description: "This transaction lacks proper structure. Fix the transaction syntax.",
      options: ["UPDATE accounts SET balance = balance - 100 WHERE id = 1; UPDATE accounts SET balance = balance + 100 WHERE id = 2"],
      testCases: [
        { input: "Transaction start", output: "Uses BEGIN TRANSACTION", hidden: false },
        { input: "Updates", output: "Updates both accounts", hidden: false },
        { input: "Commit or rollback", output: "Uses COMMIT or ROLLBACK", hidden: true }
      ],
      difficulty: "hard",
      tags: ["sql"]
    }
  ]
};

async function seedSqlQuestions() {
  try {
    console.log('Seeding SQL questions...');

    await mongoose.connect(process.env.MONGO_URL);

    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    await Question.deleteMany({ language: 'sql' });

    const allQuestions = [];

    ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'].forEach(type => {
      sqlQuestions[type].forEach(q => {
        allQuestions.push({
          ...q,
          type,
          language: 'sql',
          status: 'draft',
          isGlobal: true,
          organizationId: superOrg._id,
          createdBy: superUser._id
        });
      });
    });

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} SQL questions`);
    console.log(`   - Multiple Choice: ${sqlQuestions.multipleChoice.length}`);
    console.log(`   - True/False: ${sqlQuestions.trueFalse.length}`);
    console.log(`   - Code Challenge: ${sqlQuestions.codeChallenge.length}`);
    console.log(`   - Code Debugging: ${sqlQuestions.codeDebugging.length}`);

    return inserted;
  } catch (error) {
    console.error('Error seeding SQL questions:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedSqlQuestions()
    .then(() => {
      console.log('SQL questions seeded successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed SQL questions:', error);
      process.exit(1);
    });
}

module.exports = { seedSqlQuestions, sqlQuestions };