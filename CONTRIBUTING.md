# Contributing to Tiny Tracker 🤝

Thank you for considering contributing to Tiny Tracker! We welcome contributions from everyone, whether you're fixing bugs, adding features, improving documentation, or suggesting enhancements.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful** - Treat everyone with respect and kindness
- **Be inclusive** - Welcome newcomers and diverse perspectives
- **Be constructive** - Focus on what's best for the community
- **Be patient** - Remember that everyone has different skill levels

## 🚀 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug fixes** - Fix issues and improve stability
- ✨ **New features** - Add functionality that benefits users
- 📚 **Documentation** - Improve guides, examples, and API docs
- 🎨 **UI/UX improvements** - Enhance the dashboard and user experience
- 🔧 **Code quality** - Refactoring, optimization, and cleanup
- 🧪 **Testing** - Add or improve test coverage
- 🌐 **Internationalization** - Add support for multiple languages

### Areas Where We Need Help

- **Performance optimization** - Make tracking faster and more efficient
- **Browser compatibility** - Ensure tracking works across all browsers
- **Privacy features** - Enhance GDPR compliance and privacy controls
- **Dashboard improvements** - Add more visualizations and filters
- **Export functionality** - Add data export in various formats
- **Real-time updates** - WebSocket support for live dashboard updates
- **Mobile optimization** - Improve mobile tracking and dashboard

## 🛠️ Development Setup

### Prerequisites

- Node.js 14+ and npm
- Git
- Text editor or IDE
- Modern web browser for testing

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/tiny-tracker.git
   cd tiny-tracker
   ```

2. **Add the original repository as upstream**
   ```bash
   git remote add upstream https://github.com/originalowner/tiny-tracker.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Verify everything works**
   - Visit http://localhost:8080
   - Navigate between pages
   - Check that tracking events appear in http://localhost:8080/stats

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   - Write code following our coding standards
   - Test your changes thoroughly
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add user session duration tracking"
   ```

4. **Keep your branch updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### JavaScript Style Guide

- Use **ES6+ features** where appropriate
- Use **const** and **let** instead of **var**
- Use **meaningful variable names**
- Add **comments** for complex logic
- Keep functions **small and focused**
- Use **async/await** for asynchronous operations

### Code Formatting

```javascript
// Good ✅
const trackingData = {
    eventType: 'click',
    elementTag: element.tagName.toLowerCase(),
    timestamp: Date.now()
};

// Avoid ❌
var data = {eventType:'click',elementTag:element.tagName.toLowerCase(),timestamp:Date.now()};
```

### Database Changes

- Always include migration logic for schema changes
- Use try/catch blocks for database operations
- Test with existing data to ensure backward compatibility

### Frontend Guidelines

- Keep HTML semantic and accessible
- Use CSS classes over inline styles
- Ensure responsive design principles
- Test across different browsers

## 📤 Submitting Changes

### Pull Request Process

1. **Ensure your PR addresses a specific issue or feature**
2. **Include a clear description** of what your changes do
3. **Add tests** if you're adding new functionality
4. **Update documentation** if you're changing behavior
5. **Ensure all checks pass** (linting, tests, etc.)

### PR Template

When creating a pull request, please include:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested these changes locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
```

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat: add real-time dashboard updates"

# Bug fix
git commit -m "fix: resolve CORS issue with credentials"

# Documentation
git commit -m "docs: update installation instructions"

# Refactor
git commit -m "refactor: simplify tracking event structure"

# Test
git commit -m "test: add unit tests for tracking functions"
```

## 🐛 Reporting Issues

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** for known limitations
3. **Test with the latest version**
4. **Reproduce the issue** with minimal steps

### Issue Template

```markdown
## Bug Description
A clear and concise description of what the bug is.

## To Reproduce
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear description of what you expected to happen.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Node.js version: [e.g. 18.0.0]
- Tiny Tracker version: [e.g. 1.0.0]

## Additional Context
Add any other context about the problem here.
```

## 💡 Feature Requests

We love hearing about new feature ideas! When suggesting a feature:

1. **Check existing feature requests** first
2. **Explain the use case** - why is this needed?
3. **Describe the solution** - how should it work?
4. **Consider alternatives** - are there other ways to solve this?
5. **Think about impact** - how would this affect existing users?

### Feature Request Template

```markdown
## Feature Description
A clear and concise description of the feature you'd like to see.

## Problem/Use Case
Explain the problem this feature would solve or the use case it addresses.

## Proposed Solution
Describe how you think this feature should work.

## Alternatives Considered
Describe any alternative solutions or features you've considered.

## Additional Context
Add any other context, mockups, or examples about the feature request.
```

## 🧪 Testing

### Manual Testing

Before submitting changes:

1. **Test core functionality**
   - Page view tracking works
   - Click tracking captures events
   - Dashboard displays data correctly
   - Time tracking functions properly

2. **Test edge cases**
   - Empty database
   - Large amounts of data
   - Network failures
   - Different browsers

3. **Test new features thoroughly**
   - Happy path scenarios
   - Error conditions
   - Integration with existing features

### Future: Automated Testing

We're working on adding automated tests. Areas we need help with:

- Unit tests for tracking functions
- Integration tests for API endpoints
- Browser automation tests
- Performance testing

## 📚 Documentation

### Types of Documentation

- **README.md** - Getting started guide
- **CONTRIBUTING.md** - This file
- **API documentation** - For developers integrating tracking
- **Code comments** - Inline documentation
- **Examples** - Sample implementations

### Documentation Guidelines

- Use clear, simple language
- Include code examples
- Add screenshots where helpful
- Keep information up-to-date
- Test all instructions

## 🎯 Development Priorities

### Current Focus Areas

1. **Performance optimization** - Reduce tracking overhead
2. **Privacy enhancements** - Better GDPR compliance
3. **Dashboard improvements** - More insights and visualizations
4. **Documentation** - Better guides and examples

### Future Roadmap

- **Real-time updates** - Live dashboard with WebSockets
- **Data export** - CSV, JSON export functionality
- **User management** - Multi-user support
- **Advanced analytics** - Funnels, cohorts, retention
- **Mobile SDKs** - Native mobile app tracking

## 🙋‍♀️ Getting Help

### Where to Ask Questions

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For general questions and community chat
- **Code Review** - Comment on pull requests for specific code questions

### Response Times

- We aim to respond to issues within **48 hours**
- Pull requests are typically reviewed within **1 week**
- Complex features may take longer to review

## 🎉 Recognition

Contributors will be:

- **Added to our contributors list** in README.md
- **Mentioned in release notes** for their contributions
- **Given credit** in commit messages and PR descriptions

## 📜 License

By contributing to Tiny Tracker, you agree that your contributions will be licensed under the same [ISC License](LICENSE) that covers the project.

---

**Thank you for contributing to Tiny Tracker! 🚀**

Every contribution, no matter how small, helps make this project better for everyone. We appreciate your time and effort in improving privacy-focused analytics for the web.

Happy coding! 💻✨