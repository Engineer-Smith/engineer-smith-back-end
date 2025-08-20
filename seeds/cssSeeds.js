const mongoose = require('mongoose');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
require('dotenv').config();

const cssQuestions = {
  multipleChoice: [
    {
      title: "CSS Selectors",
      description: "Which selector targets an element with a specific class?",
      options: ["", ".class", "#id", "element", "*"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["css"]
    },
    {
      title: "CSS Box Model",
      description: "Which property defines the space between an element's content and its border?",
      options: ["", "margin", "padding", "border-spacing", "outline"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["css"]
    },
    {
      title: "CSS Units",
      description: "Which unit is relative to the font size of the root element?",
      options: ["", "px", "%", "rem", "vw"],
      correctAnswer: 3,
      difficulty: "easy",
      tags: ["css"]
    },
    {
      title: "CSS Display Property",
      description: "Which display value makes an element a block-level flex container?",
      options: ["", "block", "inline", "flex", "grid"],
      correctAnswer: 3,
      difficulty: "easy",
      tags: ["css", "flexbox"]
    },
    {
      title: "CSS Positioning",
      description: "Which position value removes an element from the normal document flow?",
      options: ["", "static", "relative", "absolute", "sticky"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Specificity",
      description: "Which selector has the highest specificity?",
      options: ["", "element", "class", "id", "universal"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Pseudo-Classes",
      description: "Which pseudo-class targets an element when a user hovers over it?",
      options: ["", ":active", ":hover", ":focus", ":visited"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["css"]
    },
    {
      title: "CSS Media Queries",
      description: "Which keyword is used to define a media query?",
      options: ["", "@media", "@query", "@responsive", "@viewport"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["css", "responsive-design"]
    },
    {
      title: "CSS Flexbox",
      description: "Which property aligns items along the main axis in a flex container?",
      options: ["", "align-items", "justify-content", "flex-direction", "flex-wrap"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["css", "flexbox"]
    },
    {
      title: "CSS Grid",
      description: "Which property defines the number and size of columns in a grid?",
      options: ["", "grid-template-rows", "grid-template-columns", "grid-gap", "grid-auto-flow"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["css", "grid"]
    },
    {
      title: "CSS Transitions",
      description: "Which property specifies the duration of a CSS transition?",
      options: ["", "transition-property", "transition-duration", "transition-timing-function", "transition-delay"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Variables",
      description: "How do you define a CSS custom property?",
      options: ["", "--variable: value;", "var: value;", "$variable: value;", "@variable: value;"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Pseudo-Elements",
      description: "Which pseudo-element styles the first letter of an element?",
      options: ["", "::before", "::after", "::first-letter", "::first-line"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Box Shadow",
      description: "Which property adds a shadow to an element?",
      options: ["", "shadow", "box-shadow", "element-shadow", "border-shadow"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["css"]
    },
    {
      title: "CSS Overflow",
      description: "Which overflow value adds scrollbars when content overflows?",
      options: ["", "visible", "hidden", "scroll", "auto"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["css"]
    }
  ],
  trueFalse: [
    {
      title: "CSS Inheritance",
      description: "All CSS properties are inherited by child elements.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Block Elements",
      description: "Block-level elements always start on a new line.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["css"]
    },
    {
      title: "CSS !important",
      description: "Using !important increases a rule's specificity.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Vendor Prefixes",
      description: "Vendor prefixes like -webkit- are still required for all modern browsers.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Flexbox Wrapping",
      description: "Flex items can wrap to a new line with the flex-wrap property.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["css", "flexbox"]
    },
    {
      title: "CSS Display None",
      description: "Setting display: none removes an element from the accessibility tree.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Z-Index",
      description: "Z-index only affects positioned elements.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Font Shorthand",
      description: "The font shorthand requires font-size and font-family.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Grid Auto-Flow",
      description: "Grid items can only be placed explicitly in CSS Grid.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["css", "grid"]
    },
    {
      title: "CSS Margin Collapse",
      description: "Vertical margins between block elements collapse by default.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Pseudo-Classes",
      description: "Pseudo-classes can only be applied to specific elements like links.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Calc Function",
      description: "The calc() function can mix different units like px and %.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "CSS Opacity",
      description: "Setting opacity: 0 makes an element invisible but still interactive.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["css"]
    },
    {
      title: "CSS Media Queries",
      description: "Media queries can only target screen size.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["css", "responsive-design"]
    },
    {
      title: "CSS Animations",
      description: "CSS animations require keyframes to define animation sequences.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["css"]
    }
  ],
  codeChallenge: [
    {
      title: "Create Flexbox Layout",
      description: "Create a CSS layout using Flexbox to center three items horizontally with equal spacing.",
      options: [".container {\n  /* Your flexbox styles here */\n}\n.item {\n  /* Item styles here */\n}"],
      testCases: [
        { input: "Flex container", output: "Uses display: flex", hidden: false },
        { input: "Item spacing", output: "Equal spacing between items", hidden: false },
        { input: "Centered items", output: "Items centered on main axis", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css", "flexbox"]
    },
    {
      title: "Create CSS Grid Layout",
      description: "Create a 3x2 CSS Grid layout with equal column widths and a 10px gap.",
      options: [".grid {\n  /* Your grid styles here */\n}"],
      testCases: [
        { input: "Grid container", output: "Uses display: grid", hidden: false },
        { input: "3x2 structure", output: "Three columns, two rows", hidden: false },
        { input: "Gap spacing", output: "10px gap between grid items", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css", "grid"]
    },
    {
      title: "Style a Button",
      description: "Create CSS for a button with hover effects, padding, and rounded corners.",
      options: [".button {\n  /* Your button styles here */\n}"],
      testCases: [
        { input: "Button styling", output: "Has background and text color", hidden: false },
        { input: "Hover effect", output: "Changes appearance on hover", hidden: false },
        { input: "Rounded corners", output: "Uses border-radius", hidden: true }
      ],
      difficulty: "easy",
      tags: ["css"]
    },
    {
      title: "Create Responsive Design",
      description: "Write CSS with a media query to change the layout for screens smaller than 600px.",
      options: [".container {\n  /* Desktop styles here */\n}\n@media (max-width: 600px) {\n  /* Mobile styles here */\n}"],
      testCases: [
        { input: "Media query", output: "Has max-width: 600px query", hidden: false },
        { input: "Layout change", output: "Different styles for mobile", hidden: false },
        { input: "Responsive elements", output: "Adjusts at least one element", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css", "responsive-design"]
    },
    {
      title: "Create CSS Animation",
      description: "Create a CSS animation that fades an element in and out.",
      options: [".element {\n  /* Animation styles here */\n}\n@keyframes fade {\n  /* Keyframe rules here */\n}"],
      testCases: [
        { input: "Animation defined", output: "Uses animation property", hidden: false },
        { input: "Keyframes", output: "Has @keyframes rule", hidden: false },
        { input: "Fade effect", output: "Changes opacity", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "Style a Navigation Bar",
      description: "Create CSS for a horizontal navigation bar with hover effects.",
      options: [".nav {\n  /* Your nav styles here */\n}\n.nav-item {\n  /* Item styles here */\n}"],
      testCases: [
        { input: "Horizontal layout", output: "Items display inline or flex", hidden: false },
        { input: "Hover effects", output: "Changes on hover", hidden: false },
        { input: "Consistent spacing", output: "Even spacing between items", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "Create Card Component",
      description: "Style a card with a shadow, border, and centered content.",
      options: [".card {\n  /* Your card styles here */\n}"],
      testCases: [
        { input: "Card styling", output: "Has border and shadow", hidden: false },
        { input: "Centered content", output: "Content is centered", hidden: false },
        { input: "Responsive width", output: "Adapts to container", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "Style Form Inputs",
      description: "Create CSS to style form inputs with focus states and error handling.",
      options: [".input {\n  /* Input styles here */\n}\n.input:focus {\n  /* Focus styles here */\n}\n.input.error {\n  /* Error styles here */\n}"],
      testCases: [
        { input: "Input styling", output: "Has border and padding", hidden: false },
        { input: "Focus state", output: "Changes on focus", hidden: false },
        { input: "Error state", output: "Visual error indication", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "Create Centered Modal",
      description: "Style a modal window that is centered on the screen with a backdrop.",
      options: [".modal {\n  /* Modal styles here */\n}\n.backdrop {\n  /* Backdrop styles here */\n}"],
      testCases: [
        { input: "Centered modal", output: "Modal is vertically and horizontally centered", hidden: false },
        { input: "Backdrop", output: "Has semi-transparent backdrop", hidden: false },
        { input: "Z-index", output: "Modal appears above content", hidden: true }
      ],
      difficulty: "hard",
      tags: ["css"]
    },
    {
      title: "Create Gradient Background",
      description: "Create a linear gradient background that transitions between three colors.",
      options: [".container {\n  /* Gradient styles here */\n}"],
      testCases: [
        { input: "Linear gradient", output: "Uses linear-gradient()", hidden: false },
        { input: "Three colors", output: "Includes three color stops", hidden: false },
        { input: "Smooth transition", output: "Colors blend smoothly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css"]
    }
  ],
  codeDebugging: [
    {
      title: "Fix Flexbox Alignment",
      description: "This flexbox layout doesn't center items. Fix the CSS.",
      options: [".container {\n  display: flex;\n}\n.item {\n  margin: 10px;\n}"],
      testCases: [
        { input: "Centered items", output: "Uses justify-content and align-items", hidden: false },
        { input: "Flex container", output: "Maintains display: flex", hidden: false },
        { input: "Proper alignment", output: "Items centered in container", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css", "flexbox"]
    },
    {
      title: "Fix CSS Specificity",
      description: "This CSS has specificity issues causing styles to not apply. Fix it.",
      options: ["p {\n  color: blue;\n}\n.text {\n  color: red;\n}"],
      testCases: [
        { input: "Specific selector", output: "Ensures .text overrides p", hidden: false },
        { input: "Correct color", output: "Text is red", hidden: false },
        { input: "No !important", output: "Avoids using !important", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "Fix Media Query",
      description: "This media query doesn't apply on small screens. Fix it.",
      options: ["@media (min-width: 600px) {\n  .container {\n    flex-direction: column;\n  }\n}"],
      testCases: [
        { input: "Correct media query", output: "Uses max-width for small screens", hidden: false },
        { input: "Layout change", output: "Applies column layout on small screens", hidden: false },
        { input: "Responsive behavior", output: "Works below 600px", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css", "responsive-design"]
    },
    {
      title: "Fix Overflow Issue",
      description: "Content overflows the container. Fix the CSS to handle overflow.",
      options: [".container {\n  width: 200px;\n  height: 100px;\n}"],
      testCases: [
        { input: "Overflow handling", output: "Uses overflow property", hidden: false },
        { input: "Content visibility", output: "Scrollbars or hidden overflow", hidden: false },
        { input: "Correct dimensions", output: "Maintains container size", hidden: true }
      ],
      difficulty: "easy",
      tags: ["css"]
    },
    {
      title: "Fix Animation Timing",
      description: "This animation doesn't run smoothly. Fix the timing and keyframes.",
      options: [".element {\n  animation: fade 1s;\n}\n@keyframes fade {\n  from { opacity: 0; }\n}"],
      testCases: [
        { input: "Complete keyframes", output: "Has from and to states", hidden: false },
        { input: "Smooth animation", output: "Uses proper timing function", hidden: false },
        { input: "Animation duration", output: "Appropriate duration set", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "Fix Positioning Issue",
      description: "This element is not positioned correctly. Fix the positioning.",
      options: [".box {\n  position: relative;\n  top: 0;\n  left: 0;\n}"],
      testCases: [
        { input: "Correct positioning", output: "Uses absolute or fixed positioning", hidden: false },
        { input: "Proper offsets", output: "Correct top/left values", hidden: false },
        { input: "Context preservation", output: "Maintains layout context", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "Fix Font Styling",
      description: "This text styling is inconsistent. Fix the font properties.",
      options: [".text {\n  font: 16px;\n}"],
      testCases: [
        { input: "Complete font", output: "Includes font-size and font-family", hidden: false },
        { input: "Valid syntax", output: "Uses correct font shorthand", hidden: false },
        { input: "Readable text", output: "Ensures text is legible", hidden: true }
      ],
      difficulty: "easy",
      tags: ["css"]
    },
    {
      title: "Fix Grid Layout",
      description: "This grid layout is incorrect. Fix the column and row definitions.",
      options: [".grid {\n  display: grid;\n  grid-template-columns: 100px;\n}"],
      testCases: [
        { input: "Correct grid", output: "Defines multiple columns/rows", hidden: false },
        { input: "Proper sizing", output: "Uses appropriate units", hidden: false },
        { input: "Item placement", output: "Items placed correctly", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css", "grid"]
    },
    {
      title: "Fix Hover Effects",
      description: "This hover effect doesn't work. Fix the CSS.",
      options: [".button:hover {\n  background: blue;\n}"],
      testCases: [
        { input: "Base styling", output: "Button has default styles", hidden: false },
        { input: "Hover effect", output: "Changes on hover", hidden: false },
        { input: "Smooth transition", output: "Uses transition property", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css"]
    },
    {
      title: "Fix CSS Variables",
      description: "These CSS variables are not working. Fix the syntax and usage.",
      options: [".container {\n  --color: blue;\n  background: color;\n}"],
      testCases: [
        { input: "Correct variable syntax", output: "Uses var() for variables", hidden: false },
        { input: "Variable definition", output: "Defines --color correctly", hidden: false },
        { input: "Applied styles", output: "Background uses variable", hidden: true }
      ],
      difficulty: "medium",
      tags: ["css"]
    }
  ]
};

async function seedCssQuestions() {
  try {
    console.log('Seeding CSS questions...');

    await mongoose.connect(process.env.MONGO_URL);

    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    await Question.deleteMany({ language: 'css' });

    const allQuestions = [];

    ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'].forEach(type => {
      cssQuestions[type].forEach(q => {
        allQuestions.push({
          ...q,
          type,
          language: 'css',
          status: 'draft',
          isGlobal: true,
          organizationId: superOrg._id,
          createdBy: superUser._id
        });
      });
    });

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} CSS questions`);
    console.log(`   - Multiple Choice: ${cssQuestions.multipleChoice.length}`);
    console.log(`   - True/False: ${cssQuestions.trueFalse.length}`);
    console.log(`   - Code Challenge: ${cssQuestions.codeChallenge.length}`);
    console.log(`   - Code Debugging: ${cssQuestions.codeDebugging.length}`);

    return inserted;
  } catch (error) {
    console.error('Error seeding CSS questions:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedCssQuestions()
    .then(() => {
      console.log('CSS questions seeded successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed CSS questions:', error);
      process.exit(1);
    });
}

module.exports = { seedCssQuestions, cssQuestions };