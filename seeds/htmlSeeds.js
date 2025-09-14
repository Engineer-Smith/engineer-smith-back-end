// seeds/htmlSeeds.js - Comprehensive HTML questions with enhanced validation (65 total questions)
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

// Comprehensive HTML questions data - 65 questions total
const htmlQuestions = {
  // 25 Multiple Choice Questions (no category needed)
  multipleChoice: [
    {
      title: "HTML5 Semantic Elements",
      description: "Which of these is a semantic HTML5 element?",
      options: ["<div>", "<header>", "<span>", "<bold>"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["html", "semantic-elements"]
    },
    {
      title: "HTML Document Structure",
      description: "Which element should contain all visible content of an HTML page?",
      options: ["<html>", "<head>", "<body>", "<main>"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["html", "structure"]
    },
    {
      title: "HTML Input Types",
      description: "Which input type is used for email addresses?",
      options: ["text", "email", "mail", "address"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["html", "forms"]
    },
    {
      title: "HTML Attributes",
      description: "Which attribute specifies an alternate text for an image?",
      options: ["title", "alt", "description", "text"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["html", "accessibility"]
    },
    {
      title: "HTML Lists",
      description: "Which element is used for an ordered list?",
      options: ["<ul>", "<ol>", "<list>", "<order>"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["html", "lists"]
    },
    {
      title: "HTML Tables",
      description: "Which element represents a table header cell?",
      options: ["<td>", "<th>", "<header>", "<thead>"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["html", "tables"]
    },
    {
      title: "HTML Links",
      description: "Which attribute in an <a> tag specifies the URL?",
      options: ["src", "href", "link", "url"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["html", "links"]
    },
    {
      title: "HTML Meta Tags",
      description: "Which meta tag sets the character encoding?",
      options: ["<meta charset=\"UTF-8\">", "<meta encoding=\"UTF-8\">", "<meta type=\"UTF-8\">", "<meta lang=\"UTF-8\">"],
      correctAnswer: 0,
      difficulty: "medium",
      tags: ["html", "meta-tags"]
    },
    {
      title: "HTML5 Article Element",
      description: "What is the <article> element used for?",
      options: ["Navigation links", "Independent, self-contained content", "Page footer", "Side content"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["html", "semantic-elements"]
    },
    {
      title: "HTML Form Methods",
      description: "Which HTTP method is default for HTML forms?",
      options: ["POST", "GET", "PUT", "DELETE"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["html", "forms"]
    },
    {
      title: "HTML5 Video Element",
      description: "Which attribute makes a video start playing automatically?",
      options: ["autostart", "autoplay", "auto", "play"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["html", "media"]
    },
    {
      title: "HTML Void Elements",
      description: "Which of these is a void element (self-closing)?",
      options: ["<div>", "<p>", "<br>", "<span>"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["html", "elements"]
    },
    {
      title: "HTML Accessibility",
      description: "Which attribute provides accessible labels for form elements?",
      options: ["title", "label", "for", "aria-label"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["html", "accessibility"]
    },
    {
      title: "HTML5 Canvas",
      description: "What is the <canvas> element used for?",
      options: ["Displaying images", "Drawing graphics with JavaScript", "Creating animations", "All of the above"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["html", "canvas", "graphics"]
    },
    {
      title: "HTML Doctype",
      description: "What is the correct HTML5 doctype declaration?",
      options: ["<!DOCTYPE html>", "<!DOCTYPE HTML5>", "<DOCTYPE html>", "<!DOC html>"],
      correctAnswer: 0,
      difficulty: "easy",
      tags: ["html", "doctype"]
    },
    {
      title: "HTML5 Storage",
      description: "Which HTML5 feature allows offline data storage?",
      options: ["cookies", "localStorage", "sessionStorage", "all of the above"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["html", "storage"]
    },
    {
      title: "HTML Form Validation",
      description: "Which attribute adds client-side validation to form inputs?",
      options: ["validate", "required", "check", "verify"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["html", "forms", "validation"]
    },
    {
      title: "HTML Media Queries",
      description: "Where are CSS media queries typically defined in HTML?",
      options: ["<body>", "<head>", "<meta>", "<style>"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["html", "media-queries"]
    },
    {
      title: "HTML Microdata",
      description: "What is the purpose of microdata in HTML5?",
      options: ["Styling elements", "Adding structured data", "Creating animations", "Form validation"],
      correctAnswer: 1,
      difficulty: "hard",
      tags: ["html", "microdata", "structured-data"]
    },
    {
      title: "HTML Shadow DOM",
      description: "What does Shadow DOM provide in HTML?",
      options: ["Better performance", "Encapsulated styling", "Faster loading", "Mobile optimization"],
      correctAnswer: 1,
      difficulty: "hard",
      tags: ["html", "dom", "web-components"]
    },
    {
      title: "HTML Web Components",
      description: "Which JavaScript API is used to define custom elements?",
      options: ["document.createElement()", "customElements.define()", "element.register()", "HTML.define()"],
      correctAnswer: 1,
      difficulty: "hard",
      tags: ["html", "web-components"]
    },
    {
      title: "HTML Viewport Meta",
      description: "What does the viewport meta tag control?",
      options: ["Page title", "Page layout on mobile", "Page loading speed", "Page security"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["html", "viewport"]
    },
    {
      title: "HTML ARIA Roles",
      description: "What do ARIA roles provide?",
      options: ["Visual styling", "Accessibility information", "Performance optimization", "Mobile responsiveness"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["html", "accessibility", "aria"]
    },
    {
      title: "HTML5 Geolocation",
      description: "How is geolocation accessed in HTML5?",
      options: ["<geo> element", "navigator.geolocation", "<location> tag", "GPS attribute"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["html", "geolocation", "apis"]
    },
    {
      title: "HTML Critical Rendering Path",
      description: "Which elements block page rendering by default?",
      options: ["<img>", "<script>", "<div>", "<p>"],
      correctAnswer: 1,
      difficulty: "hard",
      tags: ["html", "performance", "rendering"]
    }
  ],

  // 20 True/False Questions (no category needed)
  trueFalse: [
    {
      title: "HTML Case Sensitivity",
      description: "HTML tags are case-sensitive.",
      options: ["true", "false"],
      correctAnswer: 1, // false
      difficulty: "easy",
      tags: ["html", "syntax"]
    },
    {
      title: "HTML Form Validation",
      description: "The 'required' attribute provides client-side form validation in HTML5.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "easy",
      tags: ["html", "forms", "validation"]
    },
    {
      title: "HTML Nesting Rules",
      description: "Block-level elements can contain inline elements.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["html", "nesting", "elements"]
    },
    {
      title: "HTML Comments",
      description: "HTML comments are visible to users in the browser.",
      options: ["true", "false"],
      correctAnswer: 1, // false
      difficulty: "easy",
      tags: ["html", "comments"]
    },
    {
      title: "HTML5 New Elements",
      description: "HTML5 introduced new semantic elements like <section> and <article>.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "easy",
      tags: ["html", "semantic-elements"]
    },
    {
      title: "HTML Attribute Quotes",
      description: "Attribute values in HTML must always be enclosed in quotes.",
      options: ["true", "false"],
      correctAnswer: 1, // false
      difficulty: "medium",
      tags: ["html", "attributes", "syntax"]
    },
    {
      title: "HTML Image Loading",
      description: "Images with missing 'src' attributes will show broken image icons.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "easy",
      tags: ["html", "media"]
    },
    {
      title: "HTML Form Action",
      description: "A form without an 'action' attribute submits to the current page.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["html", "forms", "attributes"]
    },
    {
      title: "HTML Element IDs",
      description: "Multiple elements can have the same ID attribute value.",
      options: ["true", "false"],
      correctAnswer: 1, // false
      difficulty: "medium",
      tags: ["html", "ids", "attributes"]
    },
    {
      title: "HTML Whitespace",
      description: "Multiple consecutive spaces in HTML are collapsed into a single space.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["html", "whitespace", "parsing"]
    },
    {
      title: "HTML5 Audio Support",
      description: "All browsers support the same audio formats in HTML5.",
      options: ["true", "false"],
      correctAnswer: 1, // false
      difficulty: "medium",
      tags: ["html", "audio", "browser-compatibility"]
    },
    {
      title: "HTML Table Accessibility",
      description: "The <caption> element improves table accessibility.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["html", "tables", "accessibility"]
    },
    {
      title: "HTML Script Tag",
      description: "Scripts in the <head> block page rendering until they load.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["html", "performance", "scripts"]
    },
    {
      title: "HTML5 Validation",
      description: "HTML5 provides built-in form validation without JavaScript.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "easy",
      tags: ["html", "forms", "validation"]
    },
    {
      title: "HTML Meta Viewport",
      description: "The viewport meta tag is required for responsive web design.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["html", "viewport"]
    },
    {
      title: "HTML5 Semantic Meaning",
      description: "Semantic HTML elements have built-in styling by default.",
      options: ["true", "false"],
      correctAnswer: 1, // false
      difficulty: "medium",
      tags: ["html", "semantic-elements"]
    },
    {
      title: "HTML Document Loading",
      description: "The DOM is built incrementally as HTML is parsed.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "hard",
      tags: ["html", "dom", "parsing"]
    },
    {
      title: "HTML5 Offline Storage",
      description: "localStorage persists after the browser is closed.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["html", "storage"]
    },
    {
      title: "HTML Accessibility",
      description: "Screen readers can understand the structure of semantic HTML better than div-based layouts.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["html", "accessibility", "semantic-elements"]
    },
    {
      title: "HTML Performance",
      description: "The position of <script> tags affects page loading performance.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["html", "performance", "scripts"]
    }
  ],

  // 20 Fill in the Blank Questions - 10 UI + 10 Syntax
  fillInTheBlank: [
    // 10 UI Category Questions
    {
      title: "Responsive Image Layout",
      description: "Complete the responsive image setup for optimal UX:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["html", "media"],
      codeTemplate: `<___blank1___>
  <img src="image-large.jpg" 
       ___blank2___="Profile photo of John Smith" 
       loading="___blank3___"
       width="300" 
       height="200">
  <___blank4___>John Smith - CEO</figcaption>
</figure>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['figure'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['alt'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['lazy'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['figcaption'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Accessible Navigation Menu",
      description: "Complete the accessible navigation structure for better UX:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["html", "navigation"],
      codeTemplate: `<___blank1___ role="navigation" aria-label="Main navigation">
  <___blank2___>
    <li><a href="/home" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['nav'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['ul'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Interactive Form Components",
      description: "Complete the interactive form with user-friendly elements:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["html", "forms"],
      codeTemplate: `<form>
  <___blank1___>
    <legend>Personal Information</legend>
    
    <div class="form-group">
      <label for="name">Full Name:</label>
      <input type="text" id="name" name="name" ___blank2___ 
             placeholder="Enter your full name">
    </div>
    
    <div class="form-group">
      <label for="email">Email:</label>
      <input type="___blank3___" id="email" name="email" required>
    </div>
  </fieldset>
  
  <___blank4___ type="submit">Register</button>
</form>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['fieldset'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['required'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['email'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['button'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Media Player Interface",
      description: "Complete the media player with user controls:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["html", "video"],
      codeTemplate: `<___blank1___ ___blank2___ muted poster="thumbnail.jpg">
  <source src="video.mp4" type="video/mp4">
  <source src="video.webm" type="video/webm">
  <___blank3___ kind="captions" src="captions.vtt" srclang="en" label="English">
  Your browser does not support the video tag.
</video>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['video'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['controls'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['track'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Card-Based Content Layout",
      description: "Complete the card layout for content presentation:",
      difficulty: "easy",
      preferredCategory: "ui",
      tags: ["html", "structure"],
      codeTemplate: `<___blank1___ class="product-card">
  <___blank2___>
    <h3>Product Title</h3>
    <p>Product description goes here...</p>
    <div class="price">$29.99</div>
    <button>Add to Cart</button>
  </header>
</article>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['article'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['header'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Data Table with Accessibility",
      description: "Complete the data table for accessible information display:",
      difficulty: "hard",
      preferredCategory: "ui",
      tags: ["html", "tables"],
      codeTemplate: `<table>
  <___blank1___>Product Sales Report</caption>
  <___blank2___>
    <tr>
      <___blank3___ scope="col">Product</th>
      <th scope="col">Q1 Sales</th>
      <th scope="col">Q2 Sales</th>
    </tr>
  </thead>
  
  <___blank4___>
    <tr>
      <th scope="row">Widget A</th>
      <___blank5___>$10,000</td>
      <td>$12,000</td>
    </tr>
  </tbody>
</table>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['caption'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['thead'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['th'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['tbody'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['td'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Progressive Enhancement Layout",
      description: "Complete the progressive enhancement structure:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["html", "structure"],
      codeTemplate: `<___blank1___ class="hero-section">
  <div class="container">
    <h1>Welcome to Our Site</h1>
    <p>Experience the future of web development</p>
    <a href="#features" class="cta-button">Learn More</a>
  </div>
</section>

<___blank2___ id="features">
  <div class="container">
    <h2>Our Features</h2>
    <div class="feature-grid">
      <___blank3___ class="feature">
        <h3>Fast Performance</h3>
        <p>Lightning-fast load times</p>
      </article>
    </div>
  </div>
</main>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['section'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['main'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['article'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Interactive Content Components",
      description: "Complete the interactive content with disclosure widgets:",
      difficulty: "hard",
      preferredCategory: "ui",
      tags: ["html", "interactive"],
      codeTemplate: `<___blank1___>
  <___blank2___>Frequently Asked Questions</summary>
  <div class="faq-content">
    <h3>What is your return policy?</h3>
    <p>We offer a 30-day return policy...</p>
    
    <h3>Do you offer international shipping?</h3>
    <p>Yes, we ship worldwide...</p>
  </div>
</details>

<___blank3___ open>
  <summary>Special Offer</summary>
  <p>Get 20% off your first order!</p>
</details>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['details'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['summary'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['details'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Search Interface Components",
      description: "Complete the search interface for user interaction:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["html", "forms"],
      codeTemplate: `<form role="search" class="search-form">
  <___blank1___ for="search">Search our site:</label>
  <input type="___blank2___" id="search" name="q" 
         placeholder="Enter keywords..." 
         autocomplete="off"
         ___blank3___="search-suggestions">
  
  <___blank4___ id="search-suggestions" role="listbox">
    <!-- Dynamic suggestions will be populated here -->
  </datalist>
  
  <button type="submit">Search</button>
</form>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['label'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['search'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['list'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['datalist'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "Responsive Content Grid",
      description: "Complete the responsive content grid layout:",
      difficulty: "medium",
      preferredCategory: "ui",
      tags: ["html", "structure"],
      codeTemplate: `<___blank1___ class="content-grid">
  <___blank2___ class="main-content">
    <article>
      <h2>Main Article</h2>
      <p>Primary content goes here...</p>
    </article>
  </main>
  
  <___blank3___ class="sidebar">
    <section class="related">
      <h3>Related Articles</h3>
      <ul>
        <li><a href="#">Article 1</a></li>
        <li><a href="#">Article 2</a></li>
      </ul>
    </section>
  </aside>
</div>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['div'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['main'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['aside'], caseSensitive: false, points: 1 }
      ]
    },

    // 10 Syntax Category Questions
    {
      title: "HTML5 Document Structure",
      description: "Complete the basic HTML5 document structure:",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["html", "structure", "doctype"],
      codeTemplate: `<!DOCTYPE ___blank1___>
<html lang="en">
<___blank2___>
  <meta charset="___blank3___">
  <title>My Page</title>
</head>
<___blank4___>
  <h1>Welcome</h1>
</body>
</html>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['html'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['head'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['UTF-8', 'utf-8'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['body'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "HTML Meta Tags Syntax",
      description: "Complete the essential meta tags for SEO and responsiveness:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["html", "meta-tags"],
      codeTemplate: `<head>
  <meta ___blank1___="UTF-8">
  <meta name="viewport" content="width=___blank2___, initial-scale=1.0">
  <meta name="___blank3___" content="Page description for search engines">
  <meta name="___blank4___" content="html, css, javascript, web development">
  <title>Page Title</title>
</head>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['charset'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['device-width'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['description'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['keywords'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "HTML Input Types Syntax",
      description: "Complete the form with modern HTML5 input types:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["html", "forms", "input-types"],
      codeTemplate: `<form>
  <input type="___blank1___" placeholder="Enter your email">
  <input type="___blank2___" placeholder="Enter your phone">
  <input type="___blank3___" min="18" max="100">
  <input type="___blank4___" min="2024-01-01" max="2024-12-31">
  <input type="___blank5___" accept="image/*">
  <input type="range" min="0" max="100" ___blank6___="50">
</form>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['email'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['tel'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['number'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['date'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['file'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['value'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "HTML Semantic Layout Syntax",
      description: "Complete the HTML5 semantic page layout:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["html", "semantic-elements"],
      codeTemplate: `<___blank1___>
  <h1>Site Title</h1>
  <nav>Navigation</nav>
</header>

<___blank2___>
  <___blank3___ class="content">
    <h2>Article Title</h2>
    <p>Article content...</p>
  </article>
  
  <___blank4___ class="sidebar">
    <h3>Related Links</h3>
  </aside>
</main>

<___blank5___>
  <p>&copy; 2024 Company Name</p>
</footer>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['header'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['main'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['article'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['aside'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['footer'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "HTML Link Attributes Syntax",
      description: "Complete the link elements with proper attributes:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["html", "links"],
      codeTemplate: `<head>
  <link ___blank1___="stylesheet" href="styles.css">
  <link rel="___blank2___" href="favicon.ico">
  <link rel="___blank3___" href="manifest.json">
</head>

<body>
  <a href="https://example.com" ___blank4___="_blank" 
     ___blank5___="noopener noreferrer">External Link</a>
</body>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['rel'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['icon'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['manifest'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['target'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['rel'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "HTML Accessibility Attributes Syntax",
      description: "Complete the accessible form elements:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["html", "accessibility", "aria"],
      codeTemplate: `<form>
  <label ___blank1___="username">Username:</label>
  <input type="text" id="username" ___blank2___-describedby="username-help">
  <div id="username-help">Must be 3-20 characters</div>
  
  <button type="submit" ___blank3___-label="Submit registration form">
    Submit
  </button>
  
  <div ___blank4___="alert" ___blank5___-live="polite">
    Form validation messages will appear here
  </div>
</form>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['for'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['aria'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['aria'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['role'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['aria'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "HTML Script and Style Syntax",
      description: "Complete the script and style element syntax:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["html", "scripts"],
      codeTemplate: `<head>
  <___blank1___ type="text/css">
    body { font-family: Arial, sans-serif; }
  </style>
  
  <script ___blank2___="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage"
  }
  </script>
</head>

<body>
  <script src="app.js" ___blank3___></script>
  <script src="analytics.js" ___blank4___></script>
</body>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['style'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['type'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['defer'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['async'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "HTML Media Element Syntax",
      description: "Complete the media element with proper syntax:",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["html", "audio"],
      codeTemplate: `<___blank1___ controls preload="metadata">
  <___blank2___ src="audio.mp3" type="audio/mpeg">
  <source src="audio.ogg" type="audio/___blank3___">
  Your browser does not support the audio element.
</audio>

<video width="320" height="240" ___blank4___ poster="thumb.jpg">
  <source src="movie.mp4" type="video/mp4">
  <___blank5___ kind="subtitles" src="subs.vtt" srclang="en">
</video>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['audio'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['source'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['ogg'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['controls'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['track'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "HTML Data Attributes Syntax",
      description: "Complete the data attributes and microdata syntax:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["html", "attributes"],
      codeTemplate: `<article ___blank1___-id="123" itemscope itemtype="https://schema.org/Article">
  <h1 ___blank2___="headline">Article Title</h1>
  
  <div class="author" ___blank3___ itemtype="https://schema.org/Person">
    <span itemprop="name">John Doe</span>
    <time ___blank4___="datePublished" datetime="2024-01-15">January 15, 2024</time>
  </div>
  
  <div ___blank5___="articleBody">
    <p>Article content goes here...</p>
  </div>
</article>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['data'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['itemprop'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['itemscope'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['itemprop'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['itemprop'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: "HTML Template and Slot Syntax",
      description: "Complete the template and web component syntax:",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["html", "web-components"],
      codeTemplate: `<___blank1___ id="card-template">
  <style>
    .card { border: 1px solid #ccc; padding: 1rem; }
  </style>
  
  <div class="card">
    <h3><___blank2___ name="title">Default Title</slot></h3>
    <p><slot name="___blank3___">Default content</slot></p>
  </div>
</template>

<script>
  class CardComponent extends ___blank4___ {
    constructor() {
      super();
      const template = document.getElementById('card-template');
      const shadowRoot = this.___blank5___({mode: 'open'});
      shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }
</script>`,
      blanks: [
        { id: 'blank1', correctAnswers: ['template'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['slot'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['content'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['HTMLElement'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['attachShadow'], caseSensitive: false, points: 1 }
      ]
    }
  ]
};

async function seedHtmlQuestions() {
  const startTime = Date.now();
  const validator = new QuestionSeedValidator();
  const processor = new BatchProcessor({ logProgress: true, batchSize: 15 });

  try {
    console.log('🚀 Starting COMPREHENSIVE HTML question seeding with enhanced validation...\n');

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
    const questionCounts = Object.entries(htmlQuestions).map(([type, questions]) =>
      `${type}: ${questions.length}`
    ).join(', ');
    const totalQuestions = Object.values(htmlQuestions).reduce((sum, arr) => sum + arr.length, 0);
    const fillInBlankCount = htmlQuestions.fillInTheBlank.length;
    const totalBlanks = htmlQuestions.fillInTheBlank.reduce((sum, q) => sum + q.blanks.length, 0);
    
    // Count categories for fill-in-blank questions
    const uiFillInBlanks = htmlQuestions.fillInTheBlank.filter(q => q.preferredCategory === 'ui').length;
    const syntaxFillInBlanks = htmlQuestions.fillInTheBlank.filter(q => q.preferredCategory === 'syntax').length;
    
    console.log(`📊 COMPREHENSIVE Question breakdown: ${questionCounts}`);
    console.log(`📈 Total questions to seed: ${totalQuestions}`);
    console.log(`🔥 Fill-in-blank questions: ${fillInBlankCount} with ${totalBlanks} total blanks`);
    console.log(`🎯 Fill-in-blank categories: ${uiFillInBlanks} ui + ${syntaxFillInBlanks} syntax`);
    console.log(`🎯 HTML supports: ui and syntax categories only\n`);

    // Create backup of existing questions
    const backup = await processor.createBackup('html');

    // Delete existing HTML questions
    await processor.deleteByLanguage('html');

    // Prepare all questions with proper templates
    console.log('🔧 Preparing questions with templates...');
    const allQuestions = [];

    for (const [type, questions] of Object.entries(htmlQuestions)) {
      console.log(`  Processing ${questions.length} ${type} questions...`);

      for (const questionData of questions) {
        try {
          const templated = QuestionTemplateGenerator.createQuestionTemplate(
            { ...questionData, type, language: 'html', status: 'active' },
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
    console.log('🔍 Running COMPREHENSIVE validation with enhanced grading testing...');
    const validationResults = await validator.validateBatch(allQuestions, {
      testAutoGrading: true // Only fill-in-blank grading validation for HTML (no code execution)
    });

    console.log('');
    validator.printValidationSummary();
    console.log('');

    // Insert valid questions
    if (validationResults.validQuestions.length > 0) {
      console.log(`📦 Inserting ${validationResults.validQuestions.length} valid questions...`);
      const insertResults = await processor.insertBatch(validationResults.validQuestions);

      processor.printProcessingSummary(insertResults, 'HTML');

      // Verify insertions
      if (insertResults.insertedIds.length > 0) {
        const verification = await processor.verifyInsertedQuestions(insertResults.insertedIds);
        console.log(`\n🔍 Verification: ${verification.found}/${insertResults.insertedIds.length} questions found in database`);
      }

      // Comprehensive success reporting
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n🎉 COMPREHENSIVE HTML question seeding completed successfully!');
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
      return await Question.find({ language: 'html' }).select('_id title type');

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
    console.error('💥 HTML seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedHtmlQuestions()
    .then((questions) => {
      console.log(`\n🎉 SUCCESS! Seeded ${questions.length} comprehensive HTML questions with enhanced validation!`);
      console.log(`🔥 Ready for production use with robust validation testing!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed HTML questions:', error);
      process.exit(1);
    });
}

module.exports = { seedHtmlQuestions, htmlQuestions };