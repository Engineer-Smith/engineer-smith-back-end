// seeds/cssSeeds.js - Comprehensive CSS questions (65 total questions)
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

// Comprehensive CSS questions data - 65 questions total
const cssQuestions = {
  // 25 Multiple Choice Questions
  multipleChoice: [
    {
      title: 'CSS Box Model Components',
      description: 'Which of these is NOT part of the CSS box model?',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'box-model', 'layout'],
      options: ['Margin', 'Padding', 'Border', 'Font-size'],
      correctAnswer: 3
    },
    {
      title: 'CSS Flexbox Direction',
      description: 'What is the default value of flex-direction?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'flexbox', 'layout'],
      options: ['column', 'row', 'row-reverse', 'column-reverse'],
      correctAnswer: 1
    },
    {
      title: 'CSS Display Property',
      description: 'Which display value creates a block-level flex container?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'flexbox', 'properties'],
      options: ['inline-flex', 'flex', 'block', 'inline-block'],
      correctAnswer: 1
    },
    {
      title: 'CSS Grid Template',
      description: 'Which property defines the size of grid columns?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'grid', 'layout'],
      options: ['grid-template-rows', 'grid-template-columns', 'grid-template-areas', 'grid-template'],
      correctAnswer: 1
    },
    {
      title: 'CSS Positioning',
      description: 'Which position value removes an element from the normal document flow?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'positioning', 'layout'],
      options: ['static', 'relative', 'absolute', 'sticky'],
      correctAnswer: 2
    },
    {
      title: 'CSS Z-Index',
      description: 'Which position value is required for z-index to work?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'positioning', 'properties'],
      options: ['static', 'relative', 'absolute', 'Both relative and absolute'],
      correctAnswer: 3
    },
    {
      title: 'CSS Pseudo-Classes',
      description: 'Which pseudo-class targets the first child element?',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'selectors', 'properties'],
      options: [':first-child', ':first-of-type', ':nth-child(1)', 'Both A and C'],
      correctAnswer: 3
    },
    {
      title: 'CSS Units',
      description: 'Which CSS unit is relative to the viewport width?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'units', 'properties'],
      options: ['em', 'rem', 'vw', 'px'],
      correctAnswer: 2
    },
    {
      title: 'CSS Overflow',
      description: 'Which overflow value shows scrollbars only when needed?',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'layout', 'properties'],
      options: ['hidden', 'visible', 'auto', 'scroll'],
      correctAnswer: 2
    },
    {
      title: 'CSS Media Queries',
      description: 'Which keyword is used to combine media query conditions?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'responsive-design', 'media-queries'],
      options: ['or', 'and', 'not', 'only'],
      correctAnswer: 1
    },
    {
      title: 'CSS Font Weight',
      description: 'Which value represents the boldest font weight?',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'typography', 'properties'],
      options: ['normal', 'bold', '900', 'bolder'],
      correctAnswer: 2
    },
    {
      title: 'CSS Flex Items',
      description: 'Which property controls how a flex item grows?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'flexbox', 'properties'],
      options: ['flex-grow', 'flex-shrink', 'flex-basis', 'flex-direction'],
      correctAnswer: 0
    },
    {
      title: 'CSS Text Alignment',
      description: 'Which value centers text horizontally?',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'typography', 'layout'],
      options: ['left', 'right', 'center', 'justify'],
      correctAnswer: 2
    },
    {
      title: 'CSS Border Radius',
      description: 'Which property creates rounded corners?',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'borders', 'properties'],
      options: ['border-radius', 'border-corner', 'corner-radius', 'rounded-border'],
      correctAnswer: 0
    },
    {
      title: 'CSS Animation',
      description: 'Which at-rule is used to define CSS animations?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'animations', 'properties'],
      options: ['@media', '@keyframes', '@import', '@font-face'],
      correctAnswer: 1
    },
    {
      title: 'CSS Selectors Priority',
      description: 'Which selector has the highest specificity?',
      difficulty: 'hard',
      preferredCategory: 'ui',
      tags: ['css', 'selectors', 'properties'],
      options: ['#id', '.class', 'element', '!important'],
      correctAnswer: 3
    },
    {
      title: 'CSS Transform',
      description: 'Which transform function rotates an element?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'transforms', 'properties'],
      options: ['scale()', 'rotate()', 'translate()', 'skew()'],
      correctAnswer: 1
    },
    {
      title: 'CSS Float',
      description: 'Which property clears floating elements?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'layout', 'positioning'],
      options: ['float', 'clear', 'overflow', 'display'],
      correctAnswer: 1
    },
    {
      title: 'CSS Background',
      description: 'Which property sets multiple background images?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'backgrounds', 'properties'],
      options: ['background-image', 'background', 'background-repeat', 'background-position'],
      correctAnswer: 0
    },
    {
      title: 'CSS Transitions',
      description: 'Which property defines the duration of a CSS transition?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'transitions', 'properties'],
      options: ['transition-delay', 'transition-duration', 'transition-timing-function', 'transition-property'],
      correctAnswer: 1
    },
    {
      title: 'CSS Grid Areas',
      description: 'Which property assigns a grid item to a named grid area?',
      difficulty: 'hard',
      preferredCategory: 'ui',
      tags: ['css', 'grid', 'layout'],
      options: ['grid-area', 'grid-template-areas', 'grid-column', 'grid-row'],
      correctAnswer: 0
    },
    {
      title: 'CSS Box Shadow',
      description: 'Which value in box-shadow controls the blur radius?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'properties'],
      options: ['First value', 'Second value', 'Third value', 'Fourth value'],
      correctAnswer: 2
    },
    {
      title: 'CSS Custom Properties',
      description: 'How do you declare a CSS custom property?',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'variables', 'custom-properties'],
      options: ['var(--name)', '--name:', '$name:', 'custom(name)'],
      correctAnswer: 1
    },
    {
      title: 'CSS Margin Collapse',
      description: 'When do vertical margins collapse?',
      difficulty: 'hard',
      preferredCategory: 'ui',
      tags: ['css', 'box-model', 'layout'],
      options: ['Never', 'Always', 'Adjacent block elements', 'Only inline elements'],
      correctAnswer: 2
    },
    {
      title: 'CSS Filter Effects',
      description: 'Which filter function applies a blur effect?',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'properties'],
      options: ['blur()', 'brightness()', 'contrast()', 'saturate()'],
      correctAnswer: 0
    }
  ],

  // 15 True/False Questions
  trueFalse: [
    {
      title: 'CSS Specificity',
      description: 'ID selectors have higher specificity than class selectors.',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'selectors', 'properties'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'CSS Inheritance',
      description: 'All CSS properties are inherited by child elements.',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'properties', 'layout'],
      options: ['true', 'false'],
      correctAnswer: 1 // false
    },
    {
      title: 'CSS Calc Function',
      description: 'The calc() function can mix different units like px and %.',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'units', 'properties'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'CSS Opacity',
      description: 'Setting opacity: 0 makes an element invisible and non-interactive.',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'properties', 'layout'],
      options: ['true', 'false'],
      correctAnswer: 1 // false - element is invisible but still interactive
    },
    {
      title: 'CSS Media Queries Types',
      description: 'Media queries can only target screen size.',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'responsive-design', 'media-queries'],
      options: ['true', 'false'],
      correctAnswer: 1 // false
    },
    {
      title: 'CSS Animations Requirement',
      description: 'CSS animations require keyframes to define animation sequences.',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'animations', 'properties'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'CSS Float Document Flow',
      description: 'Floated elements are removed from the normal document flow.',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'layout', 'positioning'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'CSS Variables Prefix',
      description: 'CSS custom properties (variables) must start with two dashes.',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'variables', 'custom-properties'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'CSS Grid Gap',
      description: 'The gap property in CSS Grid affects only the space between items, not around the edges.',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'grid', 'layout'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'CSS Transform Origin',
      description: 'The default transform-origin is the top-left corner of an element.',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'transforms', 'properties'],
      options: ['true', 'false'],
      correctAnswer: 1 // false - it's center
    },
    {
      title: 'CSS Viewport Units',
      description: 'The vw unit represents 1% of the viewport width.',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'units', 'properties'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'CSS Flexbox Wrap',
      description: 'By default, flex items will wrap to new lines when they overflow.',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'flexbox', 'layout'],
      options: ['true', 'false'],
      correctAnswer: 1 // false - default is nowrap
    },
    {
      title: 'CSS Pseudo Elements',
      description: 'Pseudo-elements use double colons (::) in CSS3.',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'selectors', 'properties'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'CSS Position Fixed',
      description: 'Fixed positioned elements are positioned relative to the viewport.',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'positioning', 'layout'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    },
    {
      title: 'CSS Line Height',
      description: 'Line-height values without units are multiplied by the font-size.',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'typography', 'properties'],
      options: ['true', 'false'],
      correctAnswer: 0 // true
    }
  ],

  // 25 Fill-in-the-Blank Questions
  fillInTheBlank: [
    {
      title: 'Complete CSS Flexbox Layout',
      description: 'Complete the CSS flexbox properties to create a responsive layout',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'flexbox', 'layout'],
      codeTemplate: `.container {
  display: ___blank1___;
  flex-direction: ___blank2___;
  justify-content: ___blank3___;
  align-items: ___blank4___;
  gap: ___blank5___;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['flex'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['row', 'column'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['center', 'space-between', 'space-around', 'flex-start', 'flex-end'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['center', 'flex-start', 'flex-end', 'stretch'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['10px', '1rem', '20px', '0.5rem'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Grid Layout',
      description: 'Complete the CSS Grid properties for a responsive grid system',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'grid', 'layout'],
      codeTemplate: `.grid-container {
  display: ___blank1___;
  grid-template-columns: ___blank2___;
  grid-template-rows: ___blank3___;
  gap: ___blank4___;
}

.grid-item {
  grid-column: ___blank5___;
  grid-row: ___blank6___;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['grid'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['repeat(3, 1fr)', '1fr 1fr 1fr', 'repeat(auto-fit, minmax(200px, 1fr))'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: ['repeat(2, 1fr)', '1fr 1fr', 'auto'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['10px', '1rem', '20px', '1em'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['1 / 3', '1 / -1', 'span 2'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['1 / 2', '1 / -1', 'span 1'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Animation',
      description: 'Complete the CSS animation properties and keyframes',
      difficulty: 'hard',
      preferredCategory: 'ui',
      tags: ['css', 'animations', 'properties'],
      codeTemplate: `.animated-element {
  animation-name: ___blank1___;
  animation-duration: ___blank2___;
  animation-timing-function: ___blank3___;
  animation-iteration-count: ___blank4___;
}

@___blank5___ fadeInOut {
  0% { opacity: ___blank6___; }
  50% { opacity: 1; }
  100% { opacity: ___blank7___; }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['fadeInOut', 'fade'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['2s', '1s', '3s', '1.5s'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['ease-in-out', 'ease', 'linear', 'ease-in', 'ease-out'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['infinite', '1', '2', '3'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['keyframes'], caseSensitive: false, points: 2 },
        { id: 'blank6', correctAnswers: ['0'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: ['0'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Variables and Media Query',
      description: 'Complete the CSS custom properties and responsive design',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'variables', 'responsive-design'],
      codeTemplate: `:root {
  ___blank1___primary-color: #007bff;
  ___blank2___font-size: 16px;
  ___blank3___spacing: 1rem;
}

.element {
  color: ___blank4___(--primary-color);
  font-size: ___blank5___(--font-size);
}

___blank6___ (max-width: 768px) {
  .element {
    font-size: calc(___blank7___(--font-size) * 0.875);
  }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['--'], caseSensitive: true, points: 1 },
        { id: 'blank2', correctAnswers: ['--'], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: ['--'], caseSensitive: true, points: 1 },
        { id: 'blank4', correctAnswers: ['var'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['var'], caseSensitive: false, points: 2 },
        { id: 'blank6', correctAnswers: ['@media'], caseSensitive: false, points: 2 },
        { id: 'blank7', correctAnswers: ['var'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Selectors',
      description: 'Complete the CSS selectors to target specific elements',
      difficulty: 'easy',
      preferredCategory: 'syntax',
      tags: ['css', 'selectors', 'syntax'],
      codeTemplate: `/* Target element with ID 'header' */
___blank1___header {
  background: blue;
}

/* Target elements with class 'nav-item' */
___blank2___nav-item {
  color: white;
}

/* Target all paragraph elements */
___blank3___ {
  margin: 10px;
}

/* Target first child paragraph */
p___blank4___child {
  font-weight: bold;
}

/* Target element on hover */
.button___blank5___ {
  background: red;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['#'], caseSensitive: true, points: 1 },
        { id: 'blank2', correctAnswers: ['.'], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: ['p'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: [':first'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: [':hover'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Positioning',
      description: 'Complete the CSS positioning properties',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'positioning', 'layout'],
      codeTemplate: `.fixed-header {
  position: ___blank1___;
  top: ___blank2___;
  left: ___blank3___;
  z-index: ___blank4___;
}

.relative-container {
  position: ___blank5___;
}

.absolute-child {
  position: ___blank6___;
  right: ___blank7___;
  bottom: ___blank8___;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['fixed'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['0', '0px'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['0', '0px'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['1000', '999', '100'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['relative'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['absolute'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: ['0', '0px', '10px'], caseSensitive: false, points: 1 },
        { id: 'blank8', correctAnswers: ['0', '0px', '10px'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Typography',
      description: 'Complete the CSS typography properties',
      difficulty: 'easy',
      preferredCategory: 'ui',
      tags: ['css', 'typography', 'properties'],
      codeTemplate: `.heading {
  font-family: ___blank1___;
  font-size: ___blank2___;
  font-weight: ___blank3___;
  line-height: ___blank4___;
  text-align: ___blank5___;
  color: ___blank6___;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['Arial', '"Arial, sans-serif"', 'sans-serif'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['24px', '2rem', '1.5em'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['bold', '700'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['1.5', '1.4', '150%'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['center', 'left', 'right'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['#333', 'black', 'rgb(51, 51, 51)'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Transforms',
      description: 'Complete the CSS transform properties',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'transforms', 'properties'],
      codeTemplate: `.transformed-element {
  transform: ___blank1___(45deg) ___blank2___(1.2) ___blank3___(20px, 30px);
  transform-origin: ___blank4___;
  transition: transform ___blank5___ ___blank6___;
}

.transformed-element:hover {
  transform: ___blank7___(90deg) ___blank8___(1.5) ___blank9___(40px, 60px);
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['rotate'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['scale'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['translate'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['center', '50% 50%', 'center center'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['0.3s', '300ms', '0.5s'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['ease', 'ease-in-out', 'linear'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: ['rotate'], caseSensitive: false, points: 1 },
        { id: 'blank8', correctAnswers: ['scale'], caseSensitive: false, points: 1 },
        { id: 'blank9', correctAnswers: ['translate'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Backgrounds',
      description: 'Complete the CSS background properties',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'backgrounds', 'properties'],
      codeTemplate: `.hero-section {
  background-image: ___blank1___('hero.jpg');
  background-size: ___blank2___;
  background-position: ___blank3___;
  background-repeat: ___blank4___;
  background-attachment: ___blank5___;
}

.gradient-bg {
  background: ___blank6___(to right, #ff6b6b, #4ecdc4);
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['url'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['cover', 'contain', '100% 100%'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['center', 'center center', '50% 50%'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['no-repeat'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['fixed', 'scroll'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['linear-gradient'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: 'Complete CSS Borders and Box Shadow',
      description: 'Complete the CSS border and shadow properties',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'borders', 'properties'],
      codeTemplate: `.card {
  border: ___blank1___ ___blank2___ ___blank3___;
  border-radius: ___blank4___;
  box-shadow: ___blank5___ ___blank6___ ___blank7___ ___blank8___ rgba(0, 0, 0, 0.1);
}

.card:hover {
  box-shadow: ___blank9___ ___blank10___ ___blank11___ ___blank12___ rgba(0, 0, 0, 0.2);
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['1px', '2px'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['solid', 'dashed', 'dotted'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['#ddd', '#ccc', 'gray'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['8px', '10px', '5px'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['0', '0px'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['2px', '4px'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: ['8px', '10px', '6px'], caseSensitive: false, points: 1 },
        { id: 'blank8', correctAnswers: ['0', '0px'], caseSensitive: false, points: 1 },
        { id: 'blank9', correctAnswers: ['0', '0px'], caseSensitive: false, points: 1 },
        { id: 'blank10', correctAnswers: ['4px', '6px', '8px'], caseSensitive: false, points: 1 },
        { id: 'blank11', correctAnswers: ['16px', '20px', '12px'], caseSensitive: false, points: 1 },
        { id: 'blank12', correctAnswers: ['0', '0px'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Responsive Design',
      description: 'Complete the responsive design media queries',
      difficulty: 'medium',
      preferredCategory: 'ui',
      tags: ['css', 'responsive-design', 'media-queries'],
      codeTemplate: `/* Mobile First Approach */
.container {
  width: ___blank1__%;
  padding: ___blank2___ ___blank3___;
}

___blank4___ (min-width: 768px) {
  .container {
    max-width: ___blank5___;
    margin: ___blank6___ ___blank7___;
  }
}

___blank8___ (min-width: 1024px) {
  .container {
    max-width: ___blank9___;
  }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['100'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['0', '10px', '1rem'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['16px', '20px', '1rem'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['@media'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['720px', '740px', '700px'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['0'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: ['auto'], caseSensitive: false, points: 1 },
        { id: 'blank8', correctAnswers: ['@media'], caseSensitive: false, points: 1 },
        { id: 'blank9', correctAnswers: ['980px', '1000px', '960px'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Pseudo-Classes',
      description: 'Complete the CSS pseudo-class selectors',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['css', 'selectors', 'pseudo-classes'],
      codeTemplate: `/* Style the first child */
li___blank1___ {
  font-weight: bold;
}

/* Style every other row */
tr___blank2___(even) {
  background-color: #f2f2f2;
}

/* Style when hovering over links */
a___blank3___ {
  color: red;
}

/* Style visited links */
a___blank4___ {
  color: purple;
}

/* Style focused form elements */
input___blank5___ {
  outline: 2px solid blue;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: [':first-child'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: [':nth-child'], caseSensitive: false, points: 2 },
        { id: 'blank3', correctAnswers: [':hover'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: [':visited'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: [':focus'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Pseudo-Elements',
      description: 'Complete the CSS pseudo-element selectors',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['css', 'selectors', 'pseudo-elements'],
      codeTemplate: `/* Add content before element */
.quote___blank1___ {
  content: ___blank2___;
  font-weight: bold;
}

/* Add content after element */
.quote___blank3___ {
  content: ___blank4___;
  font-weight: bold;
}

/* Style the first letter */
p___blank5___ {
  font-size: 2em;
  float: left;
}

/* Style the first line */
p___blank6___ {
  font-weight: bold;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['::before', ':before'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['"\"', '"\""', "'\"'"], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: ['::after', ':after'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['"\"', '"\""', "'\"'"], caseSensitive: true, points: 1 },
        { id: 'blank5', correctAnswers: ['::first-letter', ':first-letter'], caseSensitive: false, points: 2 },
        { id: 'blank6', correctAnswers: ['::first-line', ':first-line'], caseSensitive: false, points: 2 }
      ]
    },
    {
      title: 'Complete CSS Units and Calculations',
      description: 'Complete the CSS units and calculation functions',
      difficulty: 'medium',
      preferredCategory: 'syntax',
      tags: ['css', 'units', 'properties'],
      codeTemplate: `.responsive-element {
  width: ___blank1___(100vw - 40px);
  height: ___blank2___(100vh - 80px);
  font-size: ___blank3____(1rem + 0.5vw, 0.8rem, 2rem);
  margin: ___blank4___rem;
  padding: ___blank5___em ___blank6___em;
}

.relative-size {
  font-size: 1.2___blank7___;
  line-height: 1.5___blank8___;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['calc'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['calc'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['clamp'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['1', '1.5', '2'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['1', '0.5', '1.5'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['2', '1.5', '1'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: ['rem', 'em'], caseSensitive: false, points: 1 },
        { id: 'blank8', correctAnswers: ['em', 'rem', ''], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Advanced Selectors',
      description: 'Complete the advanced CSS selector combinations',
      difficulty: 'hard',
      preferredCategory: 'syntax',
      tags: ['css', 'selectors', 'properties'],
      codeTemplate: `/* Select direct child paragraphs */
.content ___blank1___ p {
  margin-top: 0;
}

/* Select adjacent sibling */
h2 ___blank2___ p {
  margin-top: 0.5rem;
}

/* Select general sibling */
h2 ___blank3___ p {
  color: #666;
}

/* Attribute selector - exact match */
input[type___blank4___"email"] {
  border-color: blue;
}

/* Attribute selector - contains */
a[href___blank5___"external"] {
  color: green;
}

/* Attribute selector - starts with */
a[href___blank6___"https://"] {
  text-decoration: none;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['>'], caseSensitive: true, points: 1 },
        { id: 'blank2', correctAnswers: ['+'], caseSensitive: true, points: 1 },
        { id: 'blank3', correctAnswers: ['~'], caseSensitive: true, points: 2 },
        { id: 'blank4', correctAnswers: ['='], caseSensitive: true, points: 1 },
        { id: 'blank5', correctAnswers: ['*='], caseSensitive: true, points: 2 },
        { id: 'blank6', correctAnswers: ['^='], caseSensitive: true, points: 2 }
      ]
    },
    {
      title: 'Complete CSS Filter Effects',
      description: 'Complete the CSS filter and backdrop-filter properties',
      difficulty: 'hard',
      preferredCategory: 'ui',
      tags: ['css', 'properties'],
      codeTemplate: `.image-effects {
  filter: ___blank1___(0.5) ___blank2___(120%) ___blank3___(10px) ___blank4___(45deg);
  transition: filter 0.3s ease;
}

.image-effects:hover {
  filter: ___blank5___(1) ___blank6___(100%) ___blank7___(0px) ___blank8___(0deg);
}

.glass-effect {
  backdrop-filter: ___blank9___(10px) ___blank10___(0.8);
  background: rgba(255, 255, 255, 0.1);
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['brightness'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['saturate'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['blur'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['hue-rotate'], caseSensitive: false, points: 2 },
        { id: 'blank5', correctAnswers: ['brightness'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['saturate'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: ['blur'], caseSensitive: false, points: 1 },
        { id: 'blank8', correctAnswers: ['hue-rotate'], caseSensitive: false, points: 1 },
        { id: 'blank9', correctAnswers: ['blur'], caseSensitive: false, points: 1 },
        { id: 'blank10', correctAnswers: ['brightness'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Container Queries',
      description: 'Complete the modern CSS container queries',
      difficulty: 'hard',
      preferredCategory: 'ui',
      tags: ['css', 'responsive-design', 'properties'],
      codeTemplate: `.card-container {
  container-type: ___blank1___;
  container-name: ___blank2___;
}

___blank3___ card (min-width: 300px) {
  .card {
    display: ___blank4___;
    gap: ___blank5___;
  }
  
  .card-content {
    flex: ___blank6___;
  }
}

___blank7___ (max-width: 200px) {
  .card {
    text-align: ___blank8___;
  }
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['inline-size', 'size'], caseSensitive: false, points: 2 },
        { id: 'blank2', correctAnswers: ['card', 'container'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['@container'], caseSensitive: false, points: 2 },
        { id: 'blank4', correctAnswers: ['flex'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['1rem', '16px', '10px'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['1'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: ['@container'], caseSensitive: false, points: 1 },
        { id: 'blank8', correctAnswers: ['center'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Logical Properties',
      description: 'Complete the CSS logical properties for internationalization',
      difficulty: 'hard',
      preferredCategory: 'ui',
      tags: ['css', 'properties', 'layout'],
      codeTemplate: `.international-text {
  margin-block-start: ___blank1___;
  margin-block-end: ___blank2___;
  margin-inline-start: ___blank3___;
  margin-inline-end: ___blank4___;
  
  padding-block: ___blank5___ ___blank6___;
  padding-inline: ___blank7___ ___blank8___;
  
  border-inline-start: ___blank9___ solid #ccc;
  border-inline-end: ___blank10___ solid #ccc;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['1rem', '16px', '10px'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['1rem', '16px', '10px'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['2rem', '20px', '1rem'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['2rem', '20px', '1rem'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['0.5rem', '8px', '10px'], caseSensitive: false, points: 1 },
        { id: 'blank6', correctAnswers: ['1rem', '16px', '10px'], caseSensitive: false, points: 1 },
        { id: 'blank7', correctAnswers: ['1rem', '16px', '15px'], caseSensitive: false, points: 1 },
        { id: 'blank8', correctAnswers: ['1.5rem', '20px', '24px'], caseSensitive: false, points: 1 },
        { id: 'blank9', correctAnswers: ['1px', '2px'], caseSensitive: false, points: 1 },
        { id: 'blank10', correctAnswers: ['1px', '2px'], caseSensitive: false, points: 1 }
      ]
    },
    {
      title: 'Complete CSS Modern Layout',
      description: 'Complete modern CSS layout using subgrid and aspect-ratio',
      difficulty: 'hard',
      preferredCategory: 'ui',
      tags: ['css', 'layout', 'grid'],
      codeTemplate: `.gallery {
  display: ___blank1___;
  grid-template-columns: ___blank2___(auto-fit, minmax(250px, 1fr));
  gap: ___blank3___;
}

.gallery-item {
  display: ___blank4___;
  grid-template-rows: ___blank5___;
}

.gallery-image {
  aspect-ratio: ___blank6___;
  object-fit: ___blank7___;
  width: ___blank8__%;
}

.gallery-content {
  padding: ___blank9___;
  display: ___blank10___;
  gap: ___blank11___;
}`,
      blanks: [
        { id: 'blank1', correctAnswers: ['grid'], caseSensitive: false, points: 1 },
        { id: 'blank2', correctAnswers: ['repeat'], caseSensitive: false, points: 1 },
        { id: 'blank3', correctAnswers: ['1rem', '20px', '16px'], caseSensitive: false, points: 1 },
        { id: 'blank4', correctAnswers: ['grid'], caseSensitive: false, points: 1 },
        { id: 'blank5', correctAnswers: ['subgrid', 'auto 1fr auto'], caseSensitive: false, points: 2 },
        { id: 'blank6', correctAnswers: ['16 / 9', '4 / 3', '1 / 1'], caseSensitive: false, points: 2 },
        { id: 'blank7', correctAnswers: ['cover', 'contain'], caseSensitive: false, points: 1 },
        { id: 'blank8', correctAnswers: ['100'], caseSensitive: false, points: 1 },
        { id: 'blank9', correctAnswers: ['1rem', '16px', '20px'], caseSensitive: false, points: 1 },
        { id: 'blank10', correctAnswers: ['flex'], caseSensitive: false, points: 1 },
        { id: 'blank11', correctAnswers: ['0.5rem', '8px', '10px'], caseSensitive: false, points: 1 }
      ]
    }
  ]
};

async function seedCssQuestions() {
  const startTime = Date.now();
  const validator = new QuestionSeedValidator();
  const processor = new BatchProcessor({ logProgress: true, batchSize: 15 });

  try {
    console.log('🚀 Starting COMPREHENSIVE CSS question seeding with enhanced validation...\n');

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
    const questionCounts = Object.entries(cssQuestions).map(([type, questions]) =>
      `${type}: ${questions.length}`
    ).join(', ');
    const totalQuestions = Object.values(cssQuestions).reduce((sum, arr) => sum + arr.length, 0);
    const fillInBlankCount = cssQuestions.fillInTheBlank.length;
    const totalBlanks = cssQuestions.fillInTheBlank.reduce((sum, q) => sum + q.blanks.length, 0);
    
    console.log(`📊 COMPREHENSIVE Question breakdown: ${questionCounts}`);
    console.log(`📈 Total questions to seed: ${totalQuestions}`);
    console.log(`🔥 Fill-in-blank questions: ${fillInBlankCount} with ${totalBlanks} total blanks`);
    console.log(`🎯 Difficulty distribution: Easy, Medium, Hard across all types\n`);

    // Create backup of existing questions
    const backup = await processor.createBackup('css');

    // Delete existing CSS questions
    await processor.deleteByLanguage('css');

    // Prepare all questions with proper templates
    console.log('🔧 Preparing questions with templates...');
    const allQuestions = [];

    for (const [type, questions] of Object.entries(cssQuestions)) {
      console.log(`  Processing ${questions.length} ${type} questions...`);

      for (const questionData of questions) {
        try {
          const templated = QuestionTemplateGenerator.createQuestionTemplate(
            { ...questionData, type, language: 'css', status: 'active' },
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
    console.log('🔍 Running COMPREHENSIVE validation with enhanced fill-in-blank testing...');
    const validationResults = await validator.validateBatch(allQuestions, {
      testAutoGrading: true // Includes comprehensive fill-in-blank grading validation
    });

    console.log('');
    validator.printValidationSummary();
    console.log('');

    // Insert valid questions
    if (validationResults.validQuestions.length > 0) {
      console.log(`📦 Inserting ${validationResults.validQuestions.length} valid questions...`);
      const insertResults = await processor.insertBatch(validationResults.validQuestions);

      processor.printProcessingSummary(insertResults, 'CSS');

      // Verify insertions
      if (insertResults.insertedIds.length > 0) {
        const verification = await processor.verifyInsertedQuestions(insertResults.insertedIds);
        console.log(`\n🔍 Verification: ${verification.found}/${insertResults.insertedIds.length} questions found in database`);
      }

      // Comprehensive success reporting
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n🎉 COMPREHENSIVE CSS question seeding completed successfully!');
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
      return await Question.find({ language: 'css' }).select('_id title type');

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
    console.error('💥 CSS seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedCssQuestions()
    .then((questions) => {
      console.log(`\n🎉 SUCCESS! Seeded ${questions.length} comprehensive CSS questions with enhanced validation!`);
      console.log(`🔥 Ready for production use with robust fill-in-blank validation!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed CSS questions:', error);
      process.exit(1);
    });
}

module.exports = { seedCssQuestions, cssQuestions };