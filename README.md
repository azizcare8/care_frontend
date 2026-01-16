# Care Foundation Frontend

A modern, responsive crowdfunding platform frontend built with Next.js, React, and Tailwind CSS, fully integrated with the Care Foundation Backend API.

## 🚀 Features

### ✅ Completed Features
- **Authentication System**: Login, Register, Forgot Password with backend integration
- **Dynamic Data Loading**: All components now use real data from backend API
- **State Management**: Zustand for global state management
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Dynamic campaign and donation data
- **User Dashboard**: Personalized dashboard for authenticated users
- **API Integration**: Complete backend integration with error handling

### 🔧 Technical Stack
- **Framework**: Next.js 15.5.4
- **Language**: JavaScript (converted from TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: React Icons, Heroicons
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Care Foundation Backend running on port 5000

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=Care Foundation
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment Gateway Configuration (for frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Cloudinary Configuration (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # User dashboard
│   ├── login/            # Login page
│   ├── layout.jsx        # Root layout
│   └── page.jsx          # Home page
├── components/           # React components
│   ├── admin/           # Admin components
│   ├── AuthForm.jsx     # Authentication form
│   ├── Banner.jsx       # Hero banner
│   ├── NavBar.jsx       # Navigation bar
│   ├── TrendingFundraisers.jsx # Campaign listings
│   └── ...              # Other components
├── services/            # API service functions
│   ├── authService.js   # Authentication API calls
│   ├── campaignService.js # Campaign API calls
│   ├── donationService.js # Donation API calls
│   └── couponService.js # Coupon API calls
├── store/               # Zustand state stores
│   ├── authStore.js     # Authentication state
│   ├── campaignStore.js # Campaign state
│   └── donationStore.js # Donation state
└── utils/               # Utility functions
    └── api.js           # Axios configuration
```

## 🔄 API Integration

### Authentication Flow
1. **Login/Register**: Users can authenticate via AuthForm component
2. **Token Management**: JWT tokens stored in cookies
3. **Auto-redirect**: Authenticated users redirected to dashboard
4. **Logout**: Complete session cleanup

### Dynamic Data Loading
- **Campaigns**: Real-time campaign data from backend
- **Donations**: User donation history and statistics
- **User Profile**: Dynamic user information
- **Analytics**: Real-time campaign and donation analytics

### State Management
- **Auth Store**: User authentication state
- **Campaign Store**: Campaign data and operations
- **Donation Store**: Donation data and operations

## 🎨 Component Features

### AuthForm Component
- **Multi-tab Interface**: Login, Register, Forgot Password
- **Form Validation**: Client-side validation with error handling
- **Backend Integration**: Real API calls with loading states
- **Responsive Design**: Mobile-friendly interface

### TrendingFundraisers Component
- **Dynamic Data**: Loads real campaigns from backend
- **Loading States**: Skeleton loading for better UX
- **Interactive Elements**: Click to view, share, donate
- **Fallback Data**: Shows sample data if API fails

### NavBar Component
- **Authentication Aware**: Shows different options for logged-in users
- **Responsive Menu**: Mobile hamburger menu
- **Dynamic User Info**: Displays user name when logged in
- **Logout Functionality**: Complete session cleanup

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🌐 Pages & Routes

- `/` - Home page with dynamic campaign data
- `/login` - Authentication page
- `/dashboard` - User dashboard (protected)
- `/campaigns` - Campaign listings
- `/donate` - Donation page
- `/volunteer` - Volunteer registration
- `/partner` - Partner registration

## 🔒 Authentication

### User Roles
- **Donor**: Can make donations and view history
- **Fundraiser**: Can create and manage campaigns
- **Partner**: Can offer services and coupons
- **Admin**: Full system access

### Protected Routes
- Dashboard requires authentication
- Campaign creation requires fundraiser role
- Admin features require admin role

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive design for tablets
- **Desktop Enhanced**: Enhanced features for desktop
- **Touch Friendly**: Touch-optimized interactions

## 🎯 Key Features

### Real-time Data
- Campaign progress updates
- Donation statistics
- User activity tracking
- Live notifications

### User Experience
- Loading states and skeletons
- Error handling with user-friendly messages
- Toast notifications for actions
- Smooth animations and transitions

### Performance
- Optimized images with Next.js Image component
- Lazy loading for better performance
- Efficient state management
- API request optimization

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_URL`: Frontend URL

### Build Process
```bash
npm run build
npm run start
```

## 🤝 Integration with Backend

The frontend is fully integrated with the Care Foundation Backend API:

- **Authentication**: JWT-based authentication
- **Campaigns**: Full CRUD operations
- **Donations**: Payment processing integration
- **Users**: Profile management
- **Coupons**: Advanced coupon system
- **Analytics**: Real-time statistics

## 📞 Support

For support and questions:
- Check the backend API documentation
- Review the component documentation
- Check browser console for errors
- Verify environment configuration

---

**Note**: This frontend is fully converted from TypeScript to JavaScript and integrated with the backend API for dynamic data loading.