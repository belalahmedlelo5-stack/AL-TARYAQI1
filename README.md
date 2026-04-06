# Al-Taryaqi Labs Marketplace

منصة الطريقي لربط المعامل الطبية بالموردين - تطبيق Next.js احترافي

## 🏗️ Architecture Overview

This is a production-ready Next.js application with the following architecture:

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (routes)/           # Route groups
│   │   ├── doctor/             # Doctor dashboard pages
│   │   ├── supplier/           # Supplier dashboard pages
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── login/              # Authentication page
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home/redirect page
│   │   ├── not-found.tsx       # 404 page
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components
│   │   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   │   ├── Topbar.tsx      # Header/top navigation
│   │   │   └── MainLayout.tsx  # Main layout wrapper
│   │   ├── ResponsiveTable.tsx # Mobile-responsive table
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   └── ProtectedRoutes.tsx # Route guards
│   │
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── ToastContext.tsx    # Toast notifications
│   │
│   ├── hooks/                  # Custom React hooks
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── supabase.ts         # Supabase client & DB helpers
│   │   └── utils.ts            # Utility functions
│   │
│   ├── types/                  # TypeScript types
│   │   ├── index.ts            # Main types
│   │   └── database.ts         # Supabase database types
│   │
│   └── middleware.ts           # Next.js middleware for auth
│
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## 🚀 Features

### ✅ Implemented

1. **Authentication & Security**
   - JWT-based authentication
   - Role-based access control (Doctor, Supplier, Admin)
   - Route guards and middleware protection
   - Secure cookie handling

2. **State Management**
   - React Context API for global state
   - AuthContext for user authentication
   - ToastContext for notifications

3. **Responsive UI**
   - Mobile-first design
   - Card-based layouts for mobile
   - Responsive tables with data-label attributes
   - RTL (Right-to-Left) support for Arabic

4. **Performance & SEO**
   - Next.js 14 with App Router
   - Server-side rendering (SSR)
   - Lazy loading with dynamic imports
   - Optimized fonts (Cairo, Tajawal) with display=swap
   - Comprehensive metadata for SEO

5. **Error Handling**
   - Global error boundaries
   - Loading skeletons for async operations
   - Toast notification system

6. **Database Integration**
   - Supabase client setup
   - Type-safe database operations
   - Real-time subscriptions ready

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd al-taryaqi-marketplace

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret (for production)
JWT_SECRET=your-jwt-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Database Schema

### Tables

1. **users** - User accounts
   - id, name, email, role, avatar, joined, last_active, orders, rating, is_verified

2. **orders** - Orders from doctors
   - id, doctor_id, status, products, notes, offers, selected_suppliers, payment_method, total

3. **offers** - Supplier offers on orders
   - id, order_id, supplier_id, items, submitted, delivery_code

4. **featured_products** - Supplier featured products
   - id, supplier_id, name, brand, price, description, image

5. **transactions** - Payment transactions
   - id, order_id, user_id, amount, fees, total, method, status

6. **notifications** - User notifications
   - id, user_id, title, message, type, is_read

7. **ratings** - User ratings
   - id, order_id, from_user_id, to_user_id, rating, comment

8. **violations** - Security violations
   - id, user_id, reason, preview, text, flagged

9. **live_notes** - Admin monitoring notes
   - id, user_id, text, flagged

## 👥 User Roles

### Doctor (طبيب)
- Create new orders
- View order status
- Receive and compare supplier offers
- Smart basket (automatic best price selection)
- Make payments
- Rate suppliers
- View transaction history

### Supplier (تاجر)
- View market orders
- Submit offers on orders
- Manage featured products
- View income reports
- Track order delivery

### Admin (مالك)
- Dashboard overview
- Monitor all orders
- User management
- Supplier management
- Commission tracking
- Violation monitoring
- Live notes monitoring

## 🎨 Design System

### Colors
- Primary: `#12b89a` (Teal)
- Secondary: `#0f1f38` (Navy)
- Accent: `#c5941f` (Gold)
- Success: `#276749`
- Warning: `#b7791f`
- Danger: `#c53030`

### Typography
- Primary Font: Cairo
- Secondary Font: Tajawal
- Base Size: 18px (desktop), 16px (mobile)

### Spacing
- Border Radius: 14px (cards), 10px (buttons)
- Sidebar Width: 270px
- Topbar Height: 72px

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Security Features

1. **Content Security**
   - Phone number filtering in notes
   - Blocked keywords detection
   - Violation logging

2. **Authentication**
   - JWT tokens with expiration
   - Secure cookie settings
   - Role-based route protection

3. **Data Protection**
   - Input sanitization
   - XSS prevention
   - CSRF protection via SameSite cookies

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build test
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📄 License

MIT License - Al-Taryaqi Labs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, email support@altaryaqi.com or join our Slack channel.

---

<p align="center">
  <strong>Al-Taryaqi Labs Marketplace</strong><br>
  Connecting Medical Labs with Suppliers
</p>
