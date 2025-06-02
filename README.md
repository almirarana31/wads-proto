# 🏥 Bianca Aesthetic Clinic Helpdesk System

A comprehensive ticketing system designed for Bianca Aesthetic Clinic to manage customer support requests efficiently. This full-stack application provides role-based access control, real-time conversations, and an AI-powered chatbot assistant.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles & Permissions](#user-roles--permissions)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Environment Configuration](#environment-configuration)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

The Bianca Aesthetic Clinic Helpdesk System is a modern, responsive web application that streamlines customer support operations. It supports multiple user types from guests to administrators, providing a seamless experience for ticket submission, management, and resolution.

### Key Highlights

- **Guest-Friendly**: Allows ticket submission without registration
- **AI-Powered**: Google Gemini AI chatbot for automated assistance
- **Real-Time Communication**: Live conversations between customers and staff
- **Role-Based Access**: Secure, hierarchical permission system
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Audit Trail**: Complete logging of all system activities

## ✨ Features

### 🎯 Core Features

#### For Guests & Customers
- **Ticket Submission**: Submit support requests without requiring registration
- **Account Registration**: Optional registration for enhanced features
- **Ticket Tracking**: View and manage personal tickets
- **Real-Time Chat**: Live conversations with support staff
- **Email Notifications**: Automatic updates on ticket status
- **AI Chatbot**: 24/7 automated assistance and ticket creation

#### For Staff Members
- **Ticket Queue**: Access to shared pool of unassigned tickets
- **Ticket Claiming**: Self-assign tickets from the queue (max 5 active)
- **Conversation Management**: Start and manage customer conversations
- **Ticket Resolution**: Mark tickets as resolved or cancelled
- **Internal Notes**: Add private notes visible only to staff/admin
- **Dashboard Analytics**: Personal performance metrics
- **Category Specialization**: Handle tickets in specific areas (General, Billing, IT Support)

#### For Administrators
- **Complete Oversight**: View and manage all tickets in the system
- **Staff Management**: Create, edit, and deactivate staff accounts
- **Ticket Assignment**: Manually assign tickets to specific staff members
- **System Analytics**: Comprehensive dashboard with performance metrics
- **Audit Logs**: Complete history of all system activities
- **Staff Performance**: Monitor resolution rates and workload distribution
- **Priority Management**: Update ticket priorities and categories

### 🤖 AI Chatbot Features
- **Natural Language Processing**: Powered by Google Gemini 2.0 Flash
- **Intelligent Ticket Creation**: Automatically extracts information to create tickets
- **Context Awareness**: Maintains conversation history for relevant responses
- **Multi-User Support**: Works for both guests and registered users
- **Fallback Support**: Seamlessly transitions to human support when needed

### 🔄 Ticket Lifecycle
1. **Pending**: Newly created tickets awaiting assignment
2. **In Progress**: Tickets actively being worked on by staff
3. **Resolved**: Successfully completed tickets
4. **Cancelled**: Tickets cancelled by staff or admin

### 📊 Analytics & Reporting
- **Ticket Status Distribution**: Real-time overview of system status
- **Staff Performance Metrics**: Resolution rates and workload tracking
- **Category Analysis**: Distribution of tickets by type
- **Priority Tracking**: Monitoring of high/medium/low priority tickets

## 🛠 Technology Stack

### Frontend
- **React 18.2.0**: Modern UI framework with hooks
- **React Router Dom**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communications
- **Lucide React**: Modern icon library
- **Storybook**: Component development and documentation

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express 5.1.0**: Web application framework
- **Sequelize 6.37.7**: PostgreSQL ORM
- **JWT**: JSON Web Token authentication
- **bcrypt**: Password hashing
- **Google Generative AI**: Chatbot powered by Gemini 2.0 Flash
- **Swagger**: API documentation

### Database
- **PostgreSQL**: Primary database for data persistence
- **Sequelize Migrations**: Database version control

### Additional Tools
- **Nodemailer**: Email notifications
- **Node-cron**: Scheduled tasks for ticket escalation
- **Cookie-parser**: Session management
- **CORS**: Cross-origin resource sharing
- **ESLint**: Code quality and consistency

## 🏗 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • User Interface│    │ • REST API      │    │ • User Data     │
│ • State Mgmt    │    │ • Authentication│    │ • Ticket Data   │
│ • Routing       │    │ • Business Logic│    │ • Audit Logs    │
│ • Components    │    │ • Chatbot AI    │    │ • Conversations │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                       ┌───────┴───────┐
                       │  External APIs │
                       │               │
                       │ • Google AI   │
                       │ • Email SMTP  │
                       └───────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn** package manager
- **Google AI API Key** (for chatbot functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wads-proto
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb bianca_helpdesk

   # Configure environment variables (see Environment Configuration)
   # Run database migrations
   cd backend
   npm run migrate  # If migration scripts exist
   ```

4. **Environment Configuration**
   
   Create `.env` file in the backend directory:
   ```env
   # Database Configuration
   DB_NAME=bianca_helpdesk
   DB_USER=your_postgres_user
   DB_PASS=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_DIALECT=postgres
   DB_SSL=false

   # JWT Configuration
   ACCESS_TOKEN_SECRET=your_jwt_secret_key
   REFRESH_TOKEN_SECRET=your_refresh_token_secret

   # Google AI Configuration
   GEMINI_API_KEY=your_google_ai_api_key

   # Email Configuration (for notifications)
   EMAIL_HOST=your_smtp_host
   EMAIL_PORT=587
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_password

   # Server Configuration
   PORT=3001
   ```

5. **Start the Development Servers**
   ```bash
   # Terminal 1: Start Backend Server
   cd backend
   npm start
   # Server runs on http://localhost:3001

   # Terminal 2: Start Frontend Development Server
   cd frontend
   npm start
   # Application runs on http://localhost:3000
   ```

6. **Access the Application**
   - **Main Application**: http://localhost:3000
   - **API Documentation**: http://localhost:3001/api-docs
   - **Chatbot Test Page**: http://localhost:3000/chatbot-test.html

## 📁 Project Structure

```
wads-proto/
├── README.md                    # This file
├── package.json                 # Root dependencies
├── eslint.config.mjs           # ESLint configuration
├── backend/                     # Backend application
│   ├── package.json
│   ├── index.js                 # Server entry point
│   ├── server.js               # Alternative server file
│   ├── swagger.json            # API documentation
│   ├── config/
│   │   └── sequelize.js        # Database configuration
│   ├── controllers/            # Business logic
│   │   ├── admin.js            # Admin operations
│   │   ├── audit.js            # Audit logging
│   │   ├── chatbot.js          # AI chatbot logic
│   │   ├── conversation.js     # Chat management
│   │   ├── staff.js            # Staff operations
│   │   ├── ticket.js           # Ticket management
│   │   └── user.js             # User management
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── models/                 # Database models
│   │   ├── index.js            # Model relationships
│   │   ├── User.js
│   │   ├── Staff.js
│   │   ├── Ticket.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   ├── Assignment.js
│   │   ├── Audit.js
│   │   └── enum/               # Enumeration models
│   │       ├── Category.js
│   │       ├── Status.js
│   │       ├── Priority.js
│   │       ├── Role.js
│   │       └── Job.js
│   ├── routes/                 # API routes
│   │   ├── admin_routes.js
│   │   ├── staff_routes.js
│   │   ├── user_routes.js
│   │   ├── ticket_routes.js
│   │   ├── conversation_routes.js
│   │   ├── chatbot_routes.js
│   │   └── audit_routes.js
│   └── utils/
│       └── sendEmail.js        # Email utilities
├── frontend/                   # Frontend application
│   ├── package.json
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js
│   ├── chatbot-test.html       # Standalone chatbot test
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js              # Main application component
│       ├── index.js            # React entry point
│       ├── App.css
│       ├── index.css
│       ├── api/                # API service layer
│       │   ├── authService.js  # Authentication API
│       │   ├── axios.js        # HTTP client configuration
│       │   └── chatbotService.js
│       ├── assets/             # Static assets
│       │   └── Logo-Bianca-Clinic-Timeless-Beauty-Blue-1270x812.png
│       ├── components/         # Reusable UI components
│       │   ├── AssignStaffModal.js
│       │   ├── Chatbot.js      # AI chatbot component
│       │   ├── ChatBubble.js
│       │   ├── ConversationCard.js
│       │   ├── Header.js
│       │   ├── Footer.js
│       │   ├── Modal.js
│       │   ├── PriorityPill.js
│       │   ├── StatusPill.js
│       │   ├── TicketCard.js
│       │   ├── TicketDetailsCard.js
│       │   ├── buttons/        # Button components
│       │   │   ├── PrimaryButton.js
│       │   │   ├── SecondaryButton.js
│       │   │   └── DangerButton.js
│       │   └── text/           # Typography components
│       ├── context/            # React Context providers
│       │   ├── AuthContext.js
│       │   └── TicketContext.js
│       ├── pages/              # Page components
│       │   ├── HomePage.js
│       │   ├── LoginPage.js
│       │   ├── SignUpPage.js
│       │   ├── SubmitTicketPage.js
│       │   ├── ViewTicketsPage.js
│       │   ├── TicketDetailsPage.js
│       │   ├── Chatroom.js
│       │   ├── StaffDashPage.js
│       │   ├── StaffTicketQueuePage.js
│       │   ├── StaffTicketView.js
│       │   ├── AdminDashPage.js
│       │   ├── AdminTicketView.js
│       │   └── AuditLogPage.js
│       └── stories/            # Storybook stories
│           └── *.stories.js
```

## 👥 User Roles & Permissions

### 🔓 Guest Users
- Submit tickets without registration
- Receive email notifications
- Access AI chatbot for immediate assistance
- No persistent dashboard access

### 👤 Registered Customers (USR)
- All guest capabilities plus:
- Personal ticket dashboard
- Real-time conversation with staff
- Ticket history and tracking
- Edit pending tickets
- Account management

### 👨‍💼 Staff Members (STF)
- Access to ticket queue in their specialization area
- Claim tickets (maximum 5 active tickets)
- Start and manage conversations with customers
- Add internal notes to tickets
- Resolve or cancel tickets
- View personal performance metrics
- Specialization areas:
  - **General**: General inquiries and clinic questions
  - **Billing**: Payment issues and billing concerns
  - **IT Support**: Technical problems and system issues

### 👨‍💻 Administrators (ADM)
- Complete system access and oversight
- Manage all tickets regardless of category
- Create and manage staff accounts
- Manually assign tickets to staff
- View comprehensive system analytics
- Access audit logs
- Update ticket priorities and status
- Monitor staff performance
- System configuration capabilities

## 🔗 API Documentation

The API follows RESTful principles and includes comprehensive Swagger documentation.

### Base URL
```
http://localhost:3001/api
```

### Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

#### Tickets
- `GET /api/tickets` - Get tickets (role-based filtering)
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

#### Staff Operations
- `GET /api/staff/tickets` - Get assigned tickets
- `GET /api/staff/pool` - Get ticket pool
- `POST /api/staff/claim` - Claim ticket from pool
- `PUT /api/staff/resolve/:id` - Resolve ticket

#### Admin Operations
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/staff` - Staff performance metrics
- `POST /api/admin/staff` - Create staff account
- `PUT /api/admin/assign/:ticketId` - Assign ticket to staff

#### Conversations
- `GET /api/conversations/:ticketId` - Get ticket conversations
- `POST /api/conversations` - Create new conversation
- `POST /api/conversations/:id/messages` - Send message
- `PUT /api/conversations/:id/close` - Close conversation

#### Chatbot
- `POST /api/chatbot/message` - Send message to AI chatbot

### Complete API Documentation
Visit `http://localhost:3001/api-docs` when the server is running for interactive Swagger documentation.

## 🗄 Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    staff_id INTEGER REFERENCES staff(id),
    is_guest BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Staff
```sql
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES role(id),
    field_id INTEGER REFERENCES category(id),
    job_id INTEGER REFERENCES job(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tickets
```sql
CREATE TABLE ticket (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id),
    staff_id INTEGER REFERENCES staff(id),
    category_id INTEGER NOT NULL REFERENCES category(id),
    priority_id INTEGER REFERENCES priority(id),
    status_id INTEGER NOT NULL REFERENCES status(id),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    note VARCHAR(255),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Enumeration Tables

#### Categories
- **General** (ID: 1): General inquiries and clinic questions
- **Billing** (ID: 2): Payment issues and billing concerns  
- **IT Support** (ID: 3): Technical problems and system issues

#### Status
- **Pending** (ID: 1): Waiting to be assigned to staff
- **In Progress** (ID: 2): Staff is working on resolving the ticket
- **Resolved** (ID: 3): Ticket has been resolved
- **Cancelled** (ID: 4): Ticket has been cancelled

#### Priority
- **High** (ID: 1): Urgent issues requiring immediate attention
- **Medium** (ID: 2): Standard priority issues
- **Low** (ID: 3): Non-urgent issues

#### Roles
- **STF** (ID: 1): Staff members who handle ticket resolutions
- **ADM** (ID: 2): Administrators who manage the system

### Relationship Overview
- Users can have multiple tickets
- Staff members are specialized in specific categories
- Tickets progress through different statuses
- Conversations link tickets with real-time messaging
- Audit logs track all system changes

## ⚙️ Environment Configuration

### Required Environment Variables

#### Database Configuration
```env
DB_NAME=bianca_helpdesk          # PostgreSQL database name
DB_USER=postgres                 # Database username
DB_PASS=your_password           # Database password
DB_HOST=localhost               # Database host
DB_PORT=5432                    # Database port
DB_DIALECT=postgres             # Database type
DB_SSL=false                    # SSL connection (true for production)
```

#### Security Configuration
```env
ACCESS_TOKEN_SECRET=your_very_long_random_string_here
REFRESH_TOKEN_SECRET=another_very_long_random_string_here
```

#### AI Chatbot Configuration
```env
GEMINI_API_KEY=your_google_ai_api_key_here
```
*Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)*

#### Email Configuration
```env
EMAIL_HOST=smtp.gmail.com       # SMTP server
EMAIL_PORT=587                  # SMTP port
EMAIL_USER=your_email@gmail.com # Email address
EMAIL_PASS=your_app_password    # Email password or app password
```

#### Server Configuration
```env
PORT=3001                       # Backend server port
NODE_ENV=development            # Environment (development/production)
```

### Development vs Production

#### Development
- Set `NODE_ENV=development`
- Use local PostgreSQL instance
- Enable detailed logging
- CORS allows all origins

#### Production
- Set `NODE_ENV=production`
- Use secure database connections (`DB_SSL=true`)
- Implement proper CORS policies
- Use environment-specific secrets
- Enable database connection pooling

## 🔧 Development Commands

### Backend
```bash
cd backend

# Start development server
npm start

# Start with nodemon (auto-restart)
npm run dev

# Run tests
npm test

# Database operations
npm run migrate         # Run migrations
npm run seed           # Seed database with default data
```

### Frontend
```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook

# Lint code
npm run lint
```

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Professional blue theme matching Bianca Clinic branding
- **Typography**: Playfair Display for headings, Montserrat for body text
- **Components**: Consistent button styles, form inputs, and feedback messages
- **Responsive**: Mobile-first design approach

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus indicators

### Performance Optimizations
- Code splitting with React lazy loading
- Optimized images and assets
- Efficient state management
- Minimal bundle size with tree shaking

## 🚦 Testing

### Frontend Testing
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: User journey testing (future implementation)

### Backend Testing
- **API Tests**: Endpoint testing with proper error handling
- **Database Tests**: Model validation and relationship testing
- **Security Tests**: Authentication and authorization testing

### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Session management with secure cookies

### Data Protection
- Input validation and sanitization
- SQL injection prevention with Sequelize ORM
- XSS protection
- CORS configuration
- Rate limiting (recommended for production)

### Security Headers
- Helmet.js for security headers (recommended)
- HTTPS enforcement in production
- Secure cookie configuration

## 📈 Monitoring & Analytics

### Built-in Analytics
- **Ticket Metrics**: Status distribution, resolution times
- **Staff Performance**: Resolution rates, workload distribution
- **System Usage**: User activity, popular categories
- **Audit Trail**: Complete activity logging

### Performance Monitoring
- Database query optimization
- API response time tracking
- Error logging and reporting
- Resource usage monitoring

## 🔄 Deployment

### Production Deployment Checklist

1. **Environment Setup**
   - Configure production environment variables
   - Set up PostgreSQL database
   - Configure email service
   - Obtain Google AI API key

2. **Security Configuration**
   - Enable HTTPS
   - Configure CORS for production domains
   - Set secure cookie options
   - Implement rate limiting

3. **Database Migration**
   - Run production migrations
   - Seed initial data (categories, statuses, etc.)
   - Set up database backups

4. **Frontend Build**
   ```bash
   cd frontend
   npm run build
   ```

5. **Process Management**
   - Use PM2 or similar for process management
   - Configure automatic restarts
   - Set up health checks

### Deployment Platforms
- **Frontend**: Netlify, Vercel, or traditional web hosting
- **Backend**: Heroku, AWS EC2, DigitalOcean, or similar
- **Database**: AWS RDS, Google Cloud SQL, or managed PostgreSQL

## 🤝 Contributing

### Development Guidelines

1. **Code Style**
   - Follow ESLint configuration
   - Use meaningful variable and function names
   - Add comments for complex logic
   - Follow React best practices

2. **Git Workflow**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature-name
   
   # Make changes and commit
   git add .
   git commit -m "feat: add new feature description"
   
   # Push and create pull request
   git push origin feature/new-feature-name
   ```

3. **Pull Request Process**
   - Ensure all tests pass
   - Update documentation if needed
   - Request code review
   - Address feedback before merging

### Feature Development
- Follow existing code patterns
- Add appropriate tests
- Update API documentation
- Consider mobile responsiveness

## 📝 License

This project is proprietary software developed for Bianca Aesthetic Clinic. All rights reserved.

## 📞 Support

For technical support or questions about this system:

- **Developer**: Contact the development team
- **System Administrator**: Contact your system administrator
- **Clinic Staff**: Refer to the user manual or contact IT support

## 🔄 Version History

### v0.1.0 (Current)
- Initial release with core functionality
- Basic ticket management system
- AI chatbot integration
- Role-based access control
- Real-time conversations
- Responsive web interface

### Planned Features
- Mobile application
- Advanced analytics dashboard
- Integration with clinic management systems
- Multi-language support
- Advanced reporting capabilities
- Automated ticket routing
- SLA monitoring and alerts

---

**Built with ❤️ for Bianca Aesthetic Clinic**

*This documentation serves as a comprehensive guide for developers, administrators, and users of the Bianca Aesthetic Clinic Helpdesk System. For the most up-to-date information, please refer to the latest version of this documentation.*
