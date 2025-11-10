# Contributing to AI Creator Space

Thank you for your interest in contributing to AI Creator Space! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ai-Creator-Space
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Code Quality

### Linting and Formatting

We use ESLint and Prettier to maintain code quality:

```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

### Testing

We use Vitest for testing:

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Coding Guidelines

### TypeScript
- Use TypeScript for all new files
- Enable strict mode compliance
- Avoid using `any` type when possible
- Use proper type definitions for all function parameters and return values

### React
- Use functional components with hooks
- Use proper prop types with TypeScript interfaces
- Follow React best practices and hooks rules
- Implement error boundaries for critical components

### Styling
- Use Tailwind CSS for styling
- Follow the existing design system (glassmorphism, dark/light theme)
- Ensure responsive design (mobile-first approach)

### Accessibility
- Use semantic HTML elements
- Add proper ARIA labels
- Implement keyboard navigation
- Test with screen readers

## Project Structure

```
Ai-Creator-Space/
├── App.tsx              # Main application component
├── index.tsx            # React entry point
├── types.ts             # TypeScript type definitions
├── services/
│   └── geminiService.ts # Gemini API integration
├── tests/               # Test files
│   ├── setup.ts        # Test configuration
│   ├── types.test.ts   # Type tests
│   └── geminiService.test.ts # Service tests
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── vitest.config.ts     # Vitest configuration
├── tsconfig.json        # TypeScript configuration
├── eslint.config.js     # ESLint configuration
└── .prettierrc          # Prettier configuration
```

## Adding New Features

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement your feature**
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: description of your feature"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Commit Message Convention

We follow the Conventional Commits specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: add project export functionality`

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Follow the code quality guidelines
4. Request review from maintainers
5. Address review feedback
6. Once approved, maintainers will merge your PR

## Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

## Questions?

If you have questions, feel free to:
- Open an issue with the `question` label
- Check existing documentation
- Review closed issues for similar questions

Thank you for contributing! 🎉
