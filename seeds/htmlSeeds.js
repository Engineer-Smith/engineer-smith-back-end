const mongoose = require('mongoose');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
require('dotenv').config();

const htmlQuestions = {
  multipleChoice: [
    {
      title: "HTML5 Semantic Elements",
      description: "Which of these is a semantic HTML5 element?",
      options: ["", "<header>", "<div>", "<span>", "<bold>"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML Document Structure",
      description: "Which element should contain all visible content of an HTML page?",
      options: ["", "<html>", "<head>", "<body>", "<main>"],
      correctAnswer: 3,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML Input Types",
      description: "Which input type is used for email addresses?",
      options: ["", "text", "email", "mail", "address"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML Attributes",
      description: "Which attribute specifies an alternate text for an image?",
      options: ["", "title", "alt", "description", "text"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML Lists",
      description: "Which element is used for an ordered list?",
      options: ["", "<ul>", "<ol>", "<list>", "<order>"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML Tables",
      description: "Which element represents a table header cell?",
      options: ["", "<td>", "<th>", "<header>", "<thead>"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML Links",
      description: "Which attribute in an <a> tag specifies the URL?",
      options: ["", "src", "href", "link", "url"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML Meta Tags",
      description: "Which meta tag sets the character encoding?",
      options: ["", "<meta charset=\"UTF-8\">", "<meta encoding=\"UTF-8\">", "<meta type=\"UTF-8\">", "<meta lang=\"UTF-8\">"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML5 Article Element",
      description: "What is the <article> element used for?",
      options: ["", "Navigation links", "Independent, self-contained content", "Page footer", "Side content"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML Form Methods",
      description: "Which HTTP method is default for HTML forms?",
      options: ["", "POST", "GET", "PUT", "DELETE"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML5 Video Element",
      description: "Which attribute makes a video start playing automatically?",
      options: ["", "autostart", "autoplay", "auto", "play"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML Void Elements",
      description: "Which of these is a void element (self-closing)?",
      options: ["", "<div>", "<p>", "<br>", "<span>"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML Accessibility",
      description: "Which attribute provides accessible labels for form elements?",
      options: ["", "title", "label", "for", "aria-label"],
      correctAnswer: 4,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML5 Canvas",
      description: "What is the <canvas> element used for?",
      options: ["", "Displaying images", "Drawing graphics with JavaScript", "Creating animations", "All of the above"],
      correctAnswer: 4,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML Doctype",
      description: "What is the correct HTML5 doctype declaration?",
      options: ["", "<!DOCTYPE html>", "<!DOCTYPE HTML5>", "<DOCTYPE html>", "<!DOC html>"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["html"]
    }
  ],
  trueFalse: [
    {
      title: "HTML Case Sensitivity",
      description: "HTML tags are case-sensitive.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML Form Validation",
      description: "The 'required' attribute provides client-side form validation in HTML5.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML Nesting Rules",
      description: "Block-level elements can contain inline elements.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML Comments",
      description: "HTML comments are visible to users in the browser.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML5 New Elements",
      description: "HTML5 introduced new semantic elements like <section> and <article>.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML Attribute Quotes",
      description: "Attribute values in HTML must always be enclosed in quotes.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML Image Loading",
      description: "Images with missing 'src' attributes will show broken image icons.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML Form Action",
      description: "A form without an 'action' attribute submits to the current page.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML Element IDs",
      description: "Multiple elements can have the same ID attribute value.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML Whitespace",
      description: "Multiple consecutive spaces in HTML are collapsed into a single space.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML5 Audio Support",
      description: "All browsers support the same audio formats in HTML5.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML Table Accessibility",
      description: "The <caption> element improves table accessibility.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML Script Tag",
      description: "Scripts in the <head> block page rendering until they load.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "HTML5 Validation",
      description: "HTML5 provides built-in form validation without JavaScript.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "HTML Meta Viewport",
      description: "The viewport meta tag is required for responsive web design.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["html"]
    }
  ],
  codeChallenge: [
    {
      title: "Create Basic HTML Structure",
      description: "Create a complete HTML5 document with proper structure including doctype, html, head, and body elements.",
      options: ["<!-- Write your HTML here -->"],
      testCases: [
        { input: "Valid HTML5 document", output: "Proper structure with doctype", hidden: false },
        { input: "Head section", output: "Contains title and meta charset", hidden: false },
        { input: "Body section", output: "Contains main content", hidden: true }
      ],
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "Create Contact Form",
      description: "Create an HTML form with fields for name, email, phone, and message.",
      options: ["<!-- Create contact form here -->\n<form>\n  <!-- Your form fields here -->\n</form>"],
      testCases: [
        { input: "Form with all fields", output: "Name, email, phone, message fields", hidden: false },
        { input: "Proper input types", output: "Email input has type='email'", hidden: false },
        { input: "Submit button", output: "Form has submit button", hidden: true }
      ],
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "Create Navigation Menu",
      description: "Create a semantic navigation menu with links to Home, About, Services, and Contact pages.",
      options: ["<!-- Create navigation menu here -->"],
      testCases: [
        { input: "Semantic nav element", output: "Uses <nav> element", hidden: false },
        { input: "Unordered list", output: "Links in <ul> structure", hidden: false },
        { input: "Four menu items", output: "Home, About, Services, Contact", hidden: true }
      ],
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "Create Data Table",
      description: "Create an HTML table displaying student information with columns for Name, Age, Grade, and Subject.",
      options: ["<!-- Create table here -->\n<table>\n  <!-- Your table content here -->\n</table>"],
      testCases: [
        { input: "Table with headers", output: "Uses <th> elements", hidden: false },
        { input: "Multiple rows", output: "At least 3 student records", hidden: false },
        { input: "Proper structure", output: "Uses thead, tbody elements", hidden: true }
      ],
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "Create Article Layout",
      description: "Create a semantic HTML5 article with header, main content, and footer sections.",
      options: ["<!-- Create article layout here -->"],
      testCases: [
        { input: "Article element", output: "Uses <article> tag", hidden: false },
        { input: "Header section", output: "Contains title and metadata", hidden: false },
        { input: "Footer section", output: "Contains author or date info", hidden: true }
      ],
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "Create Image Gallery",
      description: "Create an HTML structure for an image gallery with 6 images, each with alt text and captions.",
      options: ["<!-- Create image gallery here -->"],
      testCases: [
        { input: "Six images", output: "Contains 6 <img> elements", hidden: false },
        { input: "Alt attributes", output: "All images have alt text", hidden: false },
        { input: "Figure captions", output: "Uses <figure> and <figcaption>", hidden: true }
      ],
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "Create Accessible Form",
      description: "Create a registration form with proper labels, fieldsets, and accessibility features.",
      options: ["<!-- Create accessible form here -->"],
      testCases: [
        { input: "Label associations", output: "Labels properly associated with inputs", hidden: false },
        { input: "Fieldset grouping", output: "Related fields in fieldsets", hidden: false },
        { input: "Required indicators", output: "Required fields marked", hidden: true }
      ],
      difficulty: "hard",
      tags: ["html"]
    },
    {
      title: "Create Video Player",
      description: "Create an HTML5 video player with multiple source formats and fallback content.",
      options: ["<!-- Create video player here -->"],
      testCases: [
        { input: "Video element", output: "Uses <video> tag", hidden: false },
        { input: "Multiple sources", output: "MP4 and WebM sources", hidden: false },
        { input: "Controls and fallback", output: "Has controls and fallback text", hidden: true }
      ],
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "Create Product Card",
      description: "Create an HTML structure for a product card with image, title, price, description, and buy button.",
      options: ["<!-- Create product card here -->"],
      testCases: [
        { input: "Product image", output: "Contains product image", hidden: false },
        { input: "Price display", output: "Shows product price", hidden: false },
        { input: "Action button", output: "Has buy/add to cart button", hidden: true }
      ],
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "Create Blog Post",
      description: "Create semantic HTML for a blog post with title, author, date, content, and tags.",
      options: ["<!-- Create blog post here -->"],
      testCases: [
        { input: "Article structure", output: "Uses semantic HTML5 elements", hidden: false },
        { input: "Metadata", output: "Includes author and publication date", hidden: false },
        { input: "Tag list", output: "Contains list of topic tags", hidden: true }
      ],
      difficulty: "hard",
      tags: ["html"]
    }
  ],
  codeDebugging: [
    {
      title: "Fix HTML Structure",
      description: "This HTML has structural issues. Fix the markup to be valid HTML5.",
      options: ["<html>\n<head>\n  <title>My Page\n</head>\n<body>\n  <h1>Welcome</h1>\n  <p>This is a paragraph.\n  <div>Content here</div>\n</body>"],
      testCases: [
        { input: "Valid HTML5 structure", output: "All tags properly closed", hidden: false },
        { input: "Proper nesting", output: "Elements correctly nested", hidden: false },
        { input: "Complete structure", output: "Missing closing tags added", hidden: true }
      ],
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "Fix Form Issues",
      description: "This form has several accessibility and structural problems. Fix them.",
      options: ["<form>\n  <input type=\"text\" placeholder=\"Enter your name\">\n  <input type=\"text\" placeholder=\"Enter your email\">\n  <input type=\"text\" placeholder=\"Enter your phone\">\n  <button>Submit</button>\n</form>"],
      testCases: [
        { input: "Proper labels", output: "All inputs have associated labels", hidden: false },
        { input: "Correct input types", output: "Email and phone use proper types", hidden: false },
        { input: "Form accessibility", output: "Form is accessible to screen readers", hidden: true }
      ],
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "Fix Table Structure",
      description: "This table has incorrect structure. Fix it to be semantically correct.",
      options: ["<table>\n  <td>Name</td><td>Age</td><td>City</td>\n  <td>John</td><td>25</td><td>NYC</td>\n  <td>Jane</td><td>30</td><td>LA</td>\n</table>"],
      testCases: [
        { input: "Proper headers", output: "Uses <th> for header cells", hidden: false },
        { input: "Row structure", output: "Proper <tr> elements", hidden: false },
        { input: "Table sections", output: "Uses <thead> and <tbody>", hidden: true }
      ],
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "Fix Image Issues",
      description: "These images have accessibility and performance issues. Fix them.",
      options: ["<img src=\"large-image.jpg\">\n<img src=\"photo.png\" title=\"A beautiful sunset\">\n<img src=\"\" alt=\"Profile picture\">"],
      testCases: [
        { input: "Alt attributes", output: "All images have descriptive alt text", hidden: false },
        { input: "Valid sources", output: "No empty src attributes", hidden: false },
        { input: "Proper attributes", output: "Uses alt instead of title for descriptions", hidden: true }
      ],
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "Fix Link Issues",
      description: "These links have various problems. Fix them for better usability and security.",
      options: ["<a href=\"http://external-site.com\">Visit External Site</a>\n<a href=\"#\">Click here</a>\n<a href=\"mailto:contact@example.com\">Email</a>"],
      testCases: [
        { input: "External link security", output: "External links have rel='noopener'", hidden: false },
        { input: "Descriptive text", output: "Links have meaningful text", hidden: false },
        { input: "Proper href values", output: "No empty or '#' href values", hidden: true }
      ],
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "Fix List Structure",
      description: "This list structure is incorrect. Fix it to be semantically proper.",
      options: ["<ul>\n  Item 1\n  <li>Item 2\n  <li>Item 3</li>\n  Item 4\n</ul>"],
      testCases: [
        { input: "All items in <li>", output: "Every list item wrapped in <li> tags", hidden: false },
        { input: "Proper nesting", output: "No text directly in <ul>", hidden: false },
        { input: "Closed tags", output: "All <li> tags properly closed", hidden: true }
      ],
      difficulty: "easy",
      tags: ["html"]
    },
    {
      title: "Fix Meta Tags",
      description: "This HTML head section is missing important meta tags and has incorrect ones.",
      options: ["<head>\n  <title></title>\n  <meta charset=\"utf-7\">\n  <meta name=\"viewport\" content=\"width=device\">\n</head>"],
      testCases: [
        { input: "Proper charset", output: "Uses UTF-8 encoding", hidden: false },
        { input: "Complete viewport", output: "Proper viewport meta tag", hidden: false },
        { input: "Page title", output: "Title tag has content", hidden: true }
      ],
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "Fix Semantic Issues",
      description: "This layout uses divs where semantic elements would be better. Fix it.",
      options: ["<div class=\"header\">\n  <div class=\"nav\">Navigation</div>\n</div>\n<div class=\"main\">\n  <div class=\"article\">Article content</div>\n</div>\n<div class=\"footer\">Footer</div>"],
      testCases: [
        { input: "Semantic elements", output: "Uses <header>, <nav>, <main>, <article>, <footer>", hidden: false },
        { input: "Proper structure", output: "Maintains layout hierarchy", hidden: false },
        { input: "Accessibility improvement", output: "Better for screen readers", hidden: true }
      ],
      difficulty: "hard",
      tags: ["html"]
    },
    {
      title: "Fix Button Issues",
      description: "These buttons have accessibility and functionality problems. Fix them.",
      options: ["<div onclick=\"submitForm()\">Submit</div>\n<button type=\"submit\" disabled>Send</button>\n<a href=\"#\" onclick=\"openModal()\">Open Modal</a>"],
      testCases: [
        { input: "Proper button elements", output: "Uses <button> for actions", hidden: false },
        { input: "Keyboard accessibility", output: "All interactive elements keyboard accessible", hidden: false },
        { input: "Semantic correctness", output: "Right elements for right purposes", hidden: true }
      ],
      difficulty: "medium",
      tags: ["html"]
    },
    {
      title: "Fix Nested Form Elements",
      description: "This form has improper nesting and structure. Fix the issues.",
      options: ["<form>\n  <form>\n    <input type=\"text\" name=\"username\">\n  </form>\n  <fieldset>\n    <input type=\"password\" name=\"password\">\n    <legend>Login Details</legend>\n  </fieldset>\n</form>"],
      testCases: [
        { input: "No nested forms", output: "Forms cannot be nested", hidden: false },
        { input: "Proper fieldset order", output: "Legend comes first in fieldset", hidden: false },
        { input: "Valid form structure", output: "Semantically correct form", hidden: true }
      ],
      difficulty: "hard",
      tags: ["html"]
    }
  ]
};

async function seedHtmlQuestions() {
  try {
    console.log('Seeding HTML questions...');

    await mongoose.connect(process.env.MONGO_URL);

    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    await Question.deleteMany({ language: 'html' });

    const allQuestions = [];

    ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'].forEach(type => {
      htmlQuestions[type].forEach(q => {
        allQuestions.push({
          ...q,
          type,
          language: 'html',
          status: 'draft',
          isGlobal: true,
          organizationId: superOrg._id,
          createdBy: superUser._id
        });
      });
    });

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} HTML questions`);
    console.log(`   - Multiple Choice: ${htmlQuestions.multipleChoice.length}`);
    console.log(`   - True/False: ${htmlQuestions.trueFalse.length}`);
    console.log(`   - Code Challenge: ${htmlQuestions.codeChallenge.length}`);
    console.log(`   - Code Debugging: ${htmlQuestions.codeDebugging.length}`);

    return inserted;
  } catch (error) {
    console.error('Error seeding HTML questions:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedHtmlQuestions()
    .then(() => {
      console.log('HTML questions seeded successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed HTML questions:', error);
      process.exit(1);
    });
}

module.exports = { seedHtmlQuestions, htmlQuestions };